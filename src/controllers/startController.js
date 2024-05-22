const axios = require("axios");
const { botToken, groupChatId, oneTimeLinks } = require("../config/config");
const path = require("path");
const FormData = require("form-data");
const { createChatAndInviteLink } = require("../utils/chatUtils");
const { generateToken } = require("../utils/tokenUtils");
const fs = require("fs");
const { User } = require("../models/users.model");
const { Form } = require("../models/GoggleForm.model");
const { exportAnswers } = require("../controllers/quiz");

async function updateFormPeriodically() {
  try {
    const answers = await exportAnswers(); // Получаем ответы из Google Forms
    console.log("Answers:", answers);

    await Promise.all(
      answers.map(async (answer) => {
        const existingForm = await Form.findOne({ nameForm: answer.name });

        if (existingForm) {
          // Если найдена существующая запись с именем, обновляем данные
          await Form.findOneAndUpdate(
            { nameForm: answer.name },
            {
              $addToSet: { genderForm: answer.gender },
              $addToSet: { ageForm: answer.age },
            },
            { new: true }
          );
          console.log(`Updated Form for '${answer.name}'`);
        } else {
          // Если запись не найдена, создаем новую
          const newForm = new Form({
            nameForm: answer.name,
            genderForm: [answer.gender],
            ageForm: [answer.age],
          });
          await newForm.save();
          console.log(`New Form data saved for '${answer.name}'`);
        }
      })
    );
  } catch (error) {
    console.error("Error updating Form:", error);
  }
}

// Устанавливаем интервал выполнения функции updateFormPeriodically каждые 250 секунд (250000 миллисекунд)
setInterval(updateFormPeriodically, 250000);

async function handleStartCommand(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.text) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message format." });
    }

    const userId = message.from.id;
    const firstName = message.from.first_name;

    const answers = await exportAnswers();
    console.log(answers);

    let userDataToUpdate = {
      firstName: message.from.first_name || "",
      lastName: message.from.last_name || "",
      userName: "@" + message.from.username || "",
      location: message.from.location || {},
      phoneNumber: message.from.phone_number || "",
      birthDate: "",
      friends: message.from.friends || [],
      address: message.from.address || "",
      email: message.from.email || "",
      contact: message.from.contact || "",
      contacts: message.from.contacts || [],
      date: message.date || 0,
      isBot: message.from.is_bot || false,
      gender: message.from.gender,
      nameForm: "", // Используем данные из answers
      genderForm: [], // Используем массив для данных по полу из answers
      ageForm: [], // Используем массив для данных по возрасту из answers
    };

    const usernameWithoutAt = userDataToUpdate.userName.slice(1); // Имя пользователя без символа "@"

    const matchingAnswers = answers.filter((answer) => {
      return answer.name === usernameWithoutAt; // Находим соответствующий ответ из Google Forms
    });

    console.log("Matching answers:", matchingAnswers);

    if (matchingAnswers.length === 0) {
      // Если не найдены совпадающие ответы из Google Forms
      console.log("No matching answers found for", usernameWithoutAt);
    }

    matchingAnswers.forEach((answer) => {
      userDataToUpdate.nameForm = answer.name;
      userDataToUpdate.genderForm.push(answer.gender); // Добавляем значение gender в массив genderForm
      userDataToUpdate.ageForm.push(answer.age); // Добавляем значение age в массив ageForm
    });

    console.log("Updated userDataToUpdate:", userDataToUpdate);

    // Очистка объекта userDataToUpdate от пустых строк и некорректных значений
    userDataToUpdate = cleanObject(userDataToUpdate);

    let existingUser = await User.findOne({ userId });

    if (existingUser) {
      // Обновляем существующего пользователя
      existingUser.set(userDataToUpdate); // Применяем только обновленные поля
      await existingUser.save();
    } else {
      // Создаем нового пользователя
      const newUser = new User({
        userId,
        ...userDataToUpdate,
      });
      await newUser.save();
    }

    const command = message.text.trim().toLowerCase();

    if (command === "/start") {
      // Отправка сообщения с пригласительной ссылкой и меню
      const inviteLink = await createChatAndInviteLink(botToken, groupChatId);
      const token = generateToken();
      oneTimeLinks[token] = inviteLink; // Сохраняем одноразовую ссылку

      const menuText = `Команды:\n/tarif - Опция 1\n/support - Опция 2\n/about - Опция 3\n/tt - Опция 4\n/order - Опция 5`;
      const imagePath = path.join(__dirname, "welcome.jpg");

      const caption =
        `Добро пожаловать, *${firstName}*!🔥\n\n` +
        `Рады приветствовать вас в мире инноваций и творчества от *QazSoft!* Я ваш личный помощник, *Baimo*, и я здесь, чтобы сделать ваше взаимодействие с нашей веб-студией максимально приятным и продуктивным.\n\n` +
        `Вот ваша пригласительная ссылка: ${inviteLink}\n\n` +
        `Меня зовут *Baimo* к вашим услугам.\n\n` +
        `Что я могу для вас сделать:\n\n` +
        `📞 *Техническая поддержка:* Быстрое решение любых технических вопросов.\n` +
        `💻 *Информация о наших продуктах:* Узнайте больше о том, что мы предлагаем.\n` +
        `🛒 *Оформление заказов:* Помощь в заказе наших услуг и продуктов.\n\n` +
        `Пройдите опрос для улучшения услуг */quiz.*\n` +
        `Введите команду */help*, чтобы узнать все мои команды.\n\n` +
        `Спасибо, что выбрали QazSoft. Я уверен, что наше сотрудничество будет плодотворным и успешным. Давайте начнем это увлекательное путешествие вместе!\n\n` +
        `*Присоединяйтесь к нашему сообществу и будьте в курсе всех новостей и обновлений:*`;

      const formData = new FormData();
      formData.append("chat_id", userId);
      formData.append("photo", fs.createReadStream(imagePath));
      formData.append("caption", caption);
      formData.append("parse_mode", "Markdown");

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: "Канал", url: inviteLink },
            { text: "Сайт", url: "https://www.instagram.com/qazsoft.kz/" },
          ],
          [{ text: "Инстаграм", url: "https://www.instagram.com/qazsoft.kz/" }],
        ],
      };

      await axios.post(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        formData,
        {
          headers: formData.getHeaders(),
          params: { reply_markup: JSON.stringify(replyMarkup) },
        }
      );

      res.status(200).json({
        success: true,
        message: "Invite link and menu sent successfully.",
      });
    } else {
      const unknownCommandText = `Команда не распознана. Пожалуйста, попробуйте другую команду.`;
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: userId,
        text: unknownCommandText,
      });

      res.status(200).json({
        success: true,
        message: "Unknown command processed successfully.",
      });
    }
  } catch (error) {
    console.error("Error handling /start command:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
}

// Функция для удаления пустых строк и некорректных значений из объекта
function cleanObject(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

module.exports = {
  handleStartCommand,
};
