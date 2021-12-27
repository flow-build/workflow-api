FROM node:14.18.0 as build

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN npm install


FROM node:14.18.0-slim
WORKDIR /usr/app
EXPOSE 3000/tcp
EXPOSE 7227/tcp
COPY --from=build /usr/app /usr/app
CMD ["npm", "run", "start"]
