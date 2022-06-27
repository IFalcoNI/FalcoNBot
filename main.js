process.env['NTBA_FIX_319'] = 1;

const TelegramApi = require('node-telegram-bot-api');
const express = require('express');
const { game, tryAgain } = require('./options');
const sequelize = require('./connectDB');
const UserModel = require('./models');
const RandomOrg = require('random-org');

const app = express();

const token = '5537012360:AAFv5pjkhhmlN-sa261kSIe6V0gJNHxgvRw';
const bot = new TelegramApi(token, { polling: true });
var random = new RandomOrg({ apiKey: '2bd3ac0a-35f8-4eff-9db9-7d9099123719' });
const chats = [];

bot.setMyCommands([
  { command: '/start', description: 'Restart bot' },
  { command: '/statistics', description: 'Your statistic' },
  { command: '/delete', description: 'delete your account or reset stats' },
  { command: '/game', description: 'Play game' },
  { command: '/clear', description: 'Clear all history' }
]);

async function startBot() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.error(error);
  }

  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.from.id;
    const username = msg.from.username;
    const name = `${msg.from.last_name} ${msg.from.first_name}`;
    try {
      if (text === '/start') {
        await UserModel.create({
          chatId: chatId,
          username: username,
          name: name
        });
        return bot.sendMessage(chatId, 'Bot has been started!');
      }
      if (text === '/statistics') {
        const user = await UserModel.findOne({ where: { chatId: chatId } });
        if (user) {
          return bot.sendMessage(
            chatId,
            `Player: ${user.name}
Right answers: ${user.right} 
Wrong answers: ${user.wrong}
Percent of winnings: ${
              user.right === 0 && user.wrong === 0
                ? 0
                : Math.round((user.right / (user.right + user.wrong)) * 100)
            }%
             `
          );
        } else {
          return bot.sendMessage(chatId, 'User not found, please use /start');
        }
      }
      if (text === '/game') {
        const user = await UserModel.findOne({ where: { chatId: chatId } });
        if (user) {
          return startGame(chatId);
        } else {
          return bot.sendMessage(chatId, 'User not found, please use /start');
        }
      }
      if (text === '/delete') {
        const user = await UserModel.findOne({ where: { chatId: chatId } });
        if (user) {
          return deleteUser(chatId, user);
        } else {
          return bot.sendMessage(chatId, 'User not found or already deleted');
        }
      }
      if (text === '/clear') {
        await deleteUser(chatId);
        for (let index = msg.message_id + 1; index >= 0; index--) {
          try {
            await bot.deleteMessage(chatId, index);
          } catch (e) {
            console.error(e);
          }
        }
        return;
      }
      return bot.sendMessage(chatId, 'Invalid input');
    } catch (error) {
      bot.sendMessage(chatId, 'User already registered');
      console.error(error);
    }
  });
}

async function startGame(id) {
  await bot.sendMessage(id, `Pick a number between 0 and 9`, game);
  random.generateIntegers({ min: 0, max: 9, n: 3 }).then(function (result) {
    chats[id] = result.random.data;
  });
}
async function deleteUser(id, user) {
  await UserModel.destroy({ where: { id: user.id } });
  return bot.sendMessage(id, 'User was deleted');
}

bot.on('callback_query', async (msg) => {
  const text = msg.data;
  const chatId = msg.message.chat.id;
  const msgId = msg.message.message_id;
  console.log(msgId);
  try {
    if (text === '/again') {
      return startGame(chatId);
    }
    const user = await UserModel.findOne({ where: { chatId: chatId } });
    // let isCorrect = false;
    // await chats[chatId].forEach((element) => {
    //   if (text == element) {
    //     isCorrect = true;
    //   }
    // });
    if (
      // isCorrect
      text == chats[chatId][0] ||
      text == chats[chatId][1] ||
      text == chats[chatId][2]
    ) {
      user.right += 1;
      await bot.sendMessage(
        chatId,
        `You are right, your picked ${text}, numbers was ${chats[chatId]}`,
        tryAgain
      );
      await bot.deleteMessage(chatId, msgId);
    } else {
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `Nice try, you picked ${text}, but numbers was ${chats[chatId]}`,
        tryAgain
      );
      await bot.deleteMessage(chatId, msgId);
    }
    await user.save();
  } catch (error) {
    console.log(error);
  }
});

startBot();

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log(`Server is running at port ${PORT}`);
});
