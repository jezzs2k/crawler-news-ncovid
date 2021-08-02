const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const crawler = require('./crawler');
const wakeUpDynp = require('./wakeUpDyno');

const URL = 'https://crawler-news-ncov.herokuapp.com/';

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
    console.log(`App listening at http://localhost:${port}`)
    wakeUpDynp(URL, 25);
})