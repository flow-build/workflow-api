FROM node:18-alpine as base

RUN apk update && apk add bash && apk add curl

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . /usr/app

RUN npm install

EXPOSE 3000

CMD ["node", "src/server.js"]
