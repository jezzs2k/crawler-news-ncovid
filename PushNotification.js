const fs = require('fs');
const fetch = require('node-fetch');
const firebase = require("firebase-admin");
const configJsonFirebase = require('./news-app-e0332-firebase-adminsdk-wqhga-92051d5565.json');

class PushNotifier {
    constructor() {
        const defaultAppConfig = {
            credential: firebase.credential.cert(configJsonFirebase),
            databaseURL: "https://news-app-e0332-default-rtdb.firebaseio.com/"
        };
        // Initialize the default app
        firebase.initializeApp(defaultAppConfig);
    }

    sendNotificationToDeviceIOS(data) {
        let android = {
            priority: "High",
            ttl: 36000,
            data: {
                title: 'Thông tin mới về Covid',
                body: data.content,
            },
        };

        fs.readFile('tokenDevices.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                return res.send('Error', + JSON.stringify(err))
            } else {
                if (data) {
                    const devices = JSON.parse(data);

                    if (devices?.lenght <= 0) {
                        return;
                    }

                    let notification_body = {
                        notification: android.data,
                        registration_ids: ["fOFdQanURuCi3GMVqlZUFO:APA91bG4n_1kw3D8ICXmWVJgcuDVBcT9f-fsfuz_uST3n6xFjWmUgz9FmTgRYlBYFhX2zhSqASnRCNVD-LdnOqWQ0dAsCvLDyUBv9NH7fzNp0H8YbP1ZS_WrM9iVJ5Jy8zr81uOkB0oM"],
                    };

                    // firebase.messaging().subscribeToTopic(devices, '/topics/news')
                    //     .then((response) => {
                    //         // Response is a message ID string.
                    //         console.log('res', response);
                    //     })
                    //     .catch((error) => {
                    //         //return error
                    //         console.log('error', error);
                    //     });

                    fetch('https://fcm.googleapis.com/fcm/send', {
                        'method': 'POST',
                        'headers': {
                            // replace authorization key with your key
                            'Authorization': 'key=' + 'AAAANZUnLxk:APA91bEyLKooAFO6Wv6moezr3SEY1Oc_8covGW-bJ5DGuKsY-MJK4QrstcAAiXuxzgbhjPPLa_lmU5p0nzjqsBgOjPtAyRCjEtuWA1_2BN94Yvrc9D3cRirruZpNf4M2rQSczUMijwvp',
                            'Content-Type': 'application/json'
                        },
                        'body': JSON.stringify(notification_body)
                    }).then(function (response) {
                        // console.log(response);
                    }).catch(function (error) {
                        console.error(error);
                    })
                } else {

                }
            }
        })
    }
}

module.exports = { PushNotifier };