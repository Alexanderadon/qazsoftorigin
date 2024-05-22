const mongoose = require("mongoose");

const FormSchema = mongoose.Schema({
  nameForm: { type: String, unique: true }, // Уникальный
  genderForm: [String],
  ageForm: [String]
});

const Form = mongoose.model("Form", FormSchema); // 1 аргумент коллекция название, 2 объект коллекции, 3 куда сохранять коллекцию

module.exports = {
  Form,
};
