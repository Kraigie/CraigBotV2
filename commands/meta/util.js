'use strict;';

const request = require('request');
const auth = require('../../auth');

module.exports.getLink = function(link, query) {
    if(!query) return Promise.resolve(link);

    return new Promise((resolve, reject) => {
        request({
            uri: 'https://www.googleapis.com/youtube/v3/search',
            qs: {
                q: link,
                part: 'snippet',
                key: auth.yt_key,
                maxResults: '1',
                type: 'video'
            },
            json: true
        },
        (err, response, body) => {
            if(err) {
                console.log(`Error geting YT song: ${err.stack}`);
                reject(new Error(`Error getting YT song`));
            }

            if(response.statusCode !== 200 || !body) {
                console.log(`Didn\t receive a 200 from youtube song query, or there was no body`);
                reject(new Error(`Error getting YT song`));
            }

            return resolve(`https://www.youtube.com/watch?v=${body.items[0].id.videoId}`);
        });
    });
};

module.exports.getSource = function(song) {
    try {
        if(/s\w*c|y\w*t/.test(song)) {
            if(/s\w*c/.test(song)) return 'sc';
            if(/y\w*t/.test(song)) return 'yt';
        }
        else {
            if(/http/.test(song)) return;
            return 'query';
        }
    } catch(err) {
        console.log(`Error with regex in getSource function: ${err}`);
        return;
    }
};

module.exports.strToMs = function(time) {
    let num = 0;
    try {
        num = time.match(/(\d+ ?[mhs])/gi);
    } catch(err) {
        console.log(`Error with regex in strToMs function: ${err}`);
        return;
    }

    if(!num || num.length < 1 || num.length > 3) return;
    num = num.splice(0, 3);

    let hours = 0,
    minutes = 0,
    seconds = 0;

    for(let i of num) {
        if(~i.indexOf('h'))
        hours = i.match(/\d+/);
        if(~i.indexOf('m'))
        minutes = i.match(/\d+/);
        if(~i.indexOf('s'))
        seconds = i.match(/\d+/);
    }

    let retStr = '';
    if(hours)
    retStr += `${parseInt(hours)} hour(s) `;
    if(minutes)
    retStr += `${parseInt(minutes)} minute(s) `;
    if(seconds)
    retStr += `${parseInt(seconds)} second(s) `;

    let indexLstMatch = time.lastIndexOf(num[num.length - 1]) + num[num.length - 1].length - 1;
    let lstSpcAftMtch = time.indexOf(' ', indexLstMatch);   //these variable names tho

    return {
        ms: (parseInt(hours) * 3600000) + (parseInt(minutes) * 60000) + (parseInt(seconds) * 1000),
        str: retStr,
        content: time.substring(lstSpcAftMtch)
    };
};
