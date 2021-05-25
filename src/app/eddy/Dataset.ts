import Discord from "discord.js"
import fs from "fs/promises"
import path from "path"
import { datasets } from "../database"
import { datasetsPath, messageEmbed, eddyCache } from "../utils"
import { CommandMessage } from "../handler"
import util from 'util'
import {unlinkDatasetAll} from "./link"
// @ts-ignore
import Ector from "ector"
// @ts-ignore
import { FileConceptNetwork } from "file-concept-network"
import { FetchQueue } from "./FetchQueue"

export enum Permissions {
  "NONE" = "NONE",
  "USE" = "USE",
  "WRITE" = "WRITE",
}

export enum TargetKinds {
  "USER" = "USER",
  "GUILD" = "GUILD",
}

export interface DatasetPermission {
  targetKind: TargetKinds
  permission: Permissions
  target: Discord.Snowflake
}

export interface DatasetInterface {
  name: string
  globalPermission: Permissions
  specificPermissions: DatasetPermission[]
  createdAt: number
  ownerID: Discord.Snowflake
  ownerKind: TargetKinds
}

export class DatasetExistsError extends Error {
  constructor(message: string) {
    super(`Dataset with name ${message} already exists`)
    this.name = "DatasetExistsError"
  }
}

export class DatasetNotExistsError extends Error {
  constructor(message: string) {
    super(`Dataset with ownerID ${message} does not exists`)
    this.name = "DatasetNotExistsError"
  }
}

export class Dataset {
  private readonly _name: string

  static checkOwner(datasetName: string, message: CommandMessage) {
    const dataset = Dataset.getDataset(datasetName)
    if (!dataset)
      throw new DatasetNotExistsError(
        `Dataset with name "${datasetName}" does not exists`
      )
    if (
      message.positional.dataset.data.ownerKind === TargetKinds.GUILD &&
      message?.guild?.id !== message.positional.dataset.ownerID
    ) {
      return message.channel.send(
        messageEmbed(
          `Dataset ${message.positional.dataset.name} does not belong to this guild`,
          message.author,
          "RED"
        )
      )
    } else if (
      message.positional.dataset.data.ownerKind === TargetKinds.GUILD &&
      !message?.member?.hasPermission("MANAGE_GUILD", {
        checkAdmin: true,
        checkOwner: true,
      })
    ) {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setAuthor(
            `You need the \`MANAGE_GUILD\` permission to call this command.`,
            message.client.user?.displayAvatarURL({ dynamic: true })
          )
      )
    } else if (
      message.positional.dataset.data.ownerKind === TargetKinds.USER &&
      message.positional.dataset.ownerID !== message.author.id
    ) {
      return message.channel.send(
        messageEmbed(
          `Dataset ${message.positional.dataset.name} does not belong to you`,
          message.author,
          "RED"
        )
      )
    }
  }

  static async createDataset(
    name: string,
    ownerID: Discord.Snowflake,
    ownerKind: TargetKinds,
    ngrams = 3
  ): Promise<DatasetInterface> {
    if (Dataset.exists(name))
      throw new DatasetExistsError(`Dataset with name "${name}" already exists`)
    const dataset = {
      name,
      globalPermission: Permissions.NONE,
      specificPermissions: [
        {
          targetKind: ownerKind,
          permission: Permissions.WRITE,
          target: ownerID,
        },
      ],
      ownerID,
      ownerKind,
      createdAt: Date.now(),
      ngrams,
    }
    datasets.set(name, dataset)
    await fs.writeFile(
      path.join(datasetsPath, `${dataset.name}-${dataset.createdAt}.json`),
      "{}"
    )
    return dataset
  }

  static getAll() {
    return datasets.array().map((d) => new Dataset(d.name))
  }

  static fetchStatus(name: string) {
    return FetchQueue.index(name) === 0
  }

  static exists(name: string): boolean {
    return datasets.has(name)
  }

  static getDatasetsByOwnerID(ownerID: Discord.Snowflake): Dataset[] {
    return datasets
      .filter((d) => d.ownerID === ownerID)
      .map((d) => new Dataset(d.name))
  }

  static async deleteDataset(name: string): Promise<DatasetInterface> {
    const dataset = Dataset.getDataset(name)
    if (!dataset)
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )

    datasets.delete(name)
    await fs.unlink(
      path.join(datasetsPath, `${dataset.name}-${dataset.createdAt}.json`)
    )
    eddyCache.delete(name)
    return dataset
  }

  static getDataset(name: string): DatasetInterface {
    const dataset = datasets.get(name)
    if (!dataset)
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )
    return dataset
  }

  static changeGlobalPermission(
    name: string,
    newPermission: Permissions
  ): Permissions {
    if (!Dataset.exists(name))
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )

    datasets.set(name, newPermission, "globalPermission")

    return newPermission
  }

  static setSpecificPermission(
    name: string,
    target: Discord.Snowflake,
    targetKind: TargetKinds,
    permission: Permissions
  ): DatasetPermission {
    if (!Dataset.exists(name))
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )

    const datasetPermission = {
      targetKind,
      target,
      permission,
    }
    if (
      !datasets
        .get(name)
        ?.specificPermissions?.find((sp) => sp.target === target)
    )
      datasets.push(name, datasetPermission, "specificPermissions")
    return datasetPermission
  }

  static deleteSpecificPermission(
    name: string,
    target: Discord.Snowflake
  ): DatasetPermission {
    const dataset = Dataset.getDataset(name)
    if (!dataset)
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )

    const toDelete = dataset.specificPermissions.find(
      (el) => el.target === target
    )

    if (!toDelete)
      throw new Error(`No specific permission for user/guild with id ${target}`)

    datasets.set(
      name,
      dataset.specificPermissions.filter((el) => el.target !== target),
      "specificPermissions"
    )

    return toDelete
  }

  static async retrieveEddy(name: string) {
    const dataset = Dataset.getDataset(name)
    if (!dataset)
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )
    let cached = eddyCache.get(name)
    if(!cached) {
      cached = new Ector()
      cached.injectConceptNetwork(FileConceptNetwork)
      eddyCache.set(name, cached)
      if ((await fs.readFile(path.join(datasetsPath, `${dataset.name}-${dataset.createdAt}.json`))).toString() !== "{}") {
        await util.promisify(cached.cn.load.bind(cached.cn))(path.join(datasetsPath, `${dataset.name}-${dataset.createdAt}.json`))
      }

    }
    return cached
  }

  constructor(name: string) {
    this._name = name
  }

  create(ownerID: Discord.Snowflake, ownerKind: TargetKinds, name: string) {
    Dataset.createDataset(name, ownerID, ownerKind)
  }

  get data() {
    return Dataset.getDataset(this._name)
  }

  get name() {
    return this._name
  }

  get ownerID() {
    return this.data.ownerID
  }

  get globalPermission() {
    return this.data.globalPermission
  }

  get createdAt() {
    return this.data.createdAt
  }

  get filename() {
    return `${this.name}-${this.createdAt}.json`
  }

  set globalPermission(newPermission: Permissions) {
    Dataset.changeGlobalPermission(this._name, newPermission)
  }

  get specificPermissions() {
    return this.data.specificPermissions
  }

  setSpecificPermission(
    targetID: Discord.Snowflake,
    targetKind: TargetKinds,
    permission: Permissions
  ) {
    return Dataset.setSpecificPermission(
      this.name,
      targetID,
      targetKind,
      permission
    )
  }

  deleteSpecificPermission(targetID: Discord.Snowflake) {
    return Dataset.deleteSpecificPermission(this.name, targetID)
  }

  delete() {
    unlinkDatasetAll(this)
    return Dataset.deleteDataset(this._name)
  }

  getFetchStatus() {
    return Dataset.fetchStatus(this._name)
  }

  checkOwner(message: CommandMessage) {
    return Dataset.checkOwner(this._name, message)
  }

  retrieveEddy() {
    return Dataset.retrieveEddy(this._name)
  }
}
