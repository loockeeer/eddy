import * as app from "../app"

const command: app.Command = {
  name: "dataset",
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
    const dataset = message.positional.dataset as app.eddy.Dataset
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
          ? (await message.client.users.fetch(dataset.ownerID)).tag
          : (await message.client.guilds.fetch(dataset.ownerID)).name,
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
          required: true,
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
          required: false,
        },
      ],
      async run(message) {
        const dataset = message.positional.dataset

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
          description: "The channel to unlink",
          checkValue: (channelID, message) =>
            !message?.guild
              ? true
              : message?.guild?.channels.cache.has(channelID),
          default: (message) => message.channel.id,
          checkValueError:
            "There is not any channel with id {} in this guild !",
          castValue: (channelID, message) =>
            message.client.channels.cache.get(channelID),
          required: false,
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
              ? (await message.client.users.fetch(dataset.dataset.ownerID)).tag
              : (await message.client.guilds.fetch(dataset.dataset.ownerID))
                  .name
          }`
        })
        new app.Paginator(
          app.Paginator.divider(await Promise.all(formatted), 10).map(
            (page) => {
              return new app.MessageEmbed()
                .setColor("BLURPLE")
                .setAuthor(
                  "Datasets list",
                  message.client.user?.displayAvatarURL()
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
      aliases: ["new", "make"],
      description: "Create a new dataset",
      positional: [
        {
          name: "name",
          description: "The name of the new dataset",
          checkValue: (value) => !app.eddy.Dataset.exists(value),
          checkValueError: "A dataset already exists with name {}",
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
      ],
      async run(message) {
        try {
          app.eddy.Dataset.createDataset(
            message.positional.name,
            message.args.user || !message?.guild
              ? message.author.id
              : message.guild.id,
            message.args.user || !message?.guild
              ? app.eddy.TargetKinds.USER
              : app.eddy.TargetKinds.GUILD
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
                  message.client.user?.displayAvatarURL()
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
      name: "config",
      async run(message) {
        await message.reply("dataset command is not yet implemented.")
      },
      subs: [
        {
          name: "permissions",
          subs: [
            {
              name: "global",
              async run(message) {
                await message.reply("dataset command is not yet implemented.")
              },
            },
            {
              name: "specific",
              async run(message) {
                await message.reply("dataset command is not yet implemented.")
              },
            },
          ],
          async run(message) {
            await message.reply("dataset command is not yet implemented.")
          },
        },
        {
          name: "name",
          async run(message) {
            await message.reply("dataset command is not yet implemented.")
          },
        },
      ],
    },
  ],
}

module.exports = command
