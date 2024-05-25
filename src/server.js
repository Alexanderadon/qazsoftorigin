  const express = require("express");
const axios = require("axios");
const { checkConnection } = require("./controllers/botactive");
const { botToken, groupChatId, userId } = require("./config/config");
const { User } = require("./models/users.model");
const mongoose = require("mongoose");
const { handleStartCommand } = require("./controllers/startController");
const { handleCommand } = require("./controllers/commandController");
const { exportAnswers } = require("./controllers/quiz");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Обработчик для всех команд
app.post("/commands", async (req, res) => {
  try {
    const channel_post = req.body;
    if (!channel_post || !channel_post.message) {
      console.error("Invalid channel_post data or missing message");
      return res
        .status(400)
        .json({ success: false, message: "Invalid request data." });
    }

    const chatId = channel_post.message.chat
      ? channel_post.message.chat.id
      : null;
    const unknownCommandText = `Команда не распознана. Пожалуйста, попробуйте другую команду.`;
    console.log("Я ТУТ ВЫВОЖУ channel_post:", channel_post);
    console.log("я тело:", req.body);

    if (
      channel_post.message.voice ||
      channel_post.message.document ||
      channel_post.message.photo ||
      channel_post.message.video ||
      channel_post.message.poll ||
      channel_post.message.sticker ||
      channel_post.message.location ||
      channel_post.message.gift ||
      channel_post.message.file ||
      channel_post.message.audio ||
      !channel_post
    ) {
      // Обработка голосового сообщения
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: unknownCommandText,
      });
      console.log("Received voice message. Ignoring.");
      return res
        .status(200)
        .json({ success: true, message: "Voice message ignored." });
    }

    // Обработка текстового сообщения
    const command = channel_post.message.text.trim();

    console.log("СМОТРЕТЬ ТУТ", channel_post.message.text);

    switch (command) {
      case "/start":
        await handleStartCommand(req, res);
        break;
      case "/order":
      case "/tarif":
      case "/tt":
      case "/help":
      case "/about":
      case "/help":
      case "/support":
      case "/quiz":
        await handleCommand(req, res);
        break;
      // case "/quiz":
      //   await handleQuizCommand(req, res);
      //   break;
      default:
        if (
          channel_post.message &&
          channel_post.message.chat &&
          channel_post.message.chat.id
        ) {
          await sendMessageError(chatId, unknownCommandText, res);
        } else {
          console.error("Invalid channel_post data or missing chat id");
          res
            .status(500)
            .json({ success: false, message: "Invalid request data." });
        }
        break;
    }
  } catch (error) {
    console.error("Error handling command:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});

// Функция отправки сообщения об ошибке
async function sendMessageError(chatId, text, res) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
      }
    );

    if (response.data.ok) {
      res.status(200).json({
        success: true,
        message: "Message sent successfully.",
      });
    } else {
      console.error("Failed to send message:", response.data.description);
      res
        .status(500)
        .json({ success: false, message: "Failed to send message." });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while sending message.",
    });
  }
}

// Установка команд для бота
const setCommands = async () => {
  try {
    const commands = [
      { command: "/start", description: "Начать" },
      { command: "/order", description: "Сделать заказ" },
      { command: "/tarif", description: "Узнать тарифы" },
      { command: "/tt", description: "Что нужно для Технического Задания?" },
      { command: "/quiz", description: "Пройти опрос из 3 вопросов" },
      { command: "/about", description: "Информация о QazSoft" },
      { command: "/help", description: "Все команды" },
      { command: "/support", description: "Поддержать QazSoft" },
    ];

    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/setMyCommands`,
      { commands: commands }
    );

    if (response.data.ok) {
      console.log("Commands set successfully.");
    } else {
      console.error("Failed to set commands:", response.data.description);
    }
  } catch (error) {
    console.error("Error setting commands:", error);
  }
};

// Вызов функции для установки команд
setCommands();

// Обработчик для добавления пользователя в базу данных
app.post("/database/user", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json({ message: "User added to collection", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Запуск сервера Express
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  mongoose.connect(
    "mongodb+srv://admin:1q4r6y1q4r6y@backdb.bgdmu1s.mongodb.net/database?retryWrites=true&w=majority&appName=BackDb"
  );

  // Периодический запуск экспорта ответов
  setInterval(exportAnswers, 300000);

  // Первоначальная проверка состояния при запуске сервера
  await checkConnection();
});

