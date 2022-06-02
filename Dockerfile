FROM node:16.15.0 as build

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN npm install


FROM node:16.15.0-slim
WORKDIR /usr/app
EXPOSE 3000/tcp
COPY --from=build /usr/app /usr/app
CMD ["npm", "run", "start"]
