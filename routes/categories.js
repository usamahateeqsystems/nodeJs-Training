var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const Categories = require("../models/category");
const auth = require("../middleware/authentication");

const validateCategory = [
  body("categoryName").notEmpty().withMessage("Category name is required"),
  body("description").notEmpty().withMessage("Description is required"),
];

/* GET categories listing. */
router.get("/", auth.authenticate, async (req, res, next) => {
  try {
    const categoriesResult = await Categories.find().populate(
      "parent",
      "categoryName"
    );
    const categories = [];
    categoriesResult.forEach((category) => {
      categories.push({
        name: category.categoryName,
        description: category.description,
        parent: category.parent ? category.parent.categoryName : null,
      });
    });
    res.send(categories);
  } catch (error) {
    res.status(500).send("There was an error processing your request");
    console.log(error);
  }
});

router.get("/:id", auth.authenticate, async (req, res, next) => {
  try {
    const categoryObject = await Categories.findById({
      _id: req.params.id,
    }).populate("parent", "categoryName");
    res.send({
      name: categoryObject.categoryName,
      description: categoryObject.description,
      parent: categoryObject.parent ? categoryObject.parent.categoryName : null,
    });
  } catch (error) {
    res
      .status(500)
      .send(
        "We encountered a problem while fetching the category you are trying to find "
      );
    console.log(error);
  }
});

router.post(
  "/",
  [auth.authenticate, validateCategory],
  async (req, res, next) => {
    try {
      const validCategory = validationResult(req);
      if (!validCategory.isEmpty()) {
        return res.send({ errors: validCategory.array() });
      }

      const { categoryName, description, parentId } = req.body;

      const categoryObject = await Categories.findOne({
        categoryName: categoryName,
      });
      if (categoryObject) {
        return res.send({ errors: `Category ${categoryName} already exists` });
      }

      const newCategoryObj = {
        categoryName: categoryName,
        description: description,
      };

      if (parentId) {
        const parentObject = await Categories.findById({ _id: parentId });
        if (parentObject) {
          newCategoryObj["parent"] = parentObject._id;
        }
      }

      const category = await Categories.create(newCategoryObj);

      res
        .status(200)
        .send({
          name: category.categoryName,
          description: category.description,
          parent: parentId,
        });
    } catch (error) {
      res.status(500).send("There was an error creating the category");
      console.log(error);
    }
  }
);

router.put(
  "/:id",
  [auth.authenticate, validateCategory],
  async (req, res, next) => {
    try {
      const validcategory = validationResult(req);
      if (!validcategory.isEmpty()) {
        return res.send({ errors: validcategory.array() });
      }
      if (req.params.id) {
        const { categoryName, description, parentId } = req.body;
        await Categories.updateOne(
          { _id: req.params.id },
          {
            $set: {
              categoryName: categoryName,
              description: description,
              parent: parentId,
            },
          }
        );
        res
          .status(200)
          .send({
            success: true,
            message: `Record ${req.params.id} updated successfully`,
          });
      } else {
        res.status(500).send("Record Id was not provided.");
      }
    } catch (error) {
      res.status(500).send("There was an error updating the category");
      console.log(error);
    }
  }
);

router.delete("/:id", auth.authenticate, async (req, res, next) => {
  try {
    if (req.params.id) {
      const del = await Categories.findOneAndDelete({ _id: req.params.id });
      res
        .status(202)
        .send({
          success: true,
          message: "category deleted successfully",
          category: del.categoryName,
        });
    } else {
      res.status(500).send("Record id was not provided");
    }
  } catch (error) {
    res
      .status(500)
      .send("There was an error deleting the category. category not found");
    console.log(error);
  }
});

module.exports = router;
