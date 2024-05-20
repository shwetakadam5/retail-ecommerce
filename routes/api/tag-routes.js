const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// Route to retrieve all the Tags with its associated Products
router.get('/', async (req, res) => {

  try {
    const tagData = await Tag.findAll({
      include: [ { model: Product, through: 'product_tag', as: 'tagged_products' } ],

    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }

});

// Route to retrieve the Tag by Id with its associated Products
router.get('/:id', async (req, res) => {

  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [ { model: Product, through: 'product_tag', as: 'tagged_products' } ],

    });
    if (!tagData) {
      res.status(404).json({ message: 'No tag found with that id!' });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }

});


/* Route to create a New Tag: The req.body should look like this
{
       tag_name: "orange",     
       productIds: [1, 2, 3, 4]
}
*/
router.post('/', async (req, res) => {

  try {
    const tagData = await Tag.create(req.body);
    if (req.body.productIds && req.body.productIds.length) {
      const productIdArr = req.body.productIds.map((product_id) => {
        return {
          tag_id: tagData.id,
          product_id,
        };
      });
      const productTagData = await ProductTag.bulkCreate(productIdArr);
    }
    // if no products, just respond
    res.status(200).json(tagData);

  } catch (err) {
    res.status(400).json(err);
  }

});

/* Route to update the tag by Id: The req.body should look like this
{
      tag_name: "orange",     
      productIds: [1, 2, 3, 4]
}
*/
router.put('/:id', async (req, res) => {

  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updatedTag[ 0 ]) {
      res.status(404).json({ message: 'No Tag found with that id!' });
      return;
    }


    if (req.body.productIds && req.body.productIds.length) {

      const productTagData = await ProductTag.findAll({
        where: { tag_id: req.params.id }
      });


      // create filtered list of new product_ids
      const productIds = productTagData.map(({ product_id }) => product_id);
      const newProducts = req.body.productIds
        .filter((product_id) => !productIds.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: req.params.id,
            product_id,
          };
        });

      // figure out which ones to remove
      const productToRemove = productTagData
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      const result = await Promise.all([
        ProductTag.destroy({ where: { id: productToRemove } }),
        ProductTag.bulkCreate(newProducts),
      ]);
    }

    res.json({ message: `Tag ID : ${req.params.id} updated successfully!` });

  } catch (err) {
    // console.log(err);
    res.status(400).json(err);
  };

});

/* Route to delete the tag by Id*/
router.delete('/:id', async (req, res) => {

  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: 'No Tag found with that id!' });
      return;
    }
    const productTagData = await ProductTag.findAll({
      where: {
        tag_id: req.params.id
      }
    });

    const productTagIds = productTagData.map(({ id }) => id);
    const deletedProductTagData = await ProductTag.destroy({ where: { id: productTagIds } });
    res.status(200).json({ message: `Tag with ID : ${req.params.id} deleted successfully! Row Count : ${deletedProductTagData}` });

  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
