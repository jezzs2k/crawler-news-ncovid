const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const _ = require('lodash');

let pageIndex = 0;

async function extractNews(url) {
    const browser = await puppeteer.launch({
        headless: true,
        waitUntil: 'networkidle2',
        // executablePath: '/usr/bin/google-chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();
    await page.goto(url);

    const nextPage = await page.evaluate(() => {
        const portletBody = document.querySelector("div.portlet-body");
        return portletBody.querySelectorAll("div.clearfix.lfr-pagination li")?.[1]?.querySelector('a')?.href
    })

    const news = await page.evaluate(() => {
        const portletBody = document.querySelector("div.portlet-body");

        const headerNew = {
            image: portletBody.querySelector("img.lazy")?.src,
            title: portletBody.querySelector("a h2")?.textContent,
            date: portletBody.querySelector("small.text-muted")?.textContent,
            content: portletBody.querySelectorAll("p")[1]?.textContent,
            detail: portletBody.querySelector("a")?.href,
            id: portletBody.querySelector("a")?.href.split('/-/')?.[1],
        }

        const row = portletBody.querySelectorAll("div.row.mb-1");

        return [headerNew, ...Array.from(row).map(r => {
            return {
                id: r.querySelector("a.text-tletin")?.href.split('/-/')?.[1],
                image: r.querySelector("img.lazy")?.src,
                title: r.querySelector("a.text-tletin")?.textContent,
                date: r.querySelector("small.text-muted")?.textContent,
                content: r.querySelector("div.text-muted.d-none p")?.textContent,
                detail: r.querySelector("a.text-tletin")?.href
            };

        })];
    }, JSON.stringify(uuidv4));

    await browser.close();

    return {
        news,
        pageIndex: pageIndex++,
        totalNews: news.length,
        nextPage,
    };
}

const handleCrawlerNews = async (page = 9) => {
    let crawlerNews = [];
    let newsss = null;
    let news = await extractNews('https://ncov.moh.gov.vn/vi/web/guest/tin-tuc');

    crawlerNews = [...crawlerNews, ...news.news]

    while (1) {
        if (newsss) {
            crawlerNews = [...crawlerNews, ...newsss.news];
        }

        if (crawlerNews.length > page) {
            fs.readFile('news.json', 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(`Error writing file: ${err}`);
                } else {
                    let newCrawlerNews = null;

                    if (data) {
                        const newsFile = JSON.parse(data);

                        if (newsFile?.news?.length > 10000) {
                            newsFile.news = [];
                        }

                        if (newsFile && newsFile?.news) {
                            newCrawlerNews = _.unionBy(crawlerNews, newsFile.news, 'id');
                        }
                    }

                    const listNews = JSON.stringify({
                        news: newCrawlerNews ?? crawlerNews,
                        pageIndex,
                        createdAt: new Date().toISOString(),
                        totalNews: crawlerNews.length
                    });

                    fs.writeFile('news.json', listNews, 'utf8', (err) => {
                        if (err) {
                            console.log(`Error writing file: ${err}`);
                        } else {
                            console.log(`File is written successfully!`);
                        }
                    });
                }
            });

            return crawlerNews;
        } else {
            newsss = await extractNews(newsss?.nextPage ?? news.nextPage);
        }

    }

};

module.exports = async (page) => {
    return await handleCrawlerNews(page)
}