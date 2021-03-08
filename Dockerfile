FROM node:15

WORKDIR /usr/src/app

COPY . .

# Install deps and compile ts
RUN npm install -g node-gyp && npm install && npm run build

# (Re)build better-sqlite3
RUN make -o /usr/src/app/node_modules/better-sqlite3/build/Makefile

CMD [ "node", "prestart.js", "&&", "node", "dist/index.js" ]