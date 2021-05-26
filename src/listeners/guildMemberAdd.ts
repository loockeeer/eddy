import * as app from "../app"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  async run(member) {
    if(member.guild.id !== app.supportGuildInfo.guildID) return;

    if(member.user.bot) {
      await member.roles.add(app.supportGuildInfo.botRoleID)
    } else {
      await member.roles.add(app.supportGuildInfo.memberRoleID)
      const embed = new app.MessageEmbed()
        .setImage(member.user?.displayAvatarURL({dynamic:true})  || "")
        .addField("FR", `${member.user?.tag} a rejoint le serveur !`)
        .addField("EN", `${member.user?.tag} has joined the server !`)
      member.guild.systemChannel?.send(embed)
    }
  }
}

module.exports = listener