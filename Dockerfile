FROM node:15-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk add python2 python3 make gcc g++ make wget

RUN wget "https://sqlite.com/2021/sqlite-amalgamation-3340100.zip" -O amalgation.tar.gz && unzip amalgation.tar.gz

RUN npm install -g node-gyp && npm install && npm run build

CMD [ "/bin/sh" ]