FROM node:15-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk add python2 python3 make gcc g++

RUN npm install node-gyp -g

RUN npm install --loglevel verbose

RUN npm rebuild

CMD [ "npm", "run", "start" ]