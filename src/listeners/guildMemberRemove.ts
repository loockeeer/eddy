import * as app from "../app"

const listener: app.Listener<"guildMemberRemove"> = {
  event: "guildMemberRemove",
  async run(member) {
    if(member.guild.id !== app.supportGuildInfo.guildID) return;

    if(!member?.user?.bot) {
      member.guild.systemChannel?.send(`${member.user?.tag} a quitté le serveur ! En espérant vous revoir bientôt ! / ${member.user?.tag} left the server ! Hope you'll come back soon !`)
    }
  }
}

module.exports = listener