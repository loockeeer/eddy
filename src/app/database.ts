import Discord from "discord.js"
import Enmap from "enmap"
import { DatasetInterface } from "./eddy/Dataset"
import path from "path"
import {enmapPath} from "./utils"

//# Exemple with Enmap:

export const prefixes = new Enmap<Discord.Snowflake, string>({
  name: "prefixes",
  dataDir: path.join(enmapPath, "prefixes")
})

export const datasets = new Enmap<Discord.Snowflake, DatasetInterface>({
  name: "datasets",
  dataDir: path.join(enmapPath, "datasets")
})

export const links = new Enmap<Discord.Snowflake, string>({
  name: "links",
  dataDir: path.join(enmapPath, "links")
})

export const autoTalk = new Enmap<Discord.Snowflake, AutoTalk>({
  name: "autoTalk",
  dataDir: path.join(enmapPath, "autoTalk")
})

export interface AutoTalk {
  datasetName: string
  probability: number
}
