'use strict';

const constants = require('../constants');
const FeedParser = require('feedparser');
const request = require('request');

module.exports.parse = function(callback) {
  let feedMeta, feed, episodes = [];
  request(constants.feed).on('response', function (res) {
    if (res.statusCode !== 200) {
      this.emit('error', new Error('Bad status code'));
    } else {
      this.pipe(new FeedParser({}))
        .on('error', function(error) {
        })
        .on('meta', function(meta) {
          feedMeta = meta;
        })
        .on('readable', function() {
          let item;
          while (item = this.read()) {
            episodes.push({
              title: item.title,
              mediaUrl: item.link,
              audioUrl: item.enclosures[0].url,
              publicationDate: item.pubDate
            });
          }
        })
        .on('end', function() {
          callback({
            feedName: feedMeta.title,
            feedArtist: feedMeta['itunes:author']['#'],
            website: feedMeta.link,
            albumArt: {
              url: feedMeta.image.url,
            },
            episodes: episodes
          });
        });
    }
  });
};
