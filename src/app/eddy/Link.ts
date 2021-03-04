import {Dataset} from "./Dataset"
import {links} from "../database"
import Discord from "discord.js"

export function link(dataset: Dataset, channel: Discord.TextChannel | Discord.DMChannel) {
    links.set(channel.id, dataset.name)
}

export function unlink(channel: Discord.TextChannel | Discord.DMChannel) {
    links.delete(channel.id)
}