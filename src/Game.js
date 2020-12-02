${include: strtotime.js}
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
		this.threadDate = new Date(strtotime(post.textContent.replace(/^.+(Thread|Post)\s+Updated\s*:\s*([^\r\n]+)[\r\n].+$/s, '$2'))*1000);
		this.gameDate = new Date(strtotime(post.textContent.replace(/^.+(Release\s+Date|Game\s+Updated)\s*:\s*([^\r\n]+)[\r\n].+$/s, '$2'))*1000);
		this.version = post.textContent.replace(/^.+Version\s*:\s*([^\r\n]+).+$/s, '$1');
		
		const changelogHeader = Array.from(post.querySelectorAll('b')).find(it=>it.textContent == 'Changelog' || it.textContent == 'Change-logs' || it.textContent == 'Change-Log');
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