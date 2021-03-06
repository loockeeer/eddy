import { Dataset } from "./Dataset"
import { links } from "../database"
import Discord from "discord.js"

export function link(
  dataset: Dataset,
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
) {
  links.set(channel.id, dataset.name)
}

export function unlink(
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
) {
  links.delete(channel.id)
}

export function getLinksCount(dataset: Dataset): number {
  return links.filterArray((datasetName) => datasetName === dataset.name).length
}
