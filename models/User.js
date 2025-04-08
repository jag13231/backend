import { Sequelize } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    }
  });

  return User;
};
