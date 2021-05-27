import * as app from "../app"

function checkCooldown(message: app.Message) {
  return false
}

const listener: app.Listener<"message"> = {
  event: "message",
  async run(message) {
    if (!app.isCommandMessage(message)) return

    if (!app.cache.ensure<boolean>("turn", true) && message.author.id !== process.env.OWNER) {
      return await message.reply("Bot under maintenance.")
    }


    if (message.author.bot) return
    if (message.content.startsWith(app.ignoreChar)) return

    const prefix = await app.prefix(message.guild ?? undefined)

    if (message.content.startsWith(prefix)) return
    if (!message.client.user) return
    if (
      message.guild &&
      !message.guild.me?.hasPermission("SEND_MESSAGES", {
        checkAdmin: true,
        checkOwner: true,
      })
    )
      return
    const options: {} = message.guild
      ? {
          allowed_mentions: {
            parse: app.guildMentions.ensure(message.guild.id, []),
            replied_user: true,
          },
        }
      : {
          allowed_mentions: {
            replied_user: true,
          },
        }
    try {
      if (!message.client.user) return
      if (
        (await app.isReferencedAnswer(message, message.client.user.id)) &&
        message.guild
      ) {
        const autoTalk = app.eddy.getAutoTalk(message.guild)
        if (autoTalk) {
          if (checkCooldown(message)) return
          const dataset = new app.eddy.Dataset(autoTalk.datasetName)
          return app.reply(
            await app.eddy.generate(dataset, message.content, message),
            message,
            options
          )
        }
      }

      const link = app.eddy.getLink(message.channel)
      if (link) {
        if (checkCooldown(message)) return
        const dataset = new app.eddy.Dataset(link)
        return app.reply(
          await app.eddy.generate(dataset, message.content, message),
          message,
          options
        )
      }

      if (!message.guild) return
      const autoTalk = app.eddy.getAutoTalk(message.guild)
      if (autoTalk) {
        if (Math.random() < autoTalk.probability) {
          if (checkCooldown(message)) return
          const dataset = new app.eddy.Dataset(autoTalk.datasetName)
          return app.reply(
            await app.eddy.generate(dataset, message.content, message),
            message,
            options
          )
        }
      }
    } catch (e) {
      if (e.message !== "Unauthorized") throw e
      if (
        message.guild &&
        !message.guild.me?.hasPermission("ADD_REACTIONS", {
          checkAdmin: true,
          checkOwner: true,
        })
      )
        return
      return await message.react("❌")
    }
    app.cache.set("CD-eddy", {
      time: Date.now(),
      trigger: false,
    })
  },
}

module.exports = listener
