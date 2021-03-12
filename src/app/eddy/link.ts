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

export function getLinks(dataset: Dataset) {
  return links.filter((datasetName) => datasetName === dataset.name)
}

export function getLink(channel: Discord.Channel) {
  return links.get(channel.id) ?? null
}

export function unlinkDatasetAll(dataset: Dataset) {
  return getLinks(dataset).forEach((_, key) => links.delete(key))
}