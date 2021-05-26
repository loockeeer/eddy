import * as app from "../app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  async run(member) {
    if(member.guild.id !== app.supportGuildInfo.guildID) return;

    if(!member?.user?.bot) {
      const embed = new app.MessageEmbed()
        .setImage(member.user?.displayAvatarURL({dynamic:true})  || "")
        .addField("FR", `${member.user?.tag} a quitté le serveur...`)
        .addField("EN", `${member.user?.tag} left the server...`)
      member.guild.systemChannel?.send(embed)
    }
  }
}

module.exports = listener