process.env['NTBA_FIX_319'] = 1;

const TelegramApi = require('node-telegram-bot-api');
const express = require('express');
const { game, tryAgain } = require('./options');
const sequelize = require('./connectDB');
const UserModel = require('./models');

const app = express();

const token = '5537012360:AAFv5pjkhhmlN-sa261kSIe6V0gJNHxgvRw';
const bot = new TelegramApi(token, { polling: true });
const chats = [];

bot.setMyCommands([
  { command: '/start', description: 'Restart bot' },
  { command: '/statistics', description: 'Your statistic' },
  { command: '/delete', description: 'delete your account' },
  { command: '/game', description: 'Play game' },
  { command: '/clear', description: 'Clear chat' }
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
      }
      if (text === '/game') {
        return startGame(chatId);
      }
      if (text === '/delete') {
        const user = await UserModel.findOne({ chatId });
        await UserModel.destroy({ where: { id: user.id } });
        return bot.sendMessage(chatId, 'User was deleted');
      }
      if (text === '/clear') {
        for (let index = msg.message_id; index >= 1; index--) {
          if (text == '/start') {
          }
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
      bot.sendMessage(chatId, 'Error');
      console.error(error);
    }
  });
}

async function startGame(id) {
  await bot.sendMessage(id, `Pick a number between 0 and 9`, game);
  const randomNumber = Math.floor(Math.random() * 10);
  chats[id] = randomNumber;
}

bot.on('callback_query', async (msg) => {
  const text = msg.data;
  const chatId = msg.message.chat.id;
  if (text === '/again') {
    return startGame(chatId);
  }
  const user = await UserModel.findOne({ chatId });
  if (text == chats[chatId]) {
    user.right += 1;
    await bot.sendMessage(chatId, 'You are right', tryAgain);
  } else {
    user.wrong += 1;
    await bot.sendMessage(
      chatId,
      `Nice try, number was ${chats[chatId]}`,
      tryAgain
    );
  }
  await user.save();
});

startBot();

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log(`Server is running at port ${PORT}`);
});
