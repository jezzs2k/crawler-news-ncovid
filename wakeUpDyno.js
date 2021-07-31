const fetch = require("node-fetch");
const crawler = require('./crawler');

const wakeUpDyno = async (url, interval) => {
    try {
        const milliseconds = interval * 60000;
        setTimeout(() => {
            fetch(url);
        }, milliseconds);

        await crawler(5);
    } catch (error) {
        console.log(error);
    }
};

module.exports = wakeUpDyno;