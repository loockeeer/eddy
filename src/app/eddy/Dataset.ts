import Discord from "discord.js"
import { datasets } from "../database"

export enum Permissions {
  "NONE",
  "USE",
  "WRITE",
}

export enum TargetKinds {
  "USER",
  "GUILD",
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
  private _name: string

  static createDataset(
    name: string,
    ownerID: Discord.Snowflake,
    ownerKind: TargetKinds
  ): DatasetInterface {
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
    }
    datasets.set(name, dataset)
    return dataset
  }

  static getAll() {
    return datasets.array().map((d) => new Dataset(d.name))
  }

  static exists(name: string): boolean {
    return datasets.has(name)
  }

  static existsOwnerID(ownerID: Discord.Snowflake): boolean {
    return datasets.has(ownerID, "ownerID")
  }

  static deleteDataset(name: string): DatasetInterface {
    if (!Dataset.exists(name))
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )

    const dataset = datasets.ensure(name, {} as DatasetInterface)
    datasets.delete(name)
    return dataset
  }

  static getDataset(name: string): DatasetInterface {
    if (!Dataset.exists(name))
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )
    return datasets.ensure(name, {} as DatasetInterface)
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

  static addSpecificPermission(
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

    datasets.push(name, datasetPermission, "specificPermissions")
    return datasetPermission
  }

  static deleteSpecificPermission(
    name: string,
    target: Discord.Snowflake
  ): DatasetPermission {
    if (!Dataset.exists(name))
      throw new DatasetNotExistsError(
        `Dataset with name "${name}" does not exists`
      )

    const dataset = datasets.ensure(name, {} as DatasetInterface)
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

  static getByName(name: string) {
    return new Dataset(name)
  }

  static getByOwnerID(ownerID: Discord.Snowflake) {
    const name = datasets.findKey((dataset) => dataset.ownerID === ownerID)
    if (!name)
      return new DatasetNotExistsError(
        `User/Guild with ID ${ownerID} does not have any dataset`
      )
    return new Dataset(name)
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

  set globalPermission(newPermission: Permissions) {
    Dataset.changeGlobalPermission(this._name, newPermission)
  }

  get specificPermissions() {
    return this.data.specificPermissions
  }

  delete() {
    return Dataset.deleteDataset(this._name)
  }
}
