const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [ { model: Product, through: 'product_tag', as: 'tagged_products' } ],

    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
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

router.post('/', async (req, res) => {
  // create a new tag
  /* req.body should look like this...
     {
       tag_name: "orange",     
       productIds: [1, 2, 3, 4]
     }
   */
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

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value

  /* req.body should look like this...
    {
      tag_name: "orange",     
      productIds: [1, 2, 3, 4]
    }
  */

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
      console.log(`Product Ids : `);
      console.log(productIds);
      const newProducts = req.body.productIds
        .filter((product_id) => !productIds.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: req.params.id,
            product_id,
          };
        });

      console.log(`newProducts : `);
      console.log(newProducts);

      // figure out which ones to remove
      const productToRemove = productTagData
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      console.log(`productToRemove : `);
      console.log(productToRemove);
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
