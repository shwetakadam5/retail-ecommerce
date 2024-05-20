const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// Route to retrieve all the Products with its associated Category and Tags
router.get('/', async (req, res) => {

  try {
    const productData = await Product.findAll({
      include: [ { model: Category }, { model: Tag, through: 'product_tag', as: 'product_tags' } ],

    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }

});

// Route to retrieve the Product by Id with its associated Category and Tags
router.get('/:id', async (req, res) => {

  try {
    // One to Many with Category and Many to Many with Tag
    const productData = await Product.findByPk(req.params.id, {
      include: [ { model: Category }, { model: Tag, through: 'product_tag', as: 'product_tags' } ],

    });
    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }

});

/* Route to create a New Product: The req.body should look like this
{
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
}
*/
router.post('/', (req, res) => {

  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

/* Route to update the product by Id: The req.body should look like this
{
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
}
*/
router.put('/:id', (req, res) => {

  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  }).then((product) => {

    //check to ensure that the product id is valid 
    if (!product[ 0 ]) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }

    if (req.body.tagIds && req.body.tagIds.length) {

      ProductTag.findAll({
        where: { product_id: req.params.id }
      }).then((productTags) => {
        // create filtered list of new tag_ids
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

        // figure out which ones to remove
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
        // run both actions
        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      });
    }

    return res.json({ message: `Product ID : ${req.params.id} updated successfully!` });
  }).catch((err) => {

    res.status(400).json(err);
  });
});

/* Route to delete the product by Id*/
router.delete('/:id', async (req, res) => {

  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    const productTagData = await ProductTag.findAll({
      where: {
        product_id: req.params.id
      }
    });

    const productTagIds = productTagData.map(({ id }) => id);
    const deletedProductTagData = await ProductTag.destroy({ where: { id: productTagIds } });
    res.status(200).json({ message: `Product with ID : ${req.params.id} deleted successfully!` });

  } catch (err) {
    res.status(500).json(err);
  }

});

module.exports = router;