FROM node:current-buster

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD [ "npm", "run", "start" ]