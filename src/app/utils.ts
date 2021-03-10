import Discord from "discord.js"
import * as database from "./database"
import { CommandMessage } from "./handler"
import path from "path"
import fs from "fs/promises"
// @ts-ignore
import Ector from "ector"

export const footer = `Eddy Malou - Made by Loockeeer#8522`
export const maxDataset = 2
export const datasetsPath = path.join(__dirname, "../../data/datasets")
export const enmapPath = path.join(__dirname, "../../data/enmap")
export const eddyCache = new Discord.Collection<string, Ector>()

export async function prefix(guild?: Discord.Guild): Promise<string> {
  let prefix = process.env.PREFIX as string
  if (guild) prefix = (await database.prefixes.get(guild.id)) ?? prefix
  return prefix
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
    const channel = message.guild.channels.cache.get(ID)
    return !!channel
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    const channel = message.guild.channels.cache.get(ID)
    return !!channel
  } else {
    const channel = message.guild.channels.cache
      .filter((c) => c.isText())
      .find((c) => (c && c.isText() ? c.name.includes(value) : false))
    return !!channel
  }
}

export async function channelCastValue(value: string, message: CommandMessage) {
  if (value.match(/^<#(\d+)>$/)) {
    const ID = value.match(/^<#(\d+)>$/)?.[1]
    if (!ID) return false
    return message?.guild?.channels.cache.get(ID)
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    if (!ID) return false
    return message?.guild?.channels.cache.get(ID)
  } else {
    return message?.guild?.channels.cache
      .filter((c) => c.isText())
      .find((c) => (c && c.isText() ? c.name.includes(value) : false))
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

export function reply(content: string, message: Discord.Message) {
  // @ts-ignore
  return message.client.rest.api.channels[message.channel.id].messages.post({
    data: {
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
