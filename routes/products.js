var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const Products = require("../models/product");
const Categories = require("../models/category");
const auth = require("../middleware/authentication");

const validateProduct = [
  body("title").notEmpty().withMessage("Product Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("price").notEmpty().withMessage("Price is required"),
  body("availableQuantity").notEmpty().withMessage("Quantity is required"),
  body("categoryId").notEmpty().withMessage("Category is required"),
];

/* GET products listing. */
router.get("/", auth.authenticate, async (req, res) => {
  try {
    const productsResult = await Products.find().populate(
      "category",
      "categoryName"
    );
    const products = [];
    productsResult.forEach((product) => {
      products.push({
        title: product.title,
        description: product.description,
        price: product.price,
        quantity: product.availableQuantity,
        category: product.category.categoryName,
      });
    });
    res.send(products);
  } catch (error) {
    res.status(500).send("There was an error processing your request");
    console.log(error);
  }
});

router.get("/:id", auth.authenticate, async (req, res) => {
  try {
    const productObject = await Products.findById({
      _id: req.params.id,
    }).populate("category", "categoryName");
    res.send({
      title: productObject.title,
      description: productObject.description,
      price: productObject.price,
      quantity: productObject.availableQuantity,
      category: productObject.category.categoryName,
    });
  } catch (error) {
    res
      .status(500)
      .send(
        "We encountered a problem while fetching the product you are trying to find "
      );
    console.log(error);
  }
});

router.post(
  "/",
  [auth.authenticate, validateProduct],
  async (req, res) => {
    try {
      const validProduct = validationResult(req);
      if (!validProduct.isEmpty()) {
        return res.send({ errors: validProduct.array() });
      }

      const { title, description, price, availableQuantity, categoryId, otherProperties } = req.body;

      const productObject = await Products.findOne({
        title: title,
      });
      if (productObject) {
        return res.send({ errors: `Product ${title} already exists` });
      }

      const categoryObject = await Categories.findById({ _id: categoryId });
      if (categoryObject) {
        const newProductObj = {
          title: title,
          description: description,
          price: price,
          availableQuantity: availableQuantity,
          category: categoryObject._id,
        };

        if (otherProperties)
        {
          newProductObj["otherProperties"] = otherProperties;
        }

        const product = await Products.create(newProductObj);
        res.status(200).send({
          name: product.title,
          description: product.description,
          quantity: product.availableQuantity,
          price: product.price,
        });
      } else {
        res
          .status(500)
          .send("There was an error creating the product. Invalid category");
      }
    } catch (error) {
      res.status(500).send("There was an error creating the product");
      console.log(error);
    }
  }
);

router.put(
  "/:id",
  [auth.authenticate, validateProduct],
  async (req, res) => {
    try {
      const validproduct = validationResult(req);
      if (!validproduct.isEmpty()) {
        return res.send({ errors: validproduct.array() });
      }
      if (req.params.id) {
        const { title, description, price, quantity, categoryId } = req.body;
        const categoryObject = await Categories.findById({ _id: categoryId });
        if (categoryObject) {
          await Products.updateOne(
            { _id: req.params.id },
            {
              $set: {
                title: title,
                description: description,
                price: price,
                quantity: quantity,
                category: categoryId,
              },
            }
          );
          res.status(200).send({
            success: true,
            message: `Record ${req.params.id} updated successfully`,
          });
        } else {
          res.status(500).send("Invalid category Id was not provided.");
        }
      } else {
        res.status(500).send("Record Id was not provided.");
      }
    } catch (error) {
      res.status(500).send("There was an error updating the product");
      console.log(error);
    }
  }
);

router.patch("/", auth.authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (productId) {
      await Products.updateOne(
        { _id: productId },
        {
          $set: {
            availableQuantity: quantity,
          },
        }
      );
      res.status(200).send({
        success: true,
        message: `Record ${productId} updated successfully`,
      });
    } else {
      res.status(500).send("Record Id was not provided.");
    }
  } catch (error) {
    res.status(500).send("There was an error updating the product");
    console.log(error);
  }
});

router.delete("/:id", auth.authenticate, async (req, res) => {
  try {
    if (req.params.id) {
      const del = await Products.findOneAndDelete({ _id: req.params.id });
      res.status(202).send({
        success: true,
        message: "product deleted successfully",
        product: del.productName,
      });
    } else {
      res.status(500).send("Record id was not provided");
    }
  } catch (error) {
    res
      .status(500)
      .send("There was an error deleting the product. product not found");
    console.log(error);
  }
});

module.exports = router;
