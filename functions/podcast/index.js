'use strict';

const Alexa = require('alexa-sdk');
const languageStrings = require('./language');
const handlers = require('./lib/handlers');
const constants = require('./constants');

exports.handle = function (event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = process.env.ALEXA_APPLICATION_ID;
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers.open, handlers.play);

  if (constants.debug) {
    console.log("\n" + "******************* REQUEST **********************");
    console.log("\n" + JSON.stringify(event, null, 2));
  }

  const audioPlayerInterface = (((
    (event.context || {})
    .System || {})
    .device || {})
    .supportedInterfaces || {})
    .AudioPlayer;
  if (audioPlayerInterface === undefined) {
    alexa.emit(':tell', alexa.i18n.t.apply(alexa.i18n, 'NOT_DEVISE_SUPPORT'));
  } else {
    alexa.execute();
  }
};
