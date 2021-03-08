FROM node:15-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk add python2 python3 make gcc g++ make

RUN npm install -g node-gyp && npm install && npm run build

WORKDIR /usr/src/app/node_modules/better-sqlite3/build

RUN make

WORKDIR /usr/src/app

CMD [ "node", "prestart.js", "&&", "node", "."]