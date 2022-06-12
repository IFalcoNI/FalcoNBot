const sequelize = require('./connectDB');
const { DataTypes } = require('sequelize');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  chatId: {
    type: DataTypes.STRING,
    unique: true
  },
  right: {
    type: DataTypes.INTEGER,
    defaultvalue: "0"
  },
  wrong: {
    type: DataTypes.INTEGER,
    defaultvalue: "0"
  }
});

module.exports = User;
