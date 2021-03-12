import * as app from "../app"
// @ts-ignore
import readableSize from "readable-size"

const command: app.Command = {
  name: "stats",
  async run(message) {
    const invite = await message.client.generateInvite({
      permissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    })
    const embed = new app.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
      .setDescription(`I'm a dumb discord bot you can train by speaking with me. [Invite me](${invite}) !`)
      .addField('Owner', (await message.client.users.fetch(process.env.OWNER as string)).tag, true)
      .addField('Websocket Ping', `${message.client.ws.ping} ms`, true)
      .addField('Dataset Count', app.datasets.count, true)
      .addField('Datasets Size', readableSize(await app.getDirectorySize(app.datasetsPath)), true)
      .addField('Guild Count', message.client.guilds.cache.size, true)
      .addField('RAM Usage', readableSize(process.memoryUsage().heapUsed), true)
      .setFooter(app.footer)
      .setColor('BLUE')
      .setTimestamp()

    if(message.client.uptime) {
      embed.addField('Uptime', app.dayjs(Date.now() - message.client.uptime).fromNow(), true)
    }

    return message.channel.send(embed)
  }

}

module.exports = command