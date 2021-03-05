import { Dataset, Permissions, TargetKinds } from "../Dataset"
import Discord from "discord.js"

export function calculatePermissions(
  dataset: Dataset,
  executor: Discord.Message,
  returnAll: boolean = false
): Permissions | any {
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
      executor?.author?.id === specific.target
    )
      userPermission = specific.permission
  }

  const permission = userPermission || guildPermission || globalPermission
  if (returnAll)
    return {
      globalPermission,
      guildPermission: guildPermission ?? permission,
      userPermission: userPermission ?? permission,
    }
  else return permission
}
