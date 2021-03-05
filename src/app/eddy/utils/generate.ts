import { Dataset, Permissions, TargetKinds } from "../Dataset"
import Discord from "discord.js"

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
  let userPermission: Permissions | undefined = undefined
  let guildPermission: Permissions | undefined = undefined
  let globalPermission: Permissions = dataset.globalPermission

  for (const specific of dataset.specificPermissions) {
    if (
      specific.targetKind === TargetKinds.GUILD &&
      executor?.guild?.id === specific.target
    )
      guildPermission = specific.permission

    if (
      specific.targetKind === TargetKinds.USER &&
      executor?.id === specific.target
    )
      userPermission = specific.permission
  }

  const permission = userPermission || guildPermission || globalPermission

  if (permission === Permissions.NONE) throw new Error("Unauthorized")

  return generateText(
    dataset,
    content,
    executor,
    permission === Permissions.WRITE
  )
}
