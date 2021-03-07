import { Dataset, Permissions, TargetKinds } from "../Dataset"
import Discord from "discord.js"
import {calculatePermissions} from "./calculatePermissions";

function generateText(
  dataset: Dataset,
  content: string,
  executor: Discord.Message,
  write: boolean
): string {
  return "Je suis Eddy Malou le savant congolais. Poupidoupidou"
}

export function generate(
  dataset: Dataset,
  content: string,
  executor: Discord.Message
): string {
  const permission = calculatePermissions(dataset, executor)
  if (permission === Permissions.NONE) throw new Error("Unauthorized")

  return generateText(
    dataset,
    content,
    executor,
    permission === Permissions.WRITE
  )
}
