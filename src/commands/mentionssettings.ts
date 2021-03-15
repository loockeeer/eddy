import * as app from "../app"

const command: app.Command = {
  name: "mentionssettings",
  description: "Set the mention settings for this guild",
  aliases: ["ms", "mentions", "m"],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  async run(message) {
    if (!message.guild)
      return message.channel.send("No allowed mentions for DMs !")
    const allowed = app.guildMentions.ensure(message.guild.id, [])
    console.log(allowed)
    const embed = new app.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription("Allowed mentions for this guild")
      .addField(
      "Everyone",
      app.checkMark(allowed.indexOf("everyone") !== -1),
      true
    )
      .addField("Users", app.checkMark(allowed.indexOf("users") !== -1), true)
      .addField("Roles", app.checkMark(allowed.indexOf("roles") !== -1), true)
      .setFooter(app.footer)
      .setColor("BLUE")
      .setTimestamp()
    return message.channel.send(embed)
  },
  subs: [
    {
      name: "set",
      userPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      args: [
        {
          name: "everyone",
          isFlag: true,
          castValue: "boolean",
          checkValueError: "Everyone must be a boolean !",
          default: "",
        },
        {
          name: "roles",
          isFlag: true,
          castValue: "boolean",
          checkValueError: "Roles must be a boolean !",
        },
        {
          name: "users",
          isFlag: true,
          castValue: "boolean",
          checkValueError: "Users must be a boolean !",
        },
      ],
      async run(message) {
        if (!message.guild)
          return message.channel.send(
            "You cannot set allowed mentions in DMs !"
          )
        const oldAllowed = app.guildMentions.ensure(message.guild.id, [])
        const allowed: app.MessageMentionTypes[] = []
        if (message.args.everyone) allowed.push("everyone")
        if (message.args.roles) allowed.push("roles")
        if (message.args.users) allowed.push("users")
        app.guildMentions.set(message.guild.id, allowed)
        const embed = new app.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setDescription("Changed allowed mentions for this guild")
          .addField(
            "Old",
            `
            Everyone : ${app.checkMark(oldAllowed.indexOf("everyone") !== -1)}
            Users : ${app.checkMark(oldAllowed.indexOf("users") !== -1)}
            Roles : ${app.checkMark(oldAllowed.indexOf("roles") !== -1)}
            `,
            true
          )
          .addField("New", `
            Everyone : ${app.checkMark(allowed.indexOf("everyone") !== -1)}
            Users : ${app.checkMark(allowed.indexOf("users") !== -1)}
            Roles : ${app.checkMark(allowed.indexOf("roles") !== -1)}
            `, true)
          .setFooter(app.footer)
          .setColor("BLUE")
          .setTimestamp()
        return message.channel.send(embed)
      },
    },
  ],
}

module.exports = command
