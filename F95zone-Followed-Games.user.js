// ==UserScript==
// @name         F95zone - Followed Games
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/F95zone-Followed-Games/raw/master/F95zone-Followed-Games.user.js
// @version      1.0.0
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




	class Game {
	constructor({url}) {
		this.url = url;
		this.title = null;
		this.played = null;
		this.version = null;
		this.downloads = [];
		this.changelog = [];
		this.banner = null;
		this.threadDate = null;
		this.gameDate = null;
	}




	async load() {
		const oss = ['Win', 'PC'];

		const html = await getHtml(this.url);
		const post = html.querySelector('.message-threadStarterPost .message-cell.message-cell--main .message-content .message-body .bbWrapper');
		
		this.title = html.querySelector('.p-title-value').textContent;
		this.threadDate = post.textContent.replace(/^.+Thread\s+Updated\s*:\s*(\d\d\d\d.+?\d\d.+?\d\d).+$/s, '$1');
		this.gameDate = post.textContent.replace(/^.+Release\s+Date\s*:\s*(\d\d\d\d.+?\d\d.+?\d\d).+$/s, '$1');
		this.version = post.textContent.replace(/^.+Version\s*:\s*([^\r\n]+).+$/s, '$1');
		
		const changelogHeader = Array.from(post.querySelectorAll('b')).find(it=>it.textContent == 'Changelog' || it.textContent == 'Change-logs');
		let changelogSpoiler = changelogHeader;
		while (changelogSpoiler && !changelogSpoiler.classList.contains('bbCodeSpoiler')) {
			changelogSpoiler = changelogSpoiler.nextElementSibling;
		}
		if (changelogSpoiler) {
			this.changelog = changelogSpoiler;
			this.changelog.querySelector('.button-text').textContent = 'Changelog';
		}
		this.banner = post.querySelector('img.bbImage');
		if (this.banner) {
			this.banner.classList.remove('lazyload');
			this.banner.classList.remove('lazyloading');
			this.banner.style.height = '75px';
			this.banner.style.width = '300px';
			this.banner.style.objectFit = 'cover';
			this.banner.style.display = 'inline-block';
			this.banner.style.verticalAlign = 'middle';
			this.banner.src = this.banner.getAttribute('data-src');
		}
		

		const bs = Array.from(post.querySelectorAll('b, a.link--external'));
		let afterDl = true;
		let afterOs = false;
		let os = null;
		let dls = [];
		bs.forEach(b=>{
			if (!afterDl && b.tagName == 'B' && b.textContent.trim().search(/\s*DOWNLOAD\s*/s) == 0) {
				afterDl = true;
			} else if (afterDl) {
				if (b.tagName == 'B' && b.textContent.trim().search(/^((Win|PC)?\/?(Linux)?\/?(Mac)?\/?(Android)?)$/i) == 0) {
					os = b.textContent.trim().replace(/^((Win|PC)?\/?(Linux)?\/?(Mac)?\/?(Android)?)$/i, '$1');
					if (os.split('/').map(x=>oss.filter(it=>it.toLowerCase()==x.toLowerCase()).length).filter(it=>it).length) {
						dls = [];
						this.downloads.push({
							os: os,
							links: dls
						});
						log('os:',os,dls);
					} else {
						os = null;
					}
				} else if (b.tagName == 'B') {
					os = null;
				} else if (b.tagName == 'A' && os) {
					b.style.display = 'block';
					b.style.overflow = 'hidden';
					b.style.whiteSpace = 'nowrap';
					b.style.textOverflow = 'ellipsis';
					dls.push(b);
				}
			}
		});
		
		
		log(this.threadDate, this.gameDate, this.version, changelogSpoiler, this.downloads);
	}
}
class GamesMonitor {
	constructor() {
		const g = JSON.parse(localStorage.getItem('ffg-games') || '[]');
		this.games = g.map(it=>new Game(it));

		this.filterBar = null;
		this.itemContainer = null;

		this.buildGui();
		this.x();
	}




	buildGui() {
		$('.p-body-header .p-title-value').textContent = 'Followed Games';
		document.title = 'Followed Games | F95zone';
		const body = $('.p-body-pageContent');
		body.innerHTML = '';

		const style = document.createElement('link'); {
			style.rel = 'stylesheet';
			style.href = 'https://f95zone.to/css.php?css=public%3ABRATR_rating_stars.less%2Cpublic%3Aandy_quicksearch.less%2Cpublic%3Aattachments.less%2Cpublic%3AavForumsTagEss_thread_view_grouped_tags.less%2Cpublic%3Abb_code.less%2Cpublic%3Aeditor.less%2Cpublic%3Alightbox.less%2Cpublic%3Amessage.less%2Cpublic%3Arating_stars.less%2Cpublic%3Arellect_favicon.less%2Cpublic%3Asiropu_ads_manager_ad.less%2Cpublic%3Astructured_list.less%2Cpublic%3AsvESE_macros_similar_contents.less%2Cpublic%3AsvLazyImageLoader.less%2Cpublic%3AtckPatreonSync_message_macros.less%2Cpublic%3Ath_covers.less%2Cpublic%3Ath_uix_threadStarterPost.less%2Cpublic%3Auix_extendedFooter.less%2Cpublic%3Auix_socialMedia.less%2Cpublic%3Aextra.less&s=26&l=1&d=1603141514&k=1b4aed3376c435ce875a293c0046d031c0ec5b94';
			document.body.appendChild(style);
		}

		const container = document.createElement('div'); {
			container.classList.add('block-container');
			const filterBar = document.createElement('div'); {
				this.filterBar = filterBar;
				filterBar.classList.add('block-filterBar');
				filterBar.textContent = 'LOADING ...';
				container.appendChild(filterBar);
			}
			const itemContainer = document.createElement('div'); {
				this.itemContainer = itemContainer;
				itemContainer.classList.add('structItemContainer');
				container.appendChild(itemContainer);
			}
			body.appendChild(container);
		}
	}




	async x() {
		await Promise.all(this.games.map(it=>it.load()));
		this.games.sort((a,b)=>{
			if (a.threadDate < b.threadDate) return 1;
			if (a.threadDate > b.threadDate) return -1;
			return 0;
		});
		this.filterBar.innerHTML = '';
		this.games.forEach(game=>{
			const item = document.createElement('div'); {
				item.classList.add('structItem');
				item.style.display = 'table-row';
				const main = document.createElement('div'); {
					main.classList.add('structItem-cell');
					main.classList.add('structItem-cell--main');
					const title = document.createElement('div'); {
						title.classList.add('structItem-title');
						title.appendChild(game.banner);
						const link = document.createElement('a'); {
							link.textContent = game.title;
							link.href = game.url;
							link.style.display = 'inline-block';
							link.style.verticalAlign = 'middle';
							link.style.marginLeft = '10px';
							title.appendChild(link);
						}
						title.appendChild(game.changelog);
						main.appendChild(title);
					}
					item.appendChild(main);
				}
				const meta = document.createElement('div'); {
					meta.classList.add('structItem-cell');
					meta.classList.add('structItem-cell--meta');
					meta.style.width = '200px';
					const version = document.createElement('dl'); {
						version.classList.add('pairs');
						version.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Version';
							version.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							dd.textContent = game.version;
							version.appendChild(dd);
						}
						meta.appendChild(version);
					}
					const latestPlayed = document.createElement('dl'); {
						latestPlayed.classList.add('pairs');
						latestPlayed.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Played';
							latestPlayed.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							dd.textContent = game.latestPlayed;
							latestPlayed.appendChild(dd);
						}
						meta.appendChild(latestPlayed);
					}
					const threadDate = document.createElement('dl'); {
						threadDate.classList.add('pairs');
						threadDate.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Thread';
							threadDate.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							dd.textContent = game.threadDate;
							threadDate.appendChild(dd);
						}
						meta.appendChild(threadDate);
					}
					const gameDate = document.createElement('dl'); {
						gameDate.classList.add('pairs');
						gameDate.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Game';
							gameDate.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							dd.textContent = game.gameDate;
							gameDate.appendChild(dd);
						}
						meta.appendChild(gameDate);
					}
					item.appendChild(meta);
				}
				const downloads = document.createElement('div'); {
					downloads.classList.add('structItem-cell');
					downloads.classList.add('structItem-cell--meta');
					game.downloads.forEach(dl=>{
						const cont = document.createElement('dl'); {
							cont.classList.add('pairs');
							const dt = document.createElement('dt'); {
								dt.textContent = dl.os;
								cont.appendChild(dt);
							}
							const dd = document.createElement('dd'); {
								dl.links.forEach(it=>dd.appendChild(it));
								cont.appendChild(dd);
							}
							downloads.appendChild(cont);
						}
					});
					item.appendChild(downloads);
				}
				this.itemContainer.appendChild(item);
			}
		});
	}
}
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