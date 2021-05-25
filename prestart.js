const fs = require('fs/promises')


fs.mkdir("./data/enmap", {recursive: true})
fs.mkdir("./data/enmap/prefixes", {recursive: true})
fs.mkdir("./data/enmap/datasets", {recursive: true})
fs.mkdir("./data/enmap/links", {recursive: true})
fs.mkdir("./data/enmap/autoTalk", {recursive: true})
fs.mkdir("./data/enmap/guildMentions", {recursive: true})
fs.mkdir("./data/enmap/fetchQueue", {recursive: true})


fs.mkdir("./data/datasets", {recursive: true})

