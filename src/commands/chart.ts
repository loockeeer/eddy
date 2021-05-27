import * as app from "../app"
import { sendChart } from "../app"

const command: app.Command = {
  name: "chart",
  positional: [
    {
      name: "choice",
      checkValue: /send|accept|decline/,
      checkValueError: "You need to enter either send, accept or decline"
    }
  ],
  async run(message) {
    switch(message.positional.choice) {
      case 'send':
        await message.react('�');
        await sendChart(message, message.author);
        break;
      case 'accept':
        app.database.userVerification.set(message.author.id, {
          chartSent: true,
          accepted: true
        })
        await message.channel.send(app.messageEmbed('You accepted the chart', message.author))
        break;
      case 'decline':
        app.database.userVerification.set(message.author.id, {
          chartSent: true,
          accepted: false
        })
        await message.channel.send(app.messageEmbed('You declined the chart', message.author))
        break;
    }
  }
}

module.exports = command