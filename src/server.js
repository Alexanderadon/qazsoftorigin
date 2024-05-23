const express = require("express");
const axios = require("axios");
const { checkConnection } = require("./controllers/botactive");
const { User } = require("./models/users.model");
const mongoose = require("mongoose");
const { handleStartCommand } = require("./controllers/startController");
const { handleCommand } = require("./controllers/commandController");
const { exportAnswers } = require("./controllers/quiz");
const { handleQuizCommand } = require("./controllers/quiz");
const { createBusinessConnection } = require("./BusinessConnection/Connection");

const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.BOT_TOKEN;
const mongoUri = process.env.MONGODB_URI;

app.use(express.json());

async function someFunction(channel_post) {
  try {
    const userId = "889435326";
    const userChatId = channel_post.message.chat.id;
    const newConnection = await createBusinessConnection(userId, userChatId);
    console.log("New Business Connection:", newConnection);
  } catch (error) {
    console.error("Error creating business connection:", error);
  }
}

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
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: unknownCommandText,
      });
      console.log("Received voice message. Ignoring.");
      return res
        .status(200)
        .json({ success: true, message: "Voice message ignored." });
    }

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
      case "/support":
      case "/quiz":
        await handleCommand(req, res);
        break;
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

setCommands();

app.post("/database/user", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json({ message: "User added to collection", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

setInterval(exportAnswers, 300000);

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await checkConnection();
});

// Снимаем webhook при завершении работы сервера (опционально)
process.on('SIGINT', async () => {
  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
    console.log("Webhook deleted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to delete webhook:", error);
    process.exit(1);
  }
});