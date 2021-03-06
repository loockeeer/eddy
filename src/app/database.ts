import Discord from "discord.js"
import Enmap from "enmap"
import { DatasetInterface } from "./eddy/Dataset"

//# Exemple with Enmap:

/** Enmap<Guild, Prefix> */
export const prefixes = new Enmap<Discord.Snowflake, string>({
  name: "prefixes",
})

export const datasets = new Enmap<Discord.Snowflake, DatasetInterface>({
  name: "datasets",
})

export const links = new Enmap<Discord.Snowflake, string>({
  name: "links",
})

export const autoTalk = new Enmap<Discord.Snowflake, AutoTalk>({
  name: "autoTalk"
})

export interface AutoTalk {
  datasetName: string
  probability: number
}
