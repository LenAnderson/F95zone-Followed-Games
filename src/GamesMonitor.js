${include: Game.js}
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