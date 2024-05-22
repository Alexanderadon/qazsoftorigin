

// Функция для создания нового объекта BusinessConnection
async function createBusinessConnection(userId, userChatId) {
  try {
    const date = Math.floor(Date.now() / 1000); // Получаем текущую дату в формате Unix time

    const newBusinessConnection = {
      id: generateUniqueId(), // Генерируем уникальный идентификатор
      user: getUserInfo(userId), // Получаем информацию о пользователе по userId
      user_chat_id: userChatId,
      date: date,
      can_reply: true, // По умолчанию устанавливаем значение
      is_enabled: true, // По умолчанию устанавливаем значение
    };

    // Ваша логика для сохранения newBusinessConnection в базу данных или другое хранилище

    return newBusinessConnection;
  } catch (error) {
    console.error("Error creating business connection:", error);
    throw new Error("Failed to create business connection");
  }
}

// Генерация уникального идентификатора для объекта BusinessConnection
function generateUniqueId() {
  return "bc_" + Math.random().toString(36).substr(2, 9); // Пример генерации уникального идентификатора
}

// Получение информации о пользователе по userId
function getUserInfo(userId) {
  // Ваша логика для получения информации о пользователе, используя userId
  const userInfo = {
    userId: userId,
    // Другие свойства пользователя, которые вы хотите сохранить в объекте user
  };
  return userInfo;
}

// Экспорт функции createBusinessConnection для использования в других модулях
module.exports = {
  createBusinessConnection,
};
