
const Form = require("../models/GoggleForm.model");

// Функция для сохранения данных из Google Forms в MongoDB
async function saveFormData(formData) {
  try {
    // Создаем новый объект Form на основе данных из Google Forms
    const newForm = new Form({
      name: formData.name,
      gender: formData.gender,
      age: formData.age
    });

    // Сохраняем новый объект в базе данных
    const savedForm = await newForm.save();

    console.log("Form data saved successfully:", savedForm);
    return savedForm;
  } catch (error) {
    console.error("Error saving form data:", error);
    throw new Error("Failed to save form data");
  }
}

module.exports = {
  saveFormData
};