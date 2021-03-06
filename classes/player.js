'use strict;';
const config = require('../config.json');

module.exports = class Player {
    constructor(conn, chann) {
        this.conn = conn;
        this.chann = chann;
        this.queue = [];

        this.conn.on('end', () => {
            this.playNext();
        });

        this.conn.on('warn', (warn) => {
            console.log('warn: ' + warn);
        });

        this.conn.on('error', (err) => {
            console.log(err);
        });
    }

    addSong(song, print) {
        if(this.queue.length === 0 && !this.conn.playing) {
            this.queue.push(song);
            this.playNext();
        }
        else {
            this.queue.push(song);
            if(print) bot.createMessage(this.chann.id, `Your song was added to the queue in position ${this.queue.length}`);
        }
    }

    playNext() {
        if(!this.queue) return;

        let next = this.queue.shift();

        if(next) {
            next.getStream().then(stream => {
                this.conn.playStream(stream, {inlineVolume: true});
                bot.createMessage(this.chann.id, next.getPrettyInfo(true));
            }).catch(err => {
                console.log(`Error in playNext func: ${err}`);
                bot.createMessage(this.chann.id, `There was an error playing your song`);
            });
        }
    }

    kill() {
        this.queue = null;
        bot.leaveVoiceChannel(this.chann.id);
    }

    setVolume(volume) {
        let vol = parseInt(volume);
        vol = vol * parseFloat(config.voice_modifier) / 100;
        this.conn.setVolume(vol);
    }

    skip() {
        this.conn.stopPlaying();
    }

    get playing() {
        return this.conn.playing;
    }

    get queueString() {
        if(this.queue.length === 0) return '\`The queue is empty\`';
        let retStr = '```xl\n';
        let num = 1;
        for(let s of this.queue) {
            retStr += `${num++}.] ${s.getPrettyInfo(false)}\n`;
        }
        retStr += '```';
        return retStr;
    }

    get channel() {
        return this.chann.id;
    }
};