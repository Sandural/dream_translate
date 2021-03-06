'use strict'

/**
 * Dream Translate
 * https://github.com/ryanker/dream_translate
 * @Author Ryan <dream39999@gmail.com>
 * @license MIT License
 */

function longmanDictionary() {
    return {
        init() {
            return this
        },
        unify(r, q) {
            // console.log(r)
            // let arr = r.match(/<div class="dictionary">([\s\S]*?)<\/div><!-- End of DIV dictionary-->/m)
            // console.log(arr)
            let el = r.querySelector('.dictionary')
            if (!el) {
                el = r.querySelector('.page_content')
                if (!el) return {text: q, html: 'Failed to get data!'}

                let html = ''
                let tEl = el.querySelector('.search_title')
                if (tEl) html += `<div><b>${tEl.innerText}</b></div>`
                el.querySelectorAll('.didyoumean > li > a').forEach(e => {
                    let href = e.getAttribute('href')
                    html += `<div data-search="true" _href="${href}">${e.innerText}</div>`
                })
                return {text: q, html: html}
            }

            // 音标
            let headEl = el.querySelector('.Head')
            headEl.querySelector('.PronCodes > .AMEVARPRON > .neutral')?.remove()
            let ukPron = headEl.querySelector('.PronCodes > .PRON')?.innerText?.trim()
            let usPron = headEl.querySelector('.PronCodes > .AMEVARPRON')?.innerText?.trim()
            headEl.querySelector('.PronCodes')?.remove()
            let phonetic = {}
            if (ukPron) phonetic.uk = ukPron
            if (usPron) phonetic.us = usPron

            // 发音
            let sound = []
            headEl.querySelectorAll('[data-src-mp3]').forEach(e => {
                let title = e.getAttribute('title')
                let src = e.getAttribute('data-src-mp3')
                if (title && src) {
                    if (title.includes('British')) sound.push({type: 'uk', title: title, url: src})
                    else if (title.includes('American')) sound.push({type: 'us', title: title, url: src})
                }
                e.remove()
            })

            // 喇叭
            el.querySelectorAll('[data-src-mp3]').forEach(e => {
                e.className = 'dmx-icon dmx_ripple'
                let v = 'en'
                let title = e.getAttribute('title')
                if (title) {
                    if (title.includes('British')) v = 'uk'
                    else if (title.includes('American')) v = 'us'
                }
                e.setAttribute('data-type', v)
            })

            // 图片
            el.querySelectorAll('img').forEach(e => {
                e.setAttribute('referrerPolicy', 'no-referrer')
            })

            // 链接
            el.querySelectorAll('a').forEach(e => {
                let href = e.getAttribute('href')
                let s = q.replace(/\W/g, '-')
                if (e.className === 'crossRef' && href.includes(`/dictionary/${s}#${s}`)) {
                    e.remove() // 清理掉本页跳转链接
                    return
                }
                e.setAttribute('_href', href)
                e.removeAttribute('href')
                e.setAttribute('data-search', 'true')
            })

            // 清理
            el.querySelectorAll('[id]').forEach(e => {
                e.removeAttribute('id')
            })
            el.querySelectorAll('script,style,.dictionary_intro').forEach(e => {
                e.remove()
            })
            el.className = 'longman_dict'
            return {text: q, phonetic: phonetic, sound: sound, html: el.outerHTML}
        },
        query(q) {
            return new Promise((resolve, reject) => {
                if (q.length > 100) return reject('The text is too large!')
                let url = `https://www.ldoceonline.com/search/english/direct/?q=${encodeURIComponent(q)}`
                // q = q.trim().replace(/\s+/g, ' ').replace(/\W/g, '-')
                // let url = `https://www.ldoceonline.com/dictionary/${q}`
                httpGet(url, 'document').then(r => {
                    if (r) {
                        resolve(this.unify(r, q))
                    } else {
                        reject('longman error!')
                    }
                }).catch(e => {
                    reject(e)
                })
            })
        },
        link(q) {
            // return `https://www.ldoceonline.com/dictionary/${encodeURIComponent(q)}`
            return `https://www.ldoceonline.com/search/english/direct/?q=${encodeURIComponent(q)}`
        },
    }
}
