// server.js
const express = require('express');
const axios = require('axios');
const ngrok = require('ngrok');
const { handleStartCommand } = require('./controllers/startController');
const { handleCommand1 } = require('./controllers/commandController');

const app = express();
const port = 3000;
const botToken = '7024969661:AAFno_2PHW1-s8T2XsNGpRQsHRSAOu6l18Y';
const groupChatId = '-1002047012962';
const oneTimeLinks = {};

app.use(express.json());

// Обработчик команды /start
app.post('/start', handleStartCommand);

// Обработчик для команды /command1
app.post('/command1', handleCommand1);

// Запуск сервера Express и установка вебхука с ngrok
async function startServer() {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    const url = await ngrok.connect(port);
    const webhookUrl = `${url}/start`;

    const response = await axios.post(`https://api.telegram.org/bot${botToken}/setWebhook`, { url: webhookUrl });

    if (response.data.ok) {
      console.log('Webhook set successfully.');
      console.log(`Webhook URL: ${webhookUrl}`);
    } else {
      console.error('Failed to set webhook:', response.data.description);
    }
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();