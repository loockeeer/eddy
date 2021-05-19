import * as app from "../app"

// @ts-ignore
const command: app.Command = {
  name: "dataset",
  aliases: ["d", "ds"],
  description: "Show information about a dataset",
  positional: [
    {
      name: "dataset",
      description: "The dataset you want to choose",
      checkValue: (datasetName) => app.eddy.Dataset.exists(datasetName),
      checkValueError: "There is not any dataset with that name : {}",
      castValue: (datasetName) => new app.eddy.Dataset(datasetName),
      required: true,
    },
  ],
  async run(message) {
    const dataset: app.eddy.Dataset = message.positional.dataset
    const { guildPermission, userPermission } = app.eddy.calculatePermissions(
      dataset,
      message,
      true
    )
    const embed = new app.MessageEmbed()
      .setAuthor(
        message.author.tag,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .addField("Name", dataset.name, true)
      .addField(
        "Owner",
        dataset.data.ownerKind === app.eddy.TargetKinds.USER
          ? (await message.client.users.fetch(dataset.ownerID)).catch(err=>({})).tag
          : (await message.client.guilds.fetch(dataset.ownerID)).catch(err=>({})).name,
        true
      )
      .addField(
        "Creation date",
        app.dayjs(dataset.createdAt).format("YYYY MM-DD HH:mm:ss"),
        true
      )
      .addField(
        "Global permissions",
        `Use : ${app.checkMark(
          dataset.globalPermission !== app.eddy.Permissions.NONE
        )} \n Write : ${app.checkMark(
          dataset.globalPermission === app.eddy.Permissions.WRITE
        )}`,
        true
      )
      .addField(
        "Permissions for guild",
        `Use : ${app.checkMark(
          guildPermission !== app.eddy.Permissions.NONE
        )} \n Write : ${app.checkMark(
          guildPermission === app.eddy.Permissions.WRITE
        )}`,
        true
      )
      .addField(
        "Permissions for you",
        `Use : ${app.checkMark(
          userPermission !== app.eddy.Permissions.NONE
        )} \n Write : ${app.checkMark(
          userPermission === app.eddy.Permissions.WRITE
        )}`,
        true
      )
      .addField("Ngrams", dataset.ngrams)
      .setColor("BLUE")
      .setTimestamp()
      .setFooter(app.footer)
    return message.channel.send(embed)
  },
  subs: [
    {
      name: "link",
      aliases: ["li"],
      description: "Create a link between a channel and a dataset",
      positional: [
        {
          name: "dataset",
          description: "The dataset you want to choose",
          checkValue: (datasetName) => app.eddy.Dataset.exists(datasetName),
          checkValueError: "There is not any dataset with that name : {}",
          castValue: (datasetName) => new app.eddy.Dataset(datasetName),
          default: "",
        },
        {
          name: "channel",
          description: "The channel to link",
          checkValue: async (value, message) =>
            !message?.guild
              ? true
              : await app.channelCheckValue(value, message),
          default: (message) => message.channel.id,
          checkValueError: 'There is not any channel "{}" in this guild !',
          castValue: async (value, message) =>
            await app.channelCastValue(value, message),
        },
      ],
      args: [
        {
          name: "autoTalk",
          description:
            "Autotalk must be number (percentage actually) which represent the probability for eddy to talk in the server by himself. Use 0% to disable.",
          castValue: "number",
          checkValue: (v) => {
            return /\d+(.\d+)?/.test(v) && Number(v) >= 0 && Number(v) <= 100
          },
          checkValueError:
            "AutoTalk must be a number and between 0 and 100 included",
        },
        {
          name: "list",
          description:
            "Whether or not you want to list the links created on this guild",
          castValue: "boolean",
          checkValue: /true|false/,
          checkValueError: "List must be a boolean (false/true)",
          default: "false",
        },
      ],
      async run(message) {
        const dataset = message.positional.dataset
        if (message.args.list) {
          let links
          if (!message.guild) {
            links = app.database.links.ensure(message.channel.id, "")
            links = links
              ? [`**${message.channel}** linked with dataset **${links}**`]
              : undefined
          } else {
            links = message.guild.channels.cache
              .map((c) => ({
                channel: c,
                link: app.database.links.ensure(c.id, ""),
              }))
              .filter((c) => !!c.link)
              .map((c) => `**${c.channel}** linked with dataset **${c.link}**`)
          }

          if (!links) {
            return message.channel.send(
              app.messageEmbed(
                `There is no link in this ${message.guild ? "guild" : "DM"} !`,
                message.author,
                "RED"
              )
            )
          }
          return new app.Paginator(
            app.Paginator.divider(links, 10).map((page, index) => {
              const embed = new app.MessageEmbed()
                .setColor("BLUE")
                .setAuthor(
                  "Links list",
                  message.client.user?.displayAvatarURL({ dynamic: true })
                )
                .setDescription(page.join("\n"))
              if (index === 0 && message.guild) {
                const autoTalk = app.eddy.getAutoTalk(message.guild)
                embed.addField(
                  "AutoTalk",
                  autoTalk
                    ? `Dataset : ${autoTalk.datasetName}\nProbability: ${
                        autoTalk.probability * 100
                      }%`
                    : "AutoTalk is not configured on this guild"
                )
              }
              return embed
            }),
            message.channel,
            (reaction, user) => user.id === message.author.id
          )
        }

        if (!app.eddy.Dataset.exists(dataset.name)) {
          return message.channel.send(
            new app.MessageEmbed()
              .setColor("RED")
              .setAuthor(
                `Missing positional "${this.positional?.[0]?.name}"`,
                message.client.user?.displayAvatarURL()
              )
              .setDescription(
                this.positional?.[0]?.description
                  ? "Description: " + this.positional?.[0]?.description
                  : `Example: \`--${this.positional?.[0]?.name}=someValue\``
              )
          )
        }

        if (message.args.autoTalk !== null) {
          if (!message?.guild) {
            return message.channel.send(
              new app.MessageEmbed()
                .setColor("RED")
                .setAuthor(
                  "This option is guild only.",
                  message.client.user?.displayAvatarURL()
                )
            )
          }
          if (message.args.autoTalk === 0) {
            app.eddy.removeAutoTalk(message.guild)
            return message.channel.send(
              app.messageEmbed(
                `Successfully removed autoTalk feature on this guild`,
                message.author,
                "GREEN"
              )
            )
          } else {
            app.eddy.setAutoTalk(
              message.guild,
              dataset,
              message.args.autoTalk / 100
            )
            return message.channel.send(
              app.messageEmbed(
                `Successfully set autoTalk feature using dataset ${dataset.name} and probability ${message.args.autoTalk}%`,
                message.author,
                "GREEN"
              )
            )
          }
        }
        if (
          app.eddy.calculatePermissions(dataset, message) ===
          app.eddy.Permissions.NONE
        ) {
          return message.channel.send(
            app.messageEmbed(
              `You do not have \`USE\` permission on that dataset`,
              message.author,
              "RED"
            )
          )
        } else {
          app.eddy.link(dataset, message.positional.channel)
          return message.channel.send(
            app.messageEmbed(
              `Successfully linked ${message.positional.channel} with ${dataset.name}`,
              message.author,
              "GREEN"
            )
          )
        }
      },
    },
    {
      name: "unlink",
      aliases: ["ul"],
      description: "Remove the link between a channel and a dataset",
      positional: [
        {
          name: "channel",
          description: "The channel to link",
          checkValue: async (value, message) =>
            !message?.guild
              ? true
              : await app.channelCheckValue(value, message),
          default: (message) => message.channel.id,
          checkValueError: 'There is not any channel "{}" in this guild !',
          castValue: async (value, message) =>
            await app.channelCastValue(value, message),
        },
      ],
      async run(message) {
        app.eddy.unlink(message.channel)
        return message.channel.send(
          app.messageEmbed(
            `Successfully unlinked channel ${message.positional.channel}`,
            message.author,
            "GREEN"
          )
        )
      },
    },
    {
      name: "list",
      aliases: ["l"],
      description: "List the available datasets",
      async run(message) {
        const totalDatasets = app.eddy.Dataset.getAll()
          .map((d) => ({ u: app.eddy.getLinksCount(d), dataset: d }))
          .sort((a, b) => {
            return b.u - a.u
          })
        if (totalDatasets.length === 0) {
          return message.channel.send(
            app.messageEmbed(`No dataset found :/`, message.author, "BLUE")
          )
        }
        const formatted = totalDatasets.map(async (dataset) => {
          return `Links: ${dataset.u} - ${dataset.dataset.name} | ${
            dataset.dataset.data.ownerKind === app.eddy.TargetKinds.USER
              ? (await message.client.users.fetch(dataset.dataset.ownerID)).catch(err=>({})).tag
              : (await message.client.guilds.fetch(dataset.dataset.ownerID)).catch(err=>({}))
                  .name
          }`
        })
        new app.Paginator(
          app.Paginator.divider(await Promise.all(formatted), 10).map(
            (page) => {
              return new app.MessageEmbed()
                .setColor("BLUE")
                .setAuthor(
                  "Datasets list",
                  message.client.user?.displayAvatarURL({ dynamic: true })
                )
                .setDescription(page.join("\n"))
            }
          ),
          message.channel,
          (reaction, user) => user.id === message.author.id
        )
      },
    },
    {
      name: "create",
      aliases: ["new", "make", "add"],
      description: "Create a new dataset",
      positional: [
        {
          name: "name",
          description: "The name of the new dataset",
          checkValue: (value) => !app.eddy.Dataset.exists(value) && !/\W/g.test(value),
          checkValueError: "A dataset already exists with name {} or it match this regex : /\\W/g",
        },
      ],
      args: [
        {
          name: "user",
          description: "Whether or not you are the owner of the dataset",
          castValue: "boolean",
          checkValue: /true|false/,
          checkValueError: "User must be a boolean (false/true)",
          required: false,
          default: "false",
        },
        {
          name: "ngrams",
          description: "Ngrams count, could not be changed",
          castValue: "number",
          checkValue: (v) => Number(v) > 0 && Number(v) < 10,
          checkValueError: "Ngrams must be a number and between 0 and 10",
          required: false,
          default: "3",
        },
      ],
      async run(message) {
        if (
          app.eddy.Dataset.getDatasetsByOwnerID(
            message.args.user || !message?.guild
              ? message.author.id
              : message.guild.id
          ).length >= app.maxDataset
        ) {
          return message.channel.send(
            app.messageEmbed(
              `${
                message.args.user ? "You already" : "This guild already"
              } owns ${app.maxDataset} dataset${
                app.maxDataset > 1 ? "s" : ""
              } ! Please remove one before creating another`,
              message.author,
              "RED"
            )
          )
        }
        try {
          await app.eddy.Dataset.createDataset(
            message.positional.name,
            message.args.user || !message?.guild
              ? message.author.id
              : message.guild.id,
            message.args.user || !message?.guild
              ? app.eddy.TargetKinds.USER
              : app.eddy.TargetKinds.GUILD,
            message.args.ngrams
          )
        } catch (e) {
          if (e instanceof app.eddy.DatasetExistsError) {
            return message.channel.send(
              app.messageEmbed(
                `A dataset already exists with name ${message.positional.name}`,
                message.author,
                "RED"
              )
            )
          }
        }

        return message.channel.send(
          app.messageEmbed(
            `Dataset created with name ${message.positional.name}`,
            message.author,
            "GREEN"
          )
        )
      },
    },
    {
      name: "delete",
      aliases: ["remove", "rm", "dl"],
      positional: [
        {
          name: "dataset",
          description: "The dataset you want to choose",
          checkValue: (datasetName) => app.eddy.Dataset.exists(datasetName),
          checkValueError: "There is not any dataset with that name : {}",
          castValue: (datasetName) => new app.eddy.Dataset(datasetName),
          required: true,
        },
      ],
      async run(message) {
        if (
          message.positional.dataset.data.ownerKind ===
          app.eddy.TargetKinds.GUILD
        ) {
          if (message?.guild?.id !== message.positional.dataset.ownerID) {
            return message.channel.send(
              app.messageEmbed(
                `Dataset ${message.positional.dataset.name} does not belong to this guild`,
                message.author,
                "RED"
              )
            )
          }
          if (
            !message?.member?.hasPermission("MANAGE_GUILD", {
              checkAdmin: true,
              checkOwner: true,
            })
          ) {
            return message.channel.send(
              new app.MessageEmbed()
                .setColor("RED")
                .setAuthor(
                  `You need the \`MANAGE_GUILD\` permission to call this command.`,
                  message.client.user?.displayAvatarURL({ dynamic: true })
                )
            )
          } else {
            message.positional.dataset.delete()
            return message.channel.send(
              app.messageEmbed(
                `Dataset ${message.positional.dataset.name} has been deleted`,
                message.author,
                "GREEN"
              )
            )
          }
        } else if (
          message.positional.dataset.data.ownerKind ===
          app.eddy.TargetKinds.USER
        ) {
          if (message.author.id !== message.positional.data.ownerID) {
            return message.channel.send(
              app.messageEmbed(
                `Dataset ${message.positional.dataset.name} does not belong to you`,
                message.author,
                "RED"
              )
            )
          }
        }
      },
    },
    {
      name: "permission",
      description: "Sub command for dataset permission settings",
      async run(message) {
        return app.sendCommandDetails(
          message,
          this,
          await app.prefix(message.guild ?? undefined)
        )
      },
      subs: [
        {
          name: "global",
          positional: [
            {
              name: "dataset",
              description: "The dataset you want to choose",
              checkValue: (datasetName) => app.eddy.Dataset.exists(datasetName),
              checkValueError: "There is not any dataset with that name : {}",
              castValue: (datasetName) => new app.eddy.Dataset(datasetName),
              required: true,
            },
            {
              name: "permission",
              description: "The global permission level",
              checkValue: (v) =>
                ["write", "use", "none"].includes(v.toLowerCase()),
              checkValueError:
                "Permission must be a number and must be none, use or write",
              castValue: v => {
                console.log(v)
                return v.toUpperCase()
              },
              default: ""
            },
          ],
          async run(message) {
            const dataset: app.eddy.Dataset = message.positional.dataset
            if (message.positional.permission) {
              if (
                message.positional.dataset.data.ownerKind ===
                  app.eddy.TargetKinds.GUILD &&
                message?.guild?.id !== message.positional.dataset.ownerID
              ) {
                return message.channel.send(
                  app.messageEmbed(
                    `Dataset ${message.positional.dataset.name} does not belong to this guild`,
                    message.author,
                    "RED"
                  )
                )
              } else if (
                message.positional.dataset.data.ownerKind ===
                  app.eddy.TargetKinds.GUILD &&
                !message?.member?.hasPermission("MANAGE_GUILD", {
                  checkAdmin: true,
                  checkOwner: true,
                })
              ) {
                return message.channel.send(
                  new app.MessageEmbed()
                    .setColor("RED")
                    .setAuthor(
                      `You need the \`MANAGE_GUILD\` permission to call this command.`,
                      message.client.user?.displayAvatarURL({ dynamic: true })
                    )
                )
              } else if (
                message.positional.dataset.data.ownerKind ===
                  app.eddy.TargetKinds.USER &&
                message.positional.dataset.ownerID !== message.author.id
              ) {
                return message.channel.send(
                  app.messageEmbed(
                    `Dataset ${message.positional.dataset.name} does not belong to you`,
                    message.author,
                    "RED"
                  )
                )
              }
              const oldGlobal = dataset.globalPermission
              dataset.globalPermission = message.positional.permission
              return message.channel.send(
                new app.MessageEmbed()
                  .setAuthor(
                    message.author.tag,
                    message.author.displayAvatarURL({ dynamic: true })
                  )
                  .setDescription(
                    `Successfully changed global permission for dataset ${dataset.name}`
                  )
                  .addField(
                    "Old :",
                    `Use : ${app.checkMark(
                      oldGlobal !== app.eddy.Permissions.NONE
                    )} \n Write : ${app.checkMark(
                      oldGlobal === app.eddy.Permissions.WRITE
                    )}`,
                    true
                  )
                  .addField(
                    "New :",
                    `Use : ${app.checkMark(
                      dataset.globalPermission !== app.eddy.Permissions.NONE
                    )} \n Write : ${app.checkMark(
                      dataset.globalPermission === app.eddy.Permissions.WRITE
                    )}`,
                    true
                  )
                  .setColor("GREEN")
                  .setTimestamp()
                  .setFooter(app.footer)
              )
            }
            return message.channel.send(
              new app.MessageEmbed()
                .setAuthor(
                  message.author.tag,
                  message.author.displayAvatarURL({ dynamic: true })
                )
                .setDescription(`Global permission for dataset ${dataset.name}`)
                .addField(
                  "Use",
                  app.checkMark(
                    dataset.globalPermission !== app.eddy.Permissions.NONE
                  ),
                  true
                )
                .addField(
                  "Write",
                  app.checkMark(
                    dataset.globalPermission === app.eddy.Permissions.WRITE
                  ),
                  true
                )
                .setColor("BLUE")
                .setTimestamp()
                .setFooter(app.footer)
            )
          },
        },
        {
          name: "specific",
          positional: [
            {
              name: "dataset",
              description: "The dataset you want to choose",
              checkValue: (datasetName) => app.eddy.Dataset.exists(datasetName),
              checkValueError: "There is not any dataset with that name : {}",
              castValue: (datasetName) => new app.eddy.Dataset(datasetName),
              required: true,
            },
          ],
          async run(message) {
            const specifics: app.eddy.DatasetPermission[] = message.positional.dataset.specificPermissions
            if (specifics.length === 0) {
              return message.channel.send(
                app.messageEmbed(
                  `No specific permissions found :/`,
                  message.author,
                  "BLUE"
                )
              )
            }
            const formatted = await Promise.all(
              specifics
                .sort((a, b) => {
                  return a.targetKind === app.eddy.TargetKinds.GUILD &&
                    b.targetKind === app.eddy.TargetKinds.USER
                    ? 1
                    : -1
                })
                .map(async (p) => {
                  if (p.targetKind === app.eddy.TargetKinds.GUILD) {
                    return {
                      target: message.client.guilds.cache.get(p.target)?.name,
                      permissions: `Use : ${app.checkMark(
                        p.permission !== app.eddy.Permissions.NONE
                      )} \n Write : ${app.checkMark(
                        p.permission === app.eddy.Permissions.WRITE
                      )}`,
                    }
                  } else {
                    return {
                      target: (await message.client.users.fetch(p.target)).catch(err=>({})).tag,
                      permissions: `Use : ${app.checkMark(
                        p.permission !== app.eddy.Permissions.NONE
                      )} \n Write : ${app.checkMark(
                        p.permission === app.eddy.Permissions.WRITE
                      )}`,
                    }
                  }
                })
            )
            new app.Paginator(
              app.Paginator.divider(formatted, 10).map((page) => {
                const embed = new app.MessageEmbed()
                  .setColor("BLUE")
                  .setAuthor(
                    "Specific permissions list",
                    message.client.user?.displayAvatarURL({ dynamic: true })
                  )
                for (const perm of page) {
                  embed.addField(perm.target, perm.permissions)
                }
                return embed
              }),
              message.channel,
              (reaction, user) => user.id === message.author.id
            )
          },
          subs: [
            {
              name: "set",
              positional: [
                {
                  name: "dataset",
                  description: "The dataset you want to choose",
                  checkValue: (datasetName) =>
                    app.eddy.Dataset.exists(datasetName),
                  checkValueError:
                    "There is not any dataset with that name : {}",
                  castValue: (datasetName) => new app.eddy.Dataset(datasetName),
                  required: true,
                },
                {
                  name: "target",
                  description:
                    "User/GuildID target for that specific permission",
                  checkValue: async (v, message) =>
                    (await app.userCheckValue(v, message)) ||
                    !!message.client.guilds.cache.get(v),
                  checkValueError:
                    "There is not any guild/user corresponding to {}",
                  castValue: async (v, message) =>
                    (await app.userCastValue(v, message)) ||
                    message.client.guilds.cache.get(v),
                  required: true,
                },
                {
                  name: "permission",
                  description: "The permission level",
                  checkValue: (v) =>
                    ["write", "use", "none"].includes(v.toLowerCase()),
                  checkValueError:
                    "Permission must be a number and must be none, use or write",
                  castValue: v => v.toUpperCase(),
                  required: true,
                },
              ],
              async run(message) {
                const dataset: app.eddy.Dataset = message.positional.dataset
                const target: app.Guild | app.User = message.positional.target
                const permission: app.eddy.Permissions =
                  message.positional.permission
                const old = dataset.specificPermissions.find(
                  (sp) => sp.target === target.id
                )
                if(old) dataset.deleteSpecificPermission(old.target)
                dataset.setSpecificPermission(
                  target.id,
                  target instanceof app.Guild
                    ? app.eddy.TargetKinds.GUILD
                    : app.eddy.TargetKinds.USER,
                  permission
                )

                return message.channel.send(
                  new app.MessageEmbed()
                    .setAuthor(
                      message.author.tag,
                      message.author.displayAvatarURL({ dynamic: true })
                    )
                    .setDescription(
                      `Successfully changed specific permission for dataset ${
                        dataset.name
                      } for target ${
                        target instanceof app.Guild ? target.name : target.tag
                      }`
                    )
                    .addField(
                      "Old :",
                      old !== undefined
                        ? `Use : ${app.checkMark(
                            old.permission !== app.eddy.Permissions.NONE
                          )} \n Write : ${app.checkMark(
                        old.permission === app.eddy.Permissions.WRITE
                          )}`
                        : `No specific permissions were found`,
                      true
                    )
                    .addField(
                      "New :",
                      `Use : ${app.checkMark(
                        permission !== app.eddy.Permissions.NONE
                      )} \n Write : ${app.checkMark(
                        permission === app.eddy.Permissions.WRITE
                      )}`,
                      true
                    )
                    .setColor("GREEN")
                    .setTimestamp()
                    .setFooter(app.footer)
                )
              },
            },
            {
              name: "delete",
              positional: [
                {
                  name: "dataset",
                  description: "The dataset you want to choose",
                  checkValue: (datasetName) =>
                    app.eddy.Dataset.exists(datasetName),
                  checkValueError:
                    "There is not any dataset with that name : {}",
                  castValue: (datasetName) => new app.eddy.Dataset(datasetName),
                  required: true,
                },
                {
                  name: "target",
                  description:
                    "User/GuildID target for that specific permission",
                  checkValue: async (v, message) =>
                    (await app.userCheckValue(v, message)) ||
                    !!message.client.guilds.cache.get(v),
                  checkValueError:
                    "There is not any guild/user corresponding to {}",
                  castValue: async (v, message) =>
                    (await app.userCastValue(v, message)) ||
                    message.client.guilds.cache.get(v),
                  required: true,
                },
              ],
              async run(message) {
                const dataset: app.eddy.Dataset = message.positional.dataset
                const target: app.Guild | app.User = message.positional.target

                dataset.deleteSpecificPermission(target.id)

                return message.channel.send(
                  app.messageEmbed(
                    `Successfully deleted specific permission for ${
                      target instanceof app.Guild ? target.name : target.tag
                    }`,
                    message.author,
                    "GREEN"
                  )
                )
              },
            },
          ],
        },
      ],
    },
  ],
}

module.exports = command
