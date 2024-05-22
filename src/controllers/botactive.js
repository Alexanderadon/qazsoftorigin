const axios = require("axios");
const { botToken, adminChatId } = require("../config/config");

let botEnabled = false; // Изначально бот отключен

async function checkTelegramAPIAvailability() {
  const url = `https://api.telegram.org/bot${botToken}/getMe`;

  try {
    const response = await axios.get(url);
    return response.status === 200; // Возвращаем true, если статус ответа 200 OK
  } catch (error) {
    console.error("Error checking Telegram API availability:", error.message);
    return false;
  }
}

async function checkTelegramServerConnectivity() {
  const telegramServerUrl = "https://api.telegram.org";

  try {
    const response = await axios.get(telegramServerUrl);
    return response.status === 200; // Возвращаем true, если статус ответа 200 OK
  } catch (error) {
    console.error(
      "Error checking Telegram server connectivity:",
      error.message
    );
    return false;
  }
}

async function enableBot() {
  if (!botEnabled) {
    botEnabled = true;
    console.log("Bot has been enabled.");

    // Отправляем сообщение администратору о включении бота
    await sendMessageToAdmin("Бот был успешно включен.");
  }
}

async function disableBot() {
  if (botEnabled) {
    botEnabled = false;
    console.log("Bot has been disabled.");

    try {
      await sendMessageToAdmin("Бот был выключен.");
    } catch (error) {
      console.error("Error sending message to admin:", error);
    }
  }
}

async function sendMessageToAdmin(message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: adminChatId,
        text: message,
      }
    );
    console.log("Message sent to admin:", message);
  } catch (error) {
    console.error("Error sending message to admin:", error.message);
  }
}

async function checkConnection() {
  try {
    const isTelegramAPIAvailable = await checkTelegramAPIAvailability();
    const isTelegramServerConnected = await checkTelegramServerConnectivity();

    if (isTelegramAPIAvailable && isTelegramServerConnected) {
      await enableBot(); // Включаем бот, если подключение к API и серверу установлено
    } else {
      await disableBot(); // Выключаем бот, если подключение не установлено
    }
  } catch (error) {
    console.error("Error checking bot connection:", error.message);
    await disableBot(); // В случае ошибки отключаем бот
  }
}

// Вызываем функцию проверки подключения при запуске
checkConnection();

module.exports = {
  checkConnection,
};
