FROM node:15-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk add python make gcc g++

RUN npm install node-gyp

RUN npm install --loglevel verbose

RUN npm rebuild

CMD [ "npm", "run", "start" ]