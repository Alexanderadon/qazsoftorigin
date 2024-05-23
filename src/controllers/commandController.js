const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const FormData = require("form-data");
const { botToken} = require("../config/config");
// const { createChatAndInviteLink } = require("../utils/chatUtils");
// const { generateToken } = require("../utils/tokenUtils");

// const inviteLinks = await createChatAndInviteLink(botToken, groupChatId);
// const token = generateToken();
// oneTimeLinks[token] = inviteLinks; // Сохраняем одноразовую ссылку

async function handleCommand(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.text || !message.chat || !message.chat.id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message format." });
    }

    const chatId = message.chat.id;
    const commandText = message.text.trim().toLowerCase();

    let responseText = "";
    let media = [];
    let tarifText = `
📋 *Тарифы:*\n\n\
*Визитка* - от 200 000₸\n\n\
Идеально для быстрого старта и презентации ваших услуг.\n\n\
*Одностраничный сайт* - от 300 000₸\n\n\
Отличный выбор для представления одного продукта или услуги.\n\n\
*Корпоративный сайт* - от 350 000₸\n\n\
Для компаний, которые хотят рассказать о себе и своих возможностях.\n\n\
*Информационный сайт* - от 900 000₸\n\n\
Подходит для проектов с большим объемом контента.\n\n\
*Индивидуальный сайт* - от 999 999₸\n
Полная кастомизация под ваши потребности и желания.\n\n\
✨ Скидка *10%* для тех, кто подпишется на наш [Instagram](https://www.instagram.com/qazsoft.kz/) и [Telegram-канал](https://t.me/+FuLOh6Wh2aI4NmEy)!\n\n\
*📲 Скорее подписывайтесь и получите вашу скидку!*`;
    // Определение действия в зависимости от текста команды
    switch (commandText) {
      case "/tarif":
        responseText =
          "Если у вас есть вопросы или хотите обсудить проект, нажмите команду */order*";
        const imagePathTarif = path.join(__dirname, "tarifSelling.jpg");
        const imageDataTarif = await fs.readFile(imagePathTarif);
        const formDataTarif = new FormData();
        formDataTarif.append("parse_mode", "Markdown");
        formDataTarif.append("photo", imageDataTarif, {
          filename: "welcome.jpg",
        });
        const tarifResponse = await axios.post(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          formDataTarif,
          {
            headers: formDataTarif.getHeaders(),
            params: { chat_id: chatId, caption: tarifText },
          }
        );
        // console.log("Telegram response for tarif:", tarifResponse.data);
        break;
      case "/order":
        responseText =
`📦 *Хотите заказать сайт?*\n
Мы готовы воплотить ваши идеи в жизнь! Свяжитесь с нашим менеджером, чтобы обсудить детали и получить персональное предложение.\n
*🌐 Закажите сайт прямо сейчас* – напишите нашему менеджеру и начните путь к вашему идеальному веб-решению: [Связаться с менеджером](https://t.me/dobrota_qazsoft)`;
        break;
      case "/about":
        responseText = `*👋 Привет!*\n
Мы – молодая и энергичная команда разработчиков сайтов с навыками в программировании, дизайне, маркетинге и таргетинге. У нас уже есть богатый опыт и страсть к нашему делу.\n
*✨ Наши услуги:*\n
*Создание и дизайн сайтов:* от визиток до крупных корпоративных порталов.\n
*Настройка до готовности:* ваш сайт будет полностью готов к запуску.\n
*Создание ботов:* автоматизация задач для вашего бизнеса.\n
*🚀 Почему выбирают нас:\n*
*Инновации:* свежие и креативные решения.\n
*Выгодные цены:* малочисленность команды позволяет нам сохранять конкурентоспособные цены.\n
*Страсть к работе:* мы любим то, что делаем, и это видно в каждом проекте.\n
*💼 Готовы воплотить ваши идеи в жизнь и сделать ваш бизнес успешнее.\n*
*📲 Свяжитесь с нами прямо сейчас и получите консультацию! */order**\n
`;
        break;
      case "/tt":
responseText = `*Что нужно вам для составления технического задания для сайта?*\n
📋 Что нужно для составления технического задания:\n
Для того чтобы мы могли создать идеальный сайт для вас, нам нужно собрать информацию и понять ваши потребности и цели. Вот что необходимо предоставить:\n
1. *Цель сайта:* Опишите, что вы хотите достичь с помощью вашего сайта (продажи, информирование, привлечение клиентов и т.д.).
2. *Целевая аудитория:* Кто ваши потенциальные пользователи? (возраст, пол, интересы, география и т.д.).
3. *Структура сайта:* Какие разделы и страницы вам нужны? (главная, о компании, услуги, контакты и т.д.).
4. *Функционал:* Какие функции необходимы? (форма обратной связи, онлайн-чат, корзина покупок, блог и т.д.).
5. *Дизайн и стилистика:* Есть ли у вас предпочтения по дизайну? Примеры сайтов, которые вам нравятся.
6. *Контент:* Будете ли вы предоставлять тексты и изображения или нам нужно это создать?
7. *Бюджет и сроки:* Какой у вас бюджет и когда вы хотите запустить сайт?\n
Напишите нам мы поможем составить *техническое задание* /order\n
*Это отдельная операция, она не входит в стоимость сайта, идет отдельно от заказа.*
После оплаты мы вам пришлем бриф, проведем консультацию онлайн (офлайн если вы в Алмате), напише
м полностью ТЗ.\n
*Можно ли вы мне напишите ТЗ?, у меня дела.*\n
Это можно сделать, но результат вас может разочаровать, *это ваш ребенок, не оставляйте его без воспитания!*, с любовью QazSoft😄.
        `;
        break;
      case "/support":
        responseText =
`*Поддержать команду разработчиков:*\n
*Крипто-кошелек(TRC20):* TGdBJZUzc1wnVbW7o5bnTk7yfhLMA8GHC1\n
*KaspiBank:* 4400 4301 7117 8376\n
*HalykBank:* 4408 6397 6987 1680\n
*Спасибо за поддержку!*`;
        break;
      case "/help":
        responseText = `*Команды:*\n
/start - Baimo вводит в курс дела
/order - Заказать проект
/tarif - Узнать стоимость
/about - Немного о нас
/tt - Как составить техническое задание?
/quiz - Пройти опрос и помочь нам в аналитике
/help - Узнать все команды бота
/support - Поддержать нас монетой
/quiz - Пройти опрос и помочь нам в аналитике\n
*Рад помочь!*`
        break;
        case "/quiz":
          responseText =
`*Пройдите наш короткий опрос!*\n
Мы ценим ваше мнение и хотим сделать наше сотрудничество еще более эффективным. Пожалуйста, уделите всего 2 минуты своего времени, чтобы ответить на 3 простых вопроса. Ваши ответы помогут нам улучшить наши услуги и лучше понимать ваши потребности.\n
Пройдите опрос здесь: [опрос](https://docs.google.com/forms/d/e/1FAIpQLSeC3UBnX7Ng1ouQg-5RfnO5fSBz7ZnVtlmNYIXNiZ2NNunyVg/viewform?usp=sf_link)\n
Спасибо за ваше участие и помощь в развитии QazSoft!`;
          break;
      default:
        responseText =
          "Команда не распознана. Пожалуйста, попробуйте другую команду.";
        break;
    }

    // Отправка сообщения в Telegram
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: responseText,
      parse_mode: "Markdown",
    });

    res.status(200).json({
      success: true,
      message: `Command ${commandText} processed successfully.`,
    });
  } catch (error) {
    console.error("Error handling command:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
}

module.exports = {
  handleCommand,
};
