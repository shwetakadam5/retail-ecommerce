// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category, {
  foreignKey: 'category_id',
});

// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'category_id',
});

// Products belongToMany Tags (through ProductTag)

Product.belongsToMany(Tag, {
  // Defines the third table needed to store the foreign keys
  through: {
    model: 'product_tag',
    unique: false
  },
  // Defines an alias for when data is retrieved
  as: 'product_tags'
});

// Tags belongToMany Products (through ProductTag)

Tag.belongsToMany(Product, {
  // Defines the third table needed to store the foreign keys
  through: {
    model: 'product_tag',
    unique: false
  },
  // Defines an alias for when data is retrieved
  as: 'tagged_products'
});

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
