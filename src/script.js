// ==UserScript==
// @name         F95zone - Followed Games
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/F95zone-Followed-Games/raw/master/F95zone-Followed-Games.user.js
// @version      1.1.0
// @author       LenAnderson
// @match        https://f95zone.to/followed-games
// @match        https://f95zone.to/threads/*
// @grant        none
// ==/UserScript==

(()=>{
	'use strict';

	const log = (...msgs)=>console.log.call(console.log, '[FFG]', ...msgs);
	
	
	const $ = (query)=>document.querySelector(query);
	const $$ = (query)=>Array.from(document.querySelectorAll(query));


	const get = (url) => {
		return new Promise((resolve,reject)=>{
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.addEventListener('load', ()=>{
				resolve(xhr.responseText);
			});
			xhr.addEventListener('error', ()=>{
				reject(xhr);
			});
			xhr.send();
		});
	};
	const getHtml = (url) => {
		return get(url).then(txt=>{
			const html = document.createElement('div');
			html.innerHTML = txt;
			return html;
		});
	};


	const wait = async(millis)=>new Promise(resolve=>setTimeout(resolve, millis));




	${include: GamesMonitor.js}
	if (location.href == 'https://f95zone.to/followed-games') {
		const app = new GamesMonitor();
	} else if (location.href.search(/(https:\/\/f95zone.to\/threads\/)[^\/]+(\.\d+\/)/) == 0) {
		log('add btn');
		const watch = $('.rippleButton[data-sk-watch]');
		if (watch) {
			log('yup');
			const url = location.href.replace(/(https:\/\/f95zone.to\/threads\/)[^\/]+(\.\d+\/)/, '$1$2');
			let games = JSON.parse(localStorage.getItem('ffg-games') || '[]');
			let followed = false;
			if (games.filter(it=>it.url==url).length) {
				followed = true;
			}
			const btn = document.createElement('a'); {
				btn.classList.add('button--link');
				btn.classList.add('button');
				btn.classList.add('rippleButton');
				btn.href = './follow';
				btn.addEventListener('click', evt=>{
					evt.preventDefault();
					if (followed) {
						games = games.filter(it=>it.url != url);
						span.textContent = 'Follow';
					} else {
						games.push({url:url});
						span.textContent = 'Unfollow';
					}
					localStorage.setItem('ffg-games', JSON.stringify(games));
					followed = !followed;
				});
				const span = document.createElement('span'); {
					span.classList.add('button-text');
					span.textContent = followed ? 'Unfollow' : 'Follow';
					btn.appendChild(span);
				}
				const rip = document.createElement('div'); {
					rip.classList.add('ripple-container');
					btn.appendChild(rip);
				}
				watch.parentElement.appendChild(btn);
			}
		}
	}
})();