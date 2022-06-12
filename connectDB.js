const Sequelize = require('sequelize');
databaseURL =
  'postgres://erpyocxamhqret:a5f65369bc0b8c4e4b5c673a27dd4653cdffa43d19b76dea2ef5aabc7fc71915@ec2-54-170-90-26.eu-west-1.compute.amazonaws.com:5432/d2ki8uh62liij9';

module.exports = new Sequelize(databaseURL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
