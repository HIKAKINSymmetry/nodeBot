# This reos is now under develop!

このリポジトリは現在開発中です。**現時点では正常に稼働しません。**

# HIKAKINSymmetry/nodeBot

[@HIKAKIN_SYM](https://twitter.com/@HIKAKIN_SYM) の再実装, および稼働を目的としたプロジェクトのリポジトリです.

[HIKAKIN_SYM/Bot](https://github.com/HIKAKIN-SYM/Bot) の挙動をある程度再現しています

# 変更点

+ Youtubeのサムネイルを処理したかどうか判別するために使っているDBをSQLite3からGCPの提供するFirestoreに変更しています
+ 実装言語を Python3 から TypeScript に変更しています
	+ 現状考えてませんが, CloudFunctions などの FaaS に乗せ換えも技術的には可能です
+ 現時点では出来る限り並列処理をさせている(つもり)なので, 先代よりも少しは高速かもしれません

# 使用するAPI(サービス)

## Google Cloud Platform

+ Cloud Vision API
	+ 顔認識に使用しています
+ Youtube Data API
	+ Youtubeからのサムネイル等, 必要な情報の取得に使用
+ Firestore
	+ Youtubeのサムネイルをシンメトリーにして投稿などしたときに状況を保存する目的で使用しています

## Twitter

+ TwitterAPI(Standard v1.1)
	+ ツイッターへの投稿や, HIKAKIN氏の投稿の取得に使用

# 稼働までの手続き

## GCPのサービスアカウントの作成など

1. GCPのプロジェクトを作成して, 各APIを有効化します
2. GCPのプロジェクトIDを `${ProjectRoot}/.envs/env.yaml` に記述してください
3. サービスアカウントを作成する(Firestoreへの書き込み, 読み込みが可能なロールで)
4. サービスアカウントの鍵をJSONで発行, ダウンロードしたら `${ProjectRoot}/.envs/serviceAccount.json` の形で格納してください
5. Youtube Data APIのみサービスアカウントでの取得ができませんので
> GCPのコンソール -> APIとサービス -> Youtube Data API v3 -> 認証情報

からAPIキーを発行してください.
また, Youtube Data API以外へのアクセスをAPIキー設定から禁止することをお勧めします.
6. 発行したYoutube Data API用のAPIキーを`${ProjectRoot}/.envs/env.yaml` に記述して保存してください

## Twitter API のAPIキー作成
1. https://developer.twitter.com から開発者申請をしてください
	Google翻訳使いまくっても問題ないです
2. 申請が終わればStandalone Appsからプロジェクトを作成してください.
	Permission は **Read and Write** より上で設定してください
3. Consumerキーが発行できたら, oAuthするなり管理者のアクセストークンを作るなりで `AccessKey` と `AccessSecret` を発行してください
4. `ConsumerKey(Secret)` , `AccessKey(Secret)` の4つを `${ProjectRoot}/.envs/env.yaml` に記述して保存してください

## 認証情報の扱い

GCPのサービスアカウント以外の情報は `${ProjectRoot}/.envs/env.yaml` に保存することで管理しています
`${ProjectRoot}/env.sample.yaml` がサンプルになっているので, これに記述したのちリネームして置くといいでしょう

