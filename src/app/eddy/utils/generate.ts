import { Dataset, Permissions, TargetKinds } from "../Dataset"
import Discord from "discord.js"
import { calculatePermissions } from "./calculatePermissions"
import { datasetsPath, sendChart } from "../../utils"
import util from "util"
import path from "path"
import {messages, userVerification} from "../../database";

async function generateText(
  dataset: Dataset,
  content: string,
  executor: Discord.Message,
  write: boolean
) {
  const eddy = await dataset.retrieveEddy()
  if (write) {
    eddy.addEntry(content)
    util.promisify(eddy.cn.save.bind(eddy.cn))(
      path.join(datasetsPath, dataset.filename)
    )
  }
  try {
    return eddy
      .generateResponse()
      .sentence.replace(/eddy|(<@!?\d+>)/gi, executor.author)
  } catch {
    return "Une erreur est survenue durant mon processus de génération :/"
  }
}

export async function generate(
  dataset: Dataset,
  content: string,
  executor: Discord.Message
) {
  const permission = calculatePermissions(dataset, executor)

  const verification = userVerification.ensure(executor.author.id, { chartSent: false, accepted: false })
  let verified = verification.accepted;
  if (!verification.accepted && !verification.chartSent) {
    verified = await sendChart(executor, executor.author);
  }

  if (permission === Permissions.NONE) throw new Error("Unauthorized")

  const generated = await generateText(
    dataset,
    content,
    executor,
    permission === Permissions.WRITE && verified
  )
  if(verified) {
    await messages.query('INSERT INTO message (bot_version, created_at, dataset_name, channel_id, guild_id, author_id, request, response) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [process.env.NODE_ENV, Date.now(), dataset.name, executor.channel.id, executor.guild?.id ?? "0", executor.author.id, executor.content, generated]).catch(err => {
      console.error(err)
    })
  }
  return generated
}
