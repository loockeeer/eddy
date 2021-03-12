import * as app from "../../../app"
import Discord from "discord.js"

export function calculatePermissions(
  dataset: app.eddy.Dataset,
  executor: Discord.Message,
  returnAll: boolean = false
): app.eddy.Permissions | any {
  let userPermission: app.eddy.Permissions | undefined = undefined
  let guildPermission: app.eddy.Permissions | undefined = undefined
  let globalPermission: app.eddy.Permissions = dataset.globalPermission

  for (const specific of dataset.specificPermissions) {
    if (
      specific.targetKind === app.eddy.TargetKinds.GUILD &&
      executor?.guild?.id === specific.target
    )
      guildPermission = specific.permission

    if (
      specific.targetKind === app.eddy.TargetKinds.USER &&
      executor?.author?.id === specific.target
    )
      userPermission = specific.permission
  }
  const permission = userPermission || guildPermission || globalPermission
  if (returnAll)
    return {
      globalPermission,
      guildPermission: guildPermission ?? globalPermission,
      userPermission: userPermission ?? permission,
    }
  else return permission
}
