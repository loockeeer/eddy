import * as app from "../app"

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if(!app.isCommandMessage(message)) return
    if(message.author.bot) return
    if(message.content.startsWith(app.ignoreChar)) return

    const prefix = await app.prefix(message.guild ?? undefined)

    if (message.content.startsWith(prefix)) return

    try {
      if (!message.client.user) return
      if (await app.isReferencedAnswer(message, message.client.user.id) && message.guild) {
        const autoTalk = app.eddy.getAutoTalk(message.guild)
        if (autoTalk) {
          const dataset = new app.eddy.Dataset(autoTalk.datasetName)
          app.reply(await app.eddy.generate(dataset, message.content, message), message)
        }
      }

      const link = app.eddy.getLink(message.channel)
      if (link) {
        const dataset = new app.eddy.Dataset(link)
        app.reply(await app.eddy.generate(dataset, message.content, message), message)
      }

      if (!message.guild) return
      const autoTalk = app.eddy.getAutoTalk(message.guild)
      if (autoTalk) {
        if (Math.random() < autoTalk.probability) {
          const dataset = new app.eddy.Dataset(autoTalk.datasetName)
          app.reply(await app.eddy.generate(dataset, message.content, message), message)
        }
      }
    } catch(e){
      if(e.message !== "Unauthorized") throw e
      await message.react('❌')

    }
  }
}

module.exports = listener