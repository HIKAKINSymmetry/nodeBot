FROM node:14.16.1

WORKDIR /usr/src/HikakinSymmetry/nodeBot

COPY . ./

# `@types/**` などの開発環境用ライブラリはインストールしない
RUN yarn --production

# TSをJSにトランスパイル
RUN yarn compile

# `dist/index.js` を実行
CMD [ "yarn", "start" ]
