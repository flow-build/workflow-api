FROM node:18.12 as base

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . /usr/app

RUN npm install

EXPOSE 3000

CMD ["node", "src/server.js"]
