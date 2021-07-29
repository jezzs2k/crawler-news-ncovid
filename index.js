const CronJob = require('cron').CronJob;
const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const crawler = require('./crawler');

let nextHouseToRunCronjob = 8;
let nextMinuteToRunCronjob = 8;

(async () => await crawler())();

app.get('/', (req, res) => {
    res.send('Hello my friend !')
})

app.get('/news', (req, res) => {
    const pageIndex = 1;

    fs.readFile('news.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            return res.send('Error', + JSON.stringify(err))
        } else {
            if (data) {
                const newsFile = JSON.parse(data);

                if (!newsFile?.news) {
                    return res.send('News is empty !');
                } else {
                    const newsData = newsFile.news;

                    return res.jsonp(newsData.slice((pageIndex - 1) * 20, pageIndex * 20))
                }
            } else {
                return res.send('News is empty !');
            }
        }
    })
})

app.get('/news/:page', function (req, res) {
    const pageIndex = req.params.page;
    fs.readFile('news.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            return res.send('Error', + JSON.stringify(err))
        } else {
            if (data) {
                const newsFile = JSON.parse(data);

                if (!newsFile?.news) {
                    return res.send('News is empty !');
                } else {
                    const newsData = newsFile.news;

                    return res.jsonp(newsData.slice((pageIndex - 1) * 20, pageIndex * 20))
                }
            } else {
                return res.send('News is empty !');
            }
        }
    })
})

app.listen(port, () => {
    // const job = new CronJob(`${nextMinuteToRunCronjob} ${nextHouseToRunCronjob} * * *`, async function () {
    //     console.log("Run cron new start");
    //     console.time('CronStart');

    //     const crawlerNews = await crawler();

    //     const date1 = crawlerNews[0].split(', ');
    //     const date2 = crawlerNews[1].split(', ');

    //     if (date1[0] === date2[0] && date1[1] === date2[1]) {
    //         const time1 = date1[2].split(':');
    //         const time2 = date2[2].split(':');

    //         const minuteRemain1 = 60 - Number(time1[1] ?? 0);
    //         const minuteRemain2 = 60 - Number(time2[1] ?? 0);

    //         const house1 = Number(time1[0]);
    //         const house2 = Number(time2[0]);

    //         if (house1 === house2) {
    //             nextMinuteToRunCronjob = minuteRemain1 - minuteRemain2;
    //             nextHouseToRunCronjob = house1;
    //         } else if (house1 > house2) {
    //             nextHouseToRunCronjob = nextHouseToRunCronjob + house1 - house2;
    //             nextMinuteToRunCronjob = minuteRemain2 + minuteRemain1;
    //         } else if (nextHouseToRunCronjob > 22) {
    //             nextMinuteToRunCronjob = 30;
    //             nextHouseToRunCronjob = 8;
    //         }

    //     }

    //     console.timeEnd('CronStart');
    //     console.log("Cron run successed");
    //     console.log(new Date());
    // }, null, true, 'Asia/Ho_Chi_Minh');

    // job.start();

    console.log(`Example app listening at http://localhost:${port}`)
})