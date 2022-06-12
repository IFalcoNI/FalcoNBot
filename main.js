const TelegramApi = require('node-telegram-bot-api');

const token = '5537012360:AAFv5pjkhhmlN-sa261kSIe6V0gJNHxgvRw';

const bot = new TelegramApi(token, { polling: true });

bot.getMyCommands

bot.on('message', async (msg) => {
  const text = msg.text;
  const chatId = msg.from.id;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Hello');
  }
  if (text === '/info') {
    await bot.sendMessage(chatId, ``);
  }
});
