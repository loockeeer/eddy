import Discord from "discord.js"
import * as database from "./database"
import { CommandMessage } from "./handler"
import path from "path"
import fs from "fs/promises"
// @ts-ignore
import Ector from "ector"
import { userVerification } from "./database"

export const footer = `Eddy Malou - Made by Loockeeer#8522`
export const maxDataset = 2
export const datasetsPath = path.join(__dirname, "../../data/datasets")
export const enmapPath = path.join(__dirname, "../../data/enmap")
export const eddyCache = new Discord.Collection<string, Ector>()
export const ignoreChar = "\\"
export const eddyCooldown = 1000
export const supportGuildInfo = {
  botRoleID: "846700474111492106",
  memberRoleID: "725358773677457408",
  guildID: "725356760793088132"
}

export async function prefix(guild?: Discord.Guild): Promise<string> {
  let prefix = process.env.PREFIX as string
  if (guild) prefix = (await database.prefixes.get(guild.id)) ?? prefix
  return prefix
}

export async function getSupportInvite(client: Discord.Client): Promise<Discord.Invite> {
  const guild = client.guilds.cache.get(supportGuildInfo.guildID)
  if(!guild) throw "Support guild no longer exists :/"
  if(!guild.systemChannel) throw "Support guild system channel does not exists !"
  const invite = (await guild.fetchInvites()).find(invite=>invite.inviter?.id === client.user?.id)
  if(!invite) {
    return await guild.systemChannel.createInvite({maxAge: 0, unique: false, reason: "Eddy support invite"})
  } else {
    if(invite.channel?.id !== guild.systemChannel.id) {
      await invite.delete("Invite is not in the good channel !")
      return await getSupportInvite(client);
    } else {
      return invite;
    }
  }
}

export function messageEmbed(
  content: string,
  user: Discord.User,
  color: string = "random"
): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
    .setDescription(content)
    .setColor(color)
    .setFooter(footer)
    .setTimestamp()
}

export function checkMark(b: boolean): string {
  return b ? "✅" : "❌"
}

export async function channelCheckValue(
  value: string,
  message: CommandMessage
) {
  if (!message.guild) return false
  if (value.match(/^<#(\d+)>$/)) {
    const ID = value.match(/^<#(\d+)>$/)?.[1]
    if (!ID) return false
    const channel = message.guild
      ? message.guild.channels.cache.get(ID)
      : message.channel
    return !!channel
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    const channel = message.guild
      ? message.guild.channels.cache.get(ID)
      : message.channel
    return !!channel
  } else {
    const channel = message.guild
      ? message.guild.channels.cache
          .filter((c) => c.isText())
          .find((c) => (c && c.isText() ? c.name.includes(value) : false))
      : message.channel

    return !!channel
  }
}

export async function channelCastValue(value: string, message: CommandMessage) {
  if (value.match(/^<#(\d+)>$/)) {
    const ID = value.match(/^<#(\d+)>$/)?.[1]
    if (!ID) return false
    return message.guild
      ? message.guild.channels.cache.get(ID)
      : message.channel
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    return message.guild
      ? message.guild.channels.cache.get(ID)
      : message.channel
  } else {
    return message.guild
      ? message.guild.channels.cache
          .filter((c) => c.isText())
          .find((c) => (c && c.isText() ? c.name.includes(value) : false))
      : message.channel
  }
}

export async function userCheckValue(value: string, message: CommandMessage) {
  if (value.match(/^<@!?(\d+)>$/)) {
    const ID = value.match(/^<@!?(\d+)>$/)?.[1]
    if (!ID) return false
    const user = await message.client.users.fetch(ID).catch(() => false)
    return !!user
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    const user = await message.client.users.fetch(ID).catch(() => false)
    return !!user
  } else {
    const user = message.client.users.cache.find((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    )
    return !!user
  }
}

export async function userCastValue(value: string, message: CommandMessage) {
  if (value.match(/^<@!?(\d+)>$/)) {
    const ID = value.match(/^<@!?(\d+)>$/)?.[1]
    if (!ID) return false
    return await message.client.users.fetch(ID).catch(() => undefined)
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    return await message.client.users.fetch(ID).catch(() => undefined)
  } else {
    return message.client.users.cache.find((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    )
  }
}

export async function memberCheckValue(value: string, message: CommandMessage) {
  if (value.match(/^<@!?(\d+)>$/)) {
    const ID = value.match(/^<@!?(\d+)>$/)?.[1]
    if (!ID) return false
    const member = await message?.guild?.members.fetch(ID).catch(() => false)
    return !!member
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    const member = await message?.guild?.members.fetch(ID).catch(() => false)
    return !!member
  } else {
    const user = await message?.guild?.members
      ?.fetch({
        query: value,
        limit: 1,
      })
      .catch(() => false)
    return !!user
  }
}

export async function memberCastValue(value: string, message: CommandMessage) {
  if (value.match(/^<@!?(\d+)>$/)) {
    const ID = value.match(/^<@!?(\d+)>$/)?.[1]
    if (!ID) return false
    return message?.guild?.members.fetch(ID).catch(() => undefined)
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    return message?.guild?.members.fetch(ID).catch(() => undefined)
  } else {
    return (
      await message?.guild?.members
        ?.fetch({ query: value, limit: 1 })
        .catch(() => undefined)
    )?.first()
  }
}

export async function isReferencedAnswer(
  message: Discord.Message,
  target: Discord.Snowflake
) {
  if (!message.reference) return false
  const channel = message.client.channels.cache.get(message.reference.channelID)
  if (!channel || !channel.isText()) return false
  if (!message.reference.messageID) return false
  const referenceMessage = await channel.messages.fetch(
    message.reference.messageID
  )

  return referenceMessage?.author?.id === target
}

export function reply(
  content: string,
  message: Discord.Message,
  options: {} = {}
) {
  // @ts-ignore
  return message.client.rest.api.channels[message.channel.id].messages.post({
    data: {
      allowed_mentions: {
        replied_user: true,
      },
      ...options,
      content,
      message_reference: {
        guild_id: message?.guild?.id,
        channel_id: message.channel.id,
        message_id: message.id,
      },
    },
  })
}

export async function getDirectorySize(dirPath: string) {
  const files = await fs.readdir(dirPath)

  return Promise.all(
    files.map((f) => fs.stat(path.join(dirPath, f)))
  ).then((sizes) => sizes.reduce((acc, size) => size.size + acc, 0))
}


const numberExtensions: any = {
  '9': 'B',
  '6': 'M',
  '3': 'k',
  '0': ''
};

function exponent(n: number): number {
  return n === 0 ? 0 : Math.floor(Math.log10(Math.abs(n)))
}

export function humanReadableNumber(n: number): string {
  const exp = Math.max(Math.min(9, 3 * Math.floor(exponent(n) / 3)), 0)
  return n/Math.pow(10, exp)+numberExtensions[exp.toString()];
}


export async function sendChart(message: Discord.Message, user: Discord.User): Promise<boolean> {
  const dm = await user.createDM()
  const chart = new Discord.MessageEmbed()
    .setAuthor("Validation of the privacy policy and code of conduct", user.client?.user?.displayAvatarURL())
    .setDescription("In order to use Eddy, you must accept this charter. In order to avoid any problems with the law, and to provide you with the most transparent experience possible, we ask you to accept/reject the terms of this policy. Nevertheless, even if you don't validate the charter, eddy will remain functional (without the learning features)")
    .addField("Code of Conduct", "Here are the main rules of Eddy:\n" +
      "- Harassment is forbidden (of course): Eddy can be a devastating tool to stalk people, especially because of his strong tendency to repeat everything he hears...\n" +
      "\n" +
      "- Please avoid abusive or explicit language in inappropriate datasets: be respectful, if someone has gone to a lot of trouble to keep Eddy nice, don't try to smear him.")

    .addField("Privacy Policy", "Please consider reading our privacy policy")
    .addField("Data storage", "You agree that the data you exchange with eddy (dataset names, messages exchanged), will be stored in our database. Moreover, we inform you that these data, not sensitive, are not encrypted.", true)
    .addField("Exploitation of user data (by users)", "It is possible that a dataset owner uses the data corresponding to his dataset, which may include yours, to improve his eddy. However, no user can have access to your data via our interface.", true)
    .addField("Exploitation of user data (by us)", "It is also possible that we, the maintainers of Eddy, may use your data to perform optimization tests, or future updates of Eddy. Also, in case you have violated the code of conduct, we may resort to inspection of your data.", true)
    .setFooter("You have exactly 30 minutes to accept or reject the chart from now. If ")
  const msg = await dm.send(chart).catch(async err=>await message.channel.send(chart))

  userVerification.set(user.id, {
    chartSent: true,
    accepted: false
  })

  await msg.react("<:btn_check:847112947565985832>")
  await msg.react("<:btn_deny:847112943702245408>")

  return msg.awaitReactions((r, u)=>r.emoji.id === "847112947565985832" || r.emoji.id === "847112943702245408" && u.id === user.id, { time: 1000*60*30, max: 1 })
    .then(collected => {
      const firstReaction = collected.first()
      if(firstReaction) {
        if(firstReaction.emoji.id === "847112947565985832") {
          userVerification.set(user.id, {
            chartSent: true,
            accepted: true
          })
          message.channel.send("You successfully validated the chart !")
          return true
        } else {
          message.channel.send("You successfully rejected the chart !")
          return false
        }
      } else {
        message.channel.send("Chart validation expired. You can still validate/reject with the `/chart <y/n>` command")
        return false
      }
    }).catch(err=>{
      message.channel.send("Chart validation expired. You can still validate/reject with the `/chart <y/n>` command")
      return false
    })

}