const fetch = require("node-fetch");
const crawler = require('./crawler');

const wakeUpDyno = (url, interval) => {
    try {
        const milliseconds = interval * 60000;
        setTimeout(async () => {
            fetch(url);

            await crawler(4);
        }, milliseconds);

    } catch (error) {
        console.log(error);
    }
};

module.exports = wakeUpDyno;