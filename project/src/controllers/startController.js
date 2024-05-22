const axios = require('axios');
const { botToken, groupChatId, oneTimeLinks } = require('../server');
const { createChatAndInviteLink } = require('../utils/chatUtils');
const { generateToken } = require('../utils/tokenUtils');

async function handleStartCommand(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.text) {
      return res.status(400).json({ success: false, message: 'Invalid message format.' });
    }

    const userId = message.from.id;
    const command = message.text.trim().toLowerCase();

    if (command === '/start') {
      const inviteLink = await createChatAndInviteLink(botToken, groupChatId);
      const token = generateToken();

      // Сохранение одноразовой ссылки
      oneTimeLinks[token] = inviteLink;

      const menuText = `Выберите опцию:\n/command1 - Опция 1\n/command2 - Опция 2\n/command3 - Опция 3`;
      const replyMarkup = {
        inline_keyboard: [
          [
            { text: 'Кнопка 1', callback_data: 'button1' },
            { text: 'Кнопка 2', callback_data: 'button2' }
          ],
          [
            { text: 'очень важный текст', callback_data: token }
          ]
        ]
      };

      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: userId,
        text: `Добро пожаловать! Вот ваша пригласительная ссылка: ${inviteLink}\n\n${menuText}`,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify(replyMarkup)
      });

      res.status(200).json({ success: true, message: 'Invite link and menu sent successfully.' });
    } else {
      const unknownCommandText = `Команда не распознана. Пожалуйста, попробуйте другую команду.`;
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: userId,
        text: unknownCommandText
      });

      res.status(200).json({ success: true, message: 'Unknown command processed successfully.' });
    }
  } catch (error) {
    console.error('Error handling /start command:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
}

module.exports = {
  handleStartCommand
};