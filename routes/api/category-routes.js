const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// Route to retrieve all the Categories with its associated Products
router.get('/', async (req, res) => {

  try {
    const categoryData = await Category.findAll({
      include: [ { model: Product } ],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }

});

// Route to retrieve the Category by Id with its associated Products
router.get('/:id', async (req, res) => {

  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [ { model: Product } ],
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with that id!' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }

});

/* Route to create a New category: The req.body should look like this
{
  "category_name" : "Board Games"
}
*/
router.post('/', async (req, res) => {

  try {
    // All the fields you can create and the data attached to the request body.
    const categoryData = await Category.create({
      category_name: req.body.category_name,
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }

});

/* Route to update the category by Id: The req.body should look like this
{
  "category_name" : "Board Games"
}
*/
router.put('/:id', async (req, res) => {

  try {
    const updatedCategory = await Category.update(
      {
        // All the fields you can update and the data attached to the request body.
        category_name: req.body.category_name,
      },
      {
        // Gets the category based on the id given in the request parameters
        where: {
          id: req.params.id,
        },
      }
    );

    if (!updatedCategory[ 0 ]) {
      res.status(404).json({ message: 'No category found with that id!' });
      return;
    }
    res.status(200).json({ message: `Category ID : ${req.params.id} updated successfully!` });
  } catch (err) {
    res.status(400).json(err);
  }

});

/* Route to delete the category by Id*/
router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with that id!' });
      return;
    }

    res.status(200).json({ message: `Category with ID : ${req.params.id} deleted successfully!` });
  } catch (err) {
    res.status(500).json(err);
  }

});

module.exports = router;
