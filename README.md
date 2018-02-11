# yatteskill

alexaスキルでpodcastの再生

下記のユーザー登録が必要

- [AWS](https://aws.amazon.com)
- [Amazon開発者コンソール](https://developer.amazon.com)

Alexa Skill Kit -> Audio Playerで「はい」のチェックボックスを設定、
AWS Lambdaを使用する。

## ファイル構成

```
.
├── IntentSchema.json
├── README.md
├── Utterances.txt
├── event.json
├── functions
│   └── podcast
│       ├── constants.js
│       ├── function.json.sample
│       ├── index.js
│       ├── language.js
│       ├── lib
│       │   ├── feed.js
│       │   └── handlers.js
│       ├── package-lock.json
│       └── package.json
└── project.json.sample

3 directories, 13 files
```

`IntentSchema.json`
Amazon開発者コンソール -> Alexa Skill Kit -> 対話モデル -> インテントスキーマ

`Utterances.txt`
Amazon開発者コンソール -> Alexa Skill Kit -> 対話モデル -> サンプル発話

`event.json`
Alexaから送信されるリクエストjsonのサンプル

## セットアップ

    cp project.json.sample project.json
    cp functions/podcast/function.json.sample functions/podcast/function.json

    export YOUR_ROLE=''
    sed -i -e "s/YOUR_ROLE/${YOUR_ROLE}/g" project.json
    export YOUR_APPLICATION_ID=''
    sed -i -e "s/YOUR_APPLICATION_ID/${YOUR_APPLICATION_ID}/g" functions/podcast/function.json

## デプロイ

    cd functions/podcast
    npm install
    cd ../../
    apex deploy

## テスト

    apex invoke podcast < event.json | jq

## ログ

    apex logs -f
