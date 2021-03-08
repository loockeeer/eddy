FROM node:15

WORKDIR /usr/src/app

COPY . .

RUN npm install better-sqlite3 --loglevel verbose

RUN npm install --loglevel verbose

CMD [ "npm", "run", "start" ]