import Discord from "discord.js"
import Enmap from "enmap"
import { DatasetInterface } from "./eddy/Dataset"
import path from "path"
import { enmapPath } from "./utils"
import pg from 'pg'

export const messages = new pg.Client()

//# Exemple with Enmap:

export const prefixes = new Enmap<Discord.Snowflake, string>({
  name: "prefixes",
  dataDir: path.join(enmapPath, "prefixes"),
})

export const datasets = new Enmap<Discord.Snowflake, DatasetInterface>({
  name: "datasets",
  dataDir: path.join(enmapPath, "datasets"),
})

export const links = new Enmap<Discord.Snowflake, string>({
  name: "links",
  dataDir: path.join(enmapPath, "links"),
})

export const autoTalk = new Enmap<Discord.Snowflake, AutoTalk>({
  name: "autoTalk",
  dataDir: path.join(enmapPath, "autoTalk"),
})

export const userVerification = new Enmap<Discord.Snowflake, UserVerif>({
  name: "userVerif",
  dataDir: path.join(enmapPath, "userVerif"),
})

export interface UserVerif {
  chartSent: boolean
  accepted: boolean
}

export const guildMentions = new Enmap<
  Discord.Snowflake,
  Discord.MessageMentionTypes[]
>({
  name: "guildMentions",
  dataDir: path.join(enmapPath, "guildMentions"),
})

export interface AutoTalk {
  datasetName: string
  probability: number
}
