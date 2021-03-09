import * as app from "../app"
// @ts-ignore
import readableSize from "readable-size"

const command: app.Command = {
  name: "stats",
  async run(message) {
    const embed = new app.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
      .setDescription("I'm a dumb discord bot you can train by speaking with me.")
      .addField('Owner', (await message.client.users.fetch(process.env.OWNER as string)).tag, true)
      .addField('Websocket Ping', `${message.client.ws.ping} ms`, true)
      .addField('Datasets', app.datasets.count, true)
      .addField('Datasets Size', readableSize(await app.getDirectorySize(app.datasetsPath)), true)
      .setFooter(app.footer)
      .setColor('BLUE')
      .setTimestamp()

    if(message.client.uptime) {
      embed.addField('Uptime', app.dayjs(message.client.uptime).format("YYYY MM-DD HH:mm:ss"), true)
    }
    return message.channel.send(embed)
  }

}

module.exports = command