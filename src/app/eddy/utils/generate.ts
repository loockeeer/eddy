import { Dataset, Permissions, TargetKinds } from "../Dataset"
import Discord from "discord.js"
import { calculatePermissions } from "./calculatePermissions"
import { datasetsPath } from "../../utils"
import util from 'util'
import path from "path"

async function generateText(
  dataset: Dataset,
  content: string,
  executor: Discord.Message,
  write: boolean
) {
  const eddy = await dataset.retrieveEddy()
  if (write) {
    eddy.addEntry(content)
    util.promisify(eddy.cn.save.bind(eddy.cn))(path.join(datasetsPath, dataset.filename))
  }
  try {
    return eddy.generateResponse().sentence
  } catch {
    return 'lol'
  }
}

export function generate(
  dataset: Dataset,
  content: string,
  executor: Discord.Message
) {
  const permission = calculatePermissions(dataset, executor)
  if (permission === Permissions.NONE) throw new Error("Unauthorized")

  return generateText(
    dataset,
    content,
    executor,
    permission === Permissions.WRITE
  )
}
