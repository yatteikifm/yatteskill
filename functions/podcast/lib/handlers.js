'use strict';

const Alexa = require('alexa-sdk');
const constants = require('../constants');
const feed = require('./feed');
const STATUS = {
  OPEN: '',
  PLAY: '_PLAY',
};

module.exports.open = Alexa.CreateStateHandler(STATUS.OPEN, {
  'play': function(episode, index, offsetInMilliseconds) {
    // TODO stateの切り替えが出来てない
    this.handler.state = STATUS.PLAY;
    offsetInMilliseconds = parseInt(offsetInMilliseconds) + 0; // どの時間から再生するか
    const cardTitle = 'Playing: ' + this.t('SKILL_NAME');
    this.response.cardRenderer(cardTitle, episode.title, null);
    this.response.speak(episode.title + this.t('TO_PLAY')).audioPlayerPlay(
      'REPLACE_ALL', episode.audioUrl, index + ''/* token */, null, offsetInMilliseconds);
    this.emit(':responseReady');
  },
  'stop': function() {
    this.response.audioPlayerStop();
    this.emit(':responseReady');
  },
  // 起動時
  'LaunchRequest': function () {
    this.emit(':ask', this.t('OPEN_MESSAGE'));
  },
  'PlayAudio': function (index, offsetInMilliseconds) {
    offsetInMilliseconds = parseInt(offsetInMilliseconds) + 0; // どの時間から再生するか
    index = parseInt(index) || 0;
    const self = this;

    feed.parse(function(f) {
      index = (index < 0) ? f.episodes.length - 1 : index;
      index = (index >= f.episodes.length) ? 0 : index;
      self.emit('play', f.episodes[index], index, offsetInMilliseconds);
    });
  },
  'AMAZON.YesIntent': function () { this.emit('PlayAudio'); },
  'AMAZON.NoIntent': function () { this.emit('stop'); },
  // 次
  'AMAZON.NextIntent': function () {
    const index =
      parseInt(((this.event.context || {}).AudioPlayer || {}).token) + 1;
    this.emit('PlayAudio', index);
  },
  // 前
  'AMAZON.PreviousIntent': function () {
    const index =
      parseInt(((this.event.context || {}).AudioPlayer || {}).token) - 1;
    this.emit('PlayAudio', index);
  },
  // ヘルプ
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', this.t('HELP_MESSAGE'), this.t('HELP_MESSAGE'));
  },
  // ストップ系
  'AMAZON.StopIntent': function () { this.emit('stop'); },
  'AMAZON.PauseIntent':  function () { this.emit('stop'); },
  'AMAZON.CancelIntent': function () { this.emit('stop'); },
  // 最初から
  'AMAZON.StartOverIntent': function () {
    this.emit(':tell', this.t('NOT_START_OVER_SUPPORT'), this.t('NOT_START_OVER_SUPPORT'));
  },
  // TODO リピート、シャッフル、ループ再生、state切り分けて対応する?
  // DB保存が必要なら未対応のままで良い。これらの処理実行で音声再生が止まる
  'AMAZON.RepeatIntent': function () {
    this.emit(':tell', this.t('NOT_REPEAT_SUPPORT'), this.t('NOT_REPEAT_SUPPORT'));
  },
  'AMAZON.ShuffleOnIntent': function () {
    this.emit(':tell', this.t('NOT_SHUFFLE_SUPPORT'), this.t('NOT_SHUFFLE_SUPPORT'));
  },
  'AMAZON.ShuffleOffIntent': function () {
    this.emit(':tell', this.t('NOT_SHUFFLE_SUPPORT'), this.t('NOT_SHUFFLE_SUPPORT'));
  },
  'AMAZON.LoopOnIntent': function () {
    this.emit(':tell', this.t('NOT_LOOP_SUPPORT'), this.t('NOT_LOOP_SUPPORT'));
  },
  'AMAZON.LoopOffIntent': function () {
    this.emit(':tell', this.t('NOT_LOOP_SUPPORT'), this.t('NOT_LOOP_SUPPORT'));
  },
  // 一時停止からの再開
  'AMAZON.ResumeIntent': function () {
    const resumeAudioPlayer = (this.event.context || {}).AudioPlayer;
    if (resumeAudioPlayer) {
      // resumeAudioPlayer =
      // {
      //   "offsetInMilliseconds": 6068,
      //   "token": "0",
      //   "playerActivity": "STOPPED"
      // },
      this.emit('PlayAudio', resumeAudioPlayer.token, resumeAudioPlayer.offsetInMilliseconds);
    } else {
      this.emit(':tell', this.t('NOT_RESUME_MESSAGE'), this.t('NOT_RESUME_MESSAGE'));
    }
  },
  // 再生からの状態変更が送信されてくる受け取り
  'playback': function() {
    // TODO "type": "System.ExceptionEncountered", のレスポンス送られてくる原因解消する
    // "error": {
    //   "type": "INVALID_RESPONSE",
    //   "message": "SpeechletResponse was null"
    // },
    //
    // this.handler.response.shouldEndSession = true;
    // this.handler.response.sessionAttributes = {};
    // this.response.shouldEndSession(true);
    this.context.succeed({});
  },
  'PlaybackStarted' : function () { this.emit('playback'); },
  'PlaybackFinished' : function () { this.emit('playback'); },
  'PlaybackStopped' : function () { this.emit('playback'); },
  'PlaybackNearlyFinished' : function () {
    // TODO もうすぐ終わるお知らせ来たので次流す
    // playBehavior = 'ENQUEUE' でキューに入れる
    this.emit('playback');
  },
  'PlaybackFailed' : function () {
    console.log("Playback Failed : %j", this.event.request.error);
    this.emit('playback');
  },
  // 設定していない例外たちをキャッチ
  'SessionEndedRequest': function () {},
  'Unhandled': function () {
    if (constants.debug) {
      console.log("\n" + "******************* REQUEST **********************");
      console.log("\n" + JSON.stringify(this.event.request, null, 2));
    }
  },
});

// TODO stateの機能を使いこなしたい。切り替えできるように
module.exports.play = Alexa.CreateStateHandler(STATUS.PLAY, {
  'Unhandled': function () { console.log('waiwai'); },
});
