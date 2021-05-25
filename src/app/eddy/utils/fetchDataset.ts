import { Dataset } from "../Dataset"
import { getLinks } from "../link"
import { getAutotalkList } from "../autoTalk"
import Discord, { Collection, Message, Snowflake } from "discord.js"
import { Fetcher } from "discord-fetch-messages"
import { FetchQueue } from "../FetchQueue"
import { generate } from "./generate"

export async function fetchDataset(client: Discord.Client, dataset: Dataset) {
  let channels = getLinks(dataset).keyArray()
  const guilds = getAutotalkList(dataset).map((a, guildID) => guildID)
  channels = [
    ...channels,
    ...guilds
      .map((id) => {
        const guild = client.guilds.cache.get(id)
        if (!guild) return []
        else return guild.channels.cache.map((c) => c.id)
      })
      .flat(),
  ]
  FetchQueue.setStatus(dataset.name, 0)
  let i = 0
  const fetcher = new Fetcher(client)
  fetcher.on("fetchChannel", (channel) => {
    FetchQueue.setStatus(
      dataset.name,
      Number((i++ / channels.length).toFixed(2))
    )
  })
  fetcher.on("fetch", (count: number, messages: Collection<Snowflake, Message>) => {
    for (const message of messages.array()) {
      generate(dataset, message.content, message)
        .catch(() => {})
        .then(() => {})
    }
  })
  await fetcher.fetchChannels(channels)
  client.sweepMessages()
  FetchQueue.pop()
  if (FetchQueue.length() > 0) {
    const newDataset = new Dataset(FetchQueue.first())
    await fetchDataset(client, newDataset)
  }
}
