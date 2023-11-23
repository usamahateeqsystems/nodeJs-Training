var express = require("express");
var router = express.Router();
const Cart = require("../models/cart");
const auth = require("../middleware/authentication");

router.get("/:id", auth.authenticate, async (req, res, next) => {
  try {
    const cartObject = await Cart.findById({
      _id: req.params.id,
    });
    res.send({
      user: cartObject.user,
      items: cartObject.items
    });
  } catch (error) {
    res
      .status(500)
      .send(
        "We encountered a problem while fetching the cart details "
      );
    console.log(error);
  }
});

router.post(
  "/",
  auth.authenticate,
  async (req, res, next) => {
    try {
      const { user, productId, productName, productPrice, quantity } = req.body;

      const cartObject = await Cart.findOne({
        user: user,
      });

      if (cartObject)
      {
        let found = false;
        const cartItems = cartObject.items;
        cartItems.forEach((item)=>{
          if (item.productId == productId){
            item.quantity = quantity
            found = true;
          }
        });
        if (!found)
        {
          cartItems.push({
            productId:productId,
            productName: productName,
            productPrice: productPrice,
            quantity: quantity
          })
        }
        await Cart.updateOne(
          { user: user },
          {
            $set: {
              items: cartItems
            },
          });
          res.status(200).send({
            cart: user,
            items: cartItems,
          });
  
      }
      else
      {
        const newCartItem = {
          user: user,
          items: [{
            productId:productId,
            productName: productName,
            productPrice: productPrice,
            quantity: quantity
          }],
        };

        const cart = await Cart.create(newCartItem);
        res.status(200).send({
          cart: cart.user,
          items: cart.items,
        });
      }

    } catch (error) {
      res.status(500).send("There was an error creating the shopping cart");
      console.log(error);
    }
  }
);

router.delete("/:id", auth.authenticate, async (req, res, next) => {
  try {
    if (req.params.id) {
      const del = await Cart.findOneAndDelete({ user: req.params.id });
      res.status(202).send({
        success: true,
        message: "cart deleted successfully",
        cart: del.user,
      });
    } else {
      res.status(500).send("Record id was not provided");
    }
  } catch (error) {
    res
      .status(500)
      .send("There was an error deleting the cart");
    console.log(error);
  }
});


module.exports = router;
