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
    type: DataTypes.INTEGER,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  right: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wrong: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = User;
