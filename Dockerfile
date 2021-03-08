FROM node:15-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk add python2 python3 make gcc g++ make

RUN npm install -g node-gyp

RUN npm install

RUN npm run build

RUN node prestart.js

CMD [ "node", "dist/index.js" ]