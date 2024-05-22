const axios = require('axios');
const { botToken } = require('../server');

async function handleCommand1(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.from || !message.chat || !message.chat.id) {
      return res.status(400).json({ success: false, message: 'Invalid message format.' });
    }

    const chatId = message.chat.id;
    const command1Text = 'Это текст, который будет отправлен при выборе опции 1.';

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: command1Text
    });

    res.status(200).json({ success: true, message: 'Command /command1 processed successfully.' });
  } catch (error) {
    console.error('Error handling /command1:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
}

module.exports = {
  handleCommand1
};