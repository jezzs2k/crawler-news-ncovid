const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const _ = require('lodash');
const fetch = require("node-fetch");

let pageIndex = 0;

async function extractNews(url) {
    const browser = await puppeteer.launch({
        headless: true,
        waitUntil: 'networkidle2',
        executablePath: 'google-chrome-stable',
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
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
            newId: portletBody.querySelector("a")?.href.split('/-/')?.[1],
        }

        const row = portletBody.querySelectorAll("div.row.mb-1");

        return [headerNew, ...Array.from(row).map(r => {
            return {
                newId: r.querySelector("a.text-tletin")?.href.split('/-/')?.[1],
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
            const body = {
                "query": `query{getNews(pageIndex: "1" ){ date  newId} }`
            };
            //http://localhost:5001/
            fetch('http://crawler-news-covid:5000/', {
                method: 'post',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            }).then(res => res.json())
                .then(json => {
                    const data = json.data.getNews;

                    if (data && data?.length > 0) {
                        console.log(data);
                        const totalId1 = crawlerNews[0].newId?.split('-')?.reduce((s, b) => {
                            return s + Number(b)
                        }, 0);
                        const totalId2 = data?.[0]?.newId?.split('-')?.reduce((s, b) => {
                            return s + Number(b)
                        }, 0);

                        if (data[0] && crawlerNews[0] && crawlerNews[0].date !== data[0].date && totalId1 && totalId2 && totalId2 < totalId1) {
                            const jsonNews = JSON.stringify(JSON.stringify(crawlerNews));

                            const body = {
                                "query": `mutation{createNews(news: ${jsonNews} ){message} }`
                            };

                            fetch('http://crawler-news-covid:5000/', {
                                method: 'post',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' },
                            }).then(res => res.json())
                                .then(json => console.log(json));
                        }
                    } else {
                        const jsonNews = JSON.stringify(JSON.stringify(crawlerNews));
                        const body = {
                            "query": `mutation{createNews(news: ${jsonNews} ){message} }`
                        };

                        fetch('http://crawler-news-covid:5000/', {
                            method: 'post',
                            body: JSON.stringify(body),
                            headers: { 'Content-Type': 'application/json' },
                        }).then(res => res.json())
                            .then(json => console.log(json));
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