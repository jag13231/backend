import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ratingStars: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priceCents: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    keywords: {
      type: DataTypes.TEXT, // Store as a JSON string
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('keywords')); // Parse JSON when retrieving
      },
      set(value) {
        this.setDataValue('keywords', JSON.stringify(value)); // Stringify JSON when storing
      }
    }
  });

  return Product;
};
