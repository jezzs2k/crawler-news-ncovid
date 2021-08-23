const CronJob = require('cron').CronJob;
const moment = require('moment-timezone');

const CreateJob = (time, cb) => {
    const now = moment(new Date());
    const nowViTz = now.tz('Asia/Ho_Chi_Minh');

    const hour = nowViTz.hour();

    //every hour
    const job = new CronJob(time ?? '0 * * * *', function () {
        console.log(hour);
        if (hour > 0 && hour < 6) {
            // non job
            console.log('Out of time')
        } else {
            cb && cb();
        }
    }, function () {
        /* This function is executed when the job stops */
    },
        true, /* Start the job right now */
        'Asia/Ho_Chi_Minh' /* Time zone of this job. */
    );

    job.start();
};

module.exports = CreateJob;