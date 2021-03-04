import * as app from "../app"

const command: app.Command = {
  name: "dataset",
  async run(message) {
    await message.reply("dataset command is not yet implemented.")
  },
  subs: [
    {
      name: "link",
      positional: [
        {
          name: "datasetName",
          description: "The dataset you want to choose",
          checkValue: datasetName => app.eddy.Dataset.exists(datasetName),
          checkValueError: "There is not any dataset with that name : {}",
          required: true
        },
        {
          name: "channel",
          description: "The channel to link",
          checkValue: (channelID, message) => !message?.guild ? true : message?.guild?.channels.cache.has(channelID),
          default: (message) => message.channel.id,
          checkValueError: "There is not any channel with id {} in this guild !",
          castValue: (channelID, message) => message.client.channels.cache.get(channelID),
          required: false
        },
      ],
      async run(message) {
        const dataset = new app.eddy.Dataset(message.positional.datasetName)

        if(app.eddy.calculatePermissions(dataset, message) === app.eddy.Permissions.NONE) {
          return message.channel.send(`You do not have access to that datasets`)
        } else {
          return message.channel.send(`Successfully linked ${message.positional.channel} with ${dataset.name}`)
        }
      }

    },
    {
      name: "unlink",
      positional: [
        {
          name: "channel",
          description: "The channel to unlink",
          checkValue: (channelID, message) => !message?.guild ? true : message?.guild?.channels.cache.has(channelID),
          default: (message) => message.channel.id,
          checkValueError: "There is not any channel with id {} in this guild !",
          castValue: (channelID, message) => message.client.channels.cache.get(channelID),
          required: false
        }
      ],
      async run(message) {
        return message.channel.send(`Successfully unlinked channel ${message.positional.channel}`)
      }
    },
    {
      name: "list",
      async run(message) {
        await message.reply("dataset command is not yet implemented.")

      }
    },
    {
      name: "create",
      positional: [
        {
          name: "name",
          checkValue: value => !app.eddy.Dataset.exists(value),
          checkValueError: "A dataset already exists with name {}"
        }
      ],
      async run(message) {
        try {
          app.eddy.Dataset.createDataset(message.positional.name, message.author.id, app.eddy.TargetKinds.USER)
        } catch (e) {
          if(e instanceof app.eddy.DatasetExistsError) {
            return message.channel.send(`A dataset already exists with name ${message.positional.name}`)
          }
        }
        return message.channel.send('done')
      }
    },
    {
      name: "delete",
      positional: [
        {
          name: "name"
        }
      ],
      async run(message) {
        await message.reply("dataset command is not yet implemented.")
      }
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

              }
            },
            {
              name: "specific",
              async run(message) {
                await message.reply("dataset command is not yet implemented.")

              }
            }
          ],
          async run(message) {
            await message.reply("dataset command is not yet implemented.")

          }
        },
        {
          name: "name",
          async run(message) {
            await message.reply("dataset command is not yet implemented.")

          }
        }
      ]
    }
  ]
}

module.exports = command