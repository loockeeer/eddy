FROM node:15

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD [ "npm", "run", "start" ]