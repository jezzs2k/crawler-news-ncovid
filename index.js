const puppeteer = require('puppeteer');

let pageIndex = 0;

async function extractNews(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const nextPage = await page.evaluate(() => {
        const portletBody = document.querySelector("div.portlet-body");
        return portletBody.querySelectorAll("div.clearfix.lfr-pagination li")[1].querySelector('a').href
    })

    const news = await page.evaluate(() => {
        const portletBody = document.querySelector("div.portlet-body");

        const headerNew = {
            image: portletBody.querySelector("img.lazy").src,
            title: portletBody.querySelector("a h2").textContent,
            date: portletBody.querySelector("small.text-muted").textContent,
            content: portletBody.querySelectorAll("p")[1].textContent,
            detail: portletBody.querySelector("a").href
        }

        const row = portletBody.querySelectorAll("div.row.mb-1");

        return [headerNew, ...Array.from(row).map(r => {
            return {
                image: r.querySelector("img.lazy").src,
                title: r.querySelector("a.text-tletin").textContent,
                date: r.querySelector("small.text-muted").textContent,
                content: r.querySelector("div.text-muted.d-none p").textContent,
                detail: r.querySelector("a.text-tletin").href
            };

        })];
    });

    await browser.close();

    return {
        news,
        pageIndex: pageIndex++,
        totalNews: news.length,
        nextPage,
    };
}

(async () => {
    let crawlerNews = [];

    let newsss = null;
    let news = await extractNews('https://ncov.moh.gov.vn/vi/web/guest/tin-tuc');

    crawlerNews = [...crawlerNews, ...news.news]

    while (1) {
        if (newsss) {
            crawlerNews = [...crawlerNews, ...newsss.news];
        }

        console.log(crawlerNews.length);

        if (crawlerNews.length > 19) {
            console.log({
                news: crawlerNews,
                pageIndex,
                createdAt: new Date().toISOString(),
                totalNews: 'news.length'
            })

            return {
                news: crawlerNews,
                pageIndex,
                createdAt: new Date().toISOString(),
                totalNews: crawlerNews.length
            }
        } else {
            newsss = await extractNews(newsss?.nextPage ?? news.nextPage);
        }

    }

})();