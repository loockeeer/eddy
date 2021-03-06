import Discord from "discord.js"
import * as database from "./database"
import { CommandMessage } from "./handler"

export const footer = `Eddy Malou - Made by Loockeeer#8522`

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
  if (value.match(/^<#(\d+)>$/)) {
    const ID = value.match(/^<#(\d+)>$/)?.[1]
    const channel = message?.guild?.channels.cache.get(ID as string)
    return !!channel
  } else if (value.match(/d+/)) {
    const ID = value.match(/d+/)?.[1]
    const channel = message?.guild?.channels.cache.get(ID as string)
    return !!channel
  } else {
    const channel = message?.guild?.channels.cache
      .filter((c) => c.isText())
      .find((c) => (c as Discord.TextChannel).name.includes(value))
    return !!channel
  }
}

export async function channelCastValue(value: string, message: CommandMessage) {
  if (value.match(/^<#(\d+)>$/)) {
    const ID = value.match(/^<#(\d+)>$/)?.[1]
    return message?.guild?.channels.cache.get(ID as string)
  } else if (value.match(/d+/)) {
    const ID = value.match(/d+/)?.[1]
    return message?.guild?.channels.cache.get(ID as string)
  } else {
    return message?.guild?.channels.cache
      .filter((c) => c.isText())
      .find((c) => (c as Discord.TextChannel).name.includes(value))
  }
}

export async function userCheckValue(value: string, message: CommandMessage) {
  if (value.match(/^<@!?(\d+)>$/)) {
    console.log(value.match(/^<@!?(\d+)>$/))
    const ID = value.match(/^<@!?(\d+)>$/)?.[1]
    const user = await message.client.users.fetch(ID as string).catch(e=>false)
    return !!user
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    const user = await message.client.users.fetch(ID as string).catch(e=>false)
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
    return await message.client.users.fetch(ID as string).catch(e=>undefined)
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    return await message.client.users.fetch(ID as string).catch(e=>undefined)
  } else {
    return message.client.users.cache.find((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    )
  }
}

export async function memberCheckValue(value: string, message: CommandMessage) {
  if (value.match(/^<@!?(\d+)>$/)) {
    const ID = value.match(/^<@!?(\d+)>$/)?.[1]
    const member = await message?.guild?.members.fetch(ID as string).catch(e=>false)
    return !!member
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    const member = await message?.guild?.members.fetch(ID as string).catch(e=>false)
    return !!member
  } else {
    const user = await message?.guild?.members?.fetch({
      query: value,
      limit: 1,
    }).catch(e=>false)
    return !!user
  }
}

export async function memberCastValue(value: string, message: CommandMessage) {
  if (value.match(/^<@!?(\d+)>$/)) {
    const ID = value.match(/^<@!?(\d+)>$/)?.[1]
    return message?.guild?.members.fetch(ID as string).catch(e => undefined);
  } else if (value.match(/\d+/)) {
    const ID = value.match(/\d+/)?.[0]
    return message?.guild?.members.fetch(ID as string).catch(e => undefined);
  } else {
    return (await message?.guild?.members?.fetch({ query: value, limit: 1 }).catch(e=>undefined))?.first()
  }
}
