import {Dataset, Permissions, TargetKinds} from "../Dataset"
import Discord from "discord.js";

export function calculatePermissions(dataset: Dataset, executor: Discord.Message): Permissions {
    let userPermission: Permissions | undefined = undefined
    let guildPermission: Permissions | undefined = undefined
    let globalPermission: Permissions = dataset.globalPermission

    for(const specific of dataset.specificPermissions) {
        if (specific.targetKind === TargetKinds.GUILD && executor?.guild?.id === specific.target
        ) guildPermission = specific.permission

        if (specific.targetKind === TargetKinds.USER && executor?.author?.id === specific.target) userPermission = specific.permission
    }

    return userPermission || guildPermission || globalPermission
}