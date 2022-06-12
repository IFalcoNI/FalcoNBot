process.env['NTBA_FIX_319'] = 1;

const TelegramApi = require('node-telegram-bot-api');

const token = '5537012360:AAFv5pjkhhmlN-sa261kSIe6V0gJNHxgvRw';

const bot = new TelegramApi(token, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'Restart bot' },
  { command: '/statistics', description: 'Your statistic' },
  { command: '/info', description: 'Information about bot' },
  { command: '/game', description: 'Play game' },
  { command: '/clear', description: 'Clear chat' }
]);

const chats = {};

const game = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: 1, callback_data: '1' },
        { text: 2, callback_data: '2' },
        { text: 3, callback_data: '3' }
      ],
      [
        { text: 4, callback_data: '4' },
        { text: 5, callback_data: '5' },
        { text: 6, callback_data: '6' }
      ],
      [
        { text: 7, callback_data: '7' },
        { text: 8, callback_data: '8' },
        { text: 9, callback_data: '9' }
      ],
      [{ text: 0, callback_data: '0' }]
    ]
  })
};
const tryAgain = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: 'Try again', callback_data: '/again' }]]
  })
};
async function startBot() {
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.from.id;

    if (text === '/start') {
      return bot.sendMessage(chatId, 'Bot has been started!');
    }
    if (text === '/statistics') {
      return bot.sendMessage(chatId, `Stats`);
    }
    if (text === '/info') {
      return bot.sendMessage(chatId, `Info`);
    }
    if (text === '/game') {
      return startGame(chatId);
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
  });
}

async function startGame(id) {
  await bot.sendMessage(id, `Pick a number between 0 and 9`, game);
  const randomNumber = Math.floor(Math.random() * 10);
  chats[id] = randomNumber;
}

bot.on('callback_query', (msg) => {
  const text = msg.data;
  const chatId = msg.message.chat.id;
  if (text === '/again') {
    return startGame(chatId);
  }
  if (text == chats[chatId]) {
    return bot.sendMessage(chatId, 'You are right', tryAgain);
  } else {
    return bot.sendMessage(
      chatId,
      `Nice try, number was ${chats[chatId]}`,
      tryAgain
    );
  }
});

startBot();
