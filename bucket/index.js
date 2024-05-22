// const express = require("express");
// const cors = require("cors");
// const TelegramBot = require("node-telegram-bot-api");

// const app = express();
// const PORT = process.env.PORT || 5000;

// const botToken = "7024969661:AAFno_2PHW1-s8T2XsNGpRQsHRSAOu6l18Y";
// const bot = new TelegramBot(botToken, { polling: false });

// app.use(cors());

// app.get("/api/telegram/users", async (req, res) => {
//   try {
//     const chatId = -1002047012962;

//     // Получаем информацию о чате
//     const chatInfo = await bot.getChat(chatId);

//     // Получаем список администраторов чата
//     const administrators = await bot.getChatAdministrators(chatId);

//     // Получаем список участников чата
//     const members = await Promise.all(
//       chatInfo.all_members && Array.isArray(chatInfo.all_members)
//         ? chatInfo.all_members.map((memberId) =>
//             bot.getMemberCount(chatId, memberId)
//           )
//         : []
//     );
//     console.log("Chat Info:", chatInfo);
//     console.log("Administrators:", administrators);
//     console.log("Members:", members);
//     // Фильтруем список участников, оставляя только обычных пользователей (не администраторов и не ботов)
//     const regularUsers = members.filter((member) => {
//       return (
//         member.user &&
//         !member.user.is_bot &&
//         !administrators.some((admin) => admin.user.id === member.user.id)
//       );
//     });
//     // Формируем объект с данными для отправки в ответе
//     const responseData = {
//       memberCount: chatInfo.member_count,
//       regularUsers: regularUsers.map((member) => ({
//         id: member.user.id,
//         username: member.user.username,
//         firstName: member.user.first_name,
//         lastName: member.user.last_name,
//       })),
//     };

//     res.json(responseData);
//   } catch (error) {
//     console.error("Ошибка при получении данных из Telegram:", error);
//     res.status(500).json({
//       error: "Ошибка при получении данных Telegram",
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Сервер запущен на порту ${PORT}`);
// });
