import * as app from "../app"

const command: app.Command = {
  name: "support",
  async run(message: app.Message) {
    return message.channel.send(app.utils.messageEmbed(`Rejoignez le support en cliquant [ici](${await app.utils.getSupportInvite(message.client)})`, message.author))
  }
}

module.exports = command