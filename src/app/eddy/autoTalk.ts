import Discord from "discord.js"
import {Dataset} from "./Dataset"
import {autoTalk} from "../database";

export function setAutoTalk(guild: Discord.Guild, dataset: Dataset, probability: number) {
  autoTalk.set(guild.id, {
    datasetName: dataset.name,
    probability
  })
  return {
    datasetName: dataset.name,
    probability
  }
}

export function removeAutoTalk(guild: Discord.Guild) {
  autoTalk.delete(guild.id)
  return guild.id
}