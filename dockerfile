FROM node:14.16.1

RUN echo "⚠⚠⚠⚠⚠⚠  WARNING  ⚠⚠⚠⚠⚠⚠"
RUN echo "This Docker Image Has GCP Credential Files!"
RUN echo "Don't Publish in Public!"

WORKDIR /usr/src/HikakinSymmetry/nodeBot

COPY . ./

# `@types/**` などの開発環境用ライブラリはインストールしない
RUN yarn --production

# TSをJSにトランスパイル
RUN yarn compile

# `dist/index.js` を実行
CMD [ "yarn", "start" ]
