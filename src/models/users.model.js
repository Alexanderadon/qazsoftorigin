const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  userName: String,
  userId: Number,
  phoneNumber: String,
  location: {
    type: { type: String },
    coordinates: [Number]
  },
  birthDate: String,
  friends: [String],
  address: String,
  email: String,
  contact: String,
  contacts: [String],
  date: Number,
  isBot: Boolean,
  nameForm: String,
  genderForm: [String],
  ageForm: [String]
});

const User = mongoose.model("User", userSchema, "User"); // 1 аргумент коллекция название, 2 объект коллекции, 3 куда сохранять коллекцию

module.exports = {
  User,
};
