// ==UserScript==
// @name         F95zone - Followed Games
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/F95zone-Followed-Games/raw/master/F95zone-Followed-Games.user.js
// @version      1.7.0
// @author       LenAnderson
// @match        https://f95zone.to/*
// @grant        none
// ==/UserScript==

import { GamesMonitor } from "./GamesMonitor.js";

(async()=>{
	'use strict';

	const log = (...msgs)=>console.log.call(console.log, '[FFG]', ...msgs);
	
	
	const $ = (root,query)=>(query?root:document).querySelector(query?query:root);
	const $$ = (root,query)=>Array.from((query?root:document).querySelectorAll(query?query:root));


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




	// ${imports}




	const latest = $('[data-nav-id="LatestUpdates"]')?.closest('li');
	if (latest) {
		const navLink = latest.cloneNode(true); {
			$(navLink, 'a').href = '/followed-games';
			$(navLink, 'a > span').textContent = 'Followed Games';
			latest.insertAdjacentElement('afterEnd', navLink);
		}
		$$('.p-navEl-link[target="_blank"]').forEach(it=>it.closest('li').remove());
		if (location.href == 'https://f95zone.to/followed-games') {
			$(navLink, '.p-navEl').classList.add('is-selected');
			const app = new GamesMonitor();
		} else if (location.href.search(/(https:\/\/f95zone.to\/threads\/)[^\/]+(\.\d+\/)/) == 0) {
			log('add btn');
			const watch = $('.rippleButton[data-sk-watch]');
			if (watch) {
				log('yup');
				const url = location.href.replace(/(https:\/\/f95zone.to\/threads\/)[^\/]+(\.\d+\/).*$/, '$1$2');
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
	} else {
		const template = $('.p-navEl:not(.is-selected) > [data-nav-id]')?.closest('li');
		const navLink = template.cloneNode(true); {
			$(navLink, 'a').href = 'https://f95zone.to/followed-games';
			$(navLink, 'a > span').textContent = 'Followed Games';
			template.closest('ul').append(navLink);
		}
	}
})();