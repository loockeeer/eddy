import * as app from "../app"

const listener: app.Listener<"guildMemberAdd"> = {
  event: "guildMemberAdd",
  async run(member) {
    if(member.guild.id !== app.supportGuildInfo.guildID) return;

    if(member.user.bot) {
      await member.roles.add(app.supportGuildInfo.botRoleID)
    } else {
      await member.roles.add(app.supportGuildInfo.memberRoleID)
    }
  }
}

module.exports = listener