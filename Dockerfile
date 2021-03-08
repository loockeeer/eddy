FROM node:15

WORKDIR /usr/src/app

COPY . .

RUN npm install --loglevel verbose

RUN npm rebuild

CMD [ "npm", "run", "start" ]