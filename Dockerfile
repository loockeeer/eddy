FROM node:15

WORKDIR /usr/src/app

COPY . .

RUN npm install --loglevel verbose

RUN node-gyp rebuild

CMD [ "npm", "run", "start" ]