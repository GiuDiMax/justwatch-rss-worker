import cheerio from 'cheerio'

async function scrapeWebsite(url) {
	try {
		let result = []
		const response = await fetch(url)
		const html = await response.text()
		const $ = cheerio.load(html)

		const providers = $('.provider-timeline')
		providers.each((_, el) => {
			//let sp = {}
			const provider = $(el).find('.provider-timeline__logo').attr('title')
			const films = $(el).find('.horizontal-title-list__item')
			films.each((_, el2) => {
				const el3 = $(el2).find('.picture-comp')
				const link = "https://www.justwatch.com" + $(el2).find('a').attr("href")
				const title = $(el3).find('.picture-comp__img').attr("alt")
				result.push({'provider': provider, 'title': title, 'link': link})
				// let poster = ""
				// const poster1 = $(el3).find("[type=image/jpeg]").attr('srcset')
				// const poster2 = $(el3).find("[type=image/jpeg]").attr('data-srcset')
				// if (poster1 !== "" && poster1 !== undefined){poster = poster1}
				// else{poster = poster2}
				// poster = poster.replace("s166", "s592").split(",")[0] + ".jpg"
				// result.push({'provider': provider, 'title': title, 'img': poster, 'link': link})
			})
		})
		return result

	} catch (error) {
		console.error('Erro: ', error);
	}
}

function generateRSS(data) {
	const channelTitle = "JustWatch ITA"
	const channelLink = "https://www.justwatch.com"
	const channelDescription = "Rimani aggiornato su tutte le uscite delle piattaforme"
	const channelLanguage = "it-it";

	let rssItems = data.map(film => {
		return `
            <item>
                <title>${film.title} | ${film.provider}</title>
                <link>${film.link}</link>
            </item>
        `;
		//<enclosure url="${film.img}" type="image/jpeg"/>
		//<description></description>
		//<author>${film.provider}</author>
	}).join('')

	return `
        <?xml version="1.0" encoding="UTF-8" ?>
        <rss version="2.0">
            <channel>
                <title>${channelTitle}</title>
                <link>${channelLink}</link>
                <description>${channelDescription}</description>
                <language>${channelLanguage}</language>
                ${rssItems}
            </channel>
        </rss>
    `
}

export default {
	async fetch() {
		const url = "https://www.justwatch.com/it/film/novit%C3%A0?providers=atp,dnp,mbi,nfx,pmp,prv,rai"
		const resp = await scrapeWebsite(url)
		const rssFeed = generateRSS(resp);
		return new Response(rssFeed, {
			headers: { 'Content-Type': 'application/rss+xml' }
		})
	},
};

