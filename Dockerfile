FROM node:15

COPY . .

RUN npm install

CMD [ "npm", "run", "start" ]