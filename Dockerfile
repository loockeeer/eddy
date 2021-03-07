FROM node:15

WORKDIR /usr/src/app

COPY . .

RUN apt update && apt install build-essential

RUN npm install

CMD [ "npm", "run", "start" ]