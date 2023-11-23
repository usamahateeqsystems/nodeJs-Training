var express = require("express");
var router = express.Router();
const Cart = require("../models/cart");
const auth = require("../middleware/authentication");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");

router.post("/", auth.authenticate, async (req, res) => {
  try {
    const { user} = req.body;

    const cartObject = await Cart.findOne({
      user: user,
    });

    if (cartObject) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      let items = "";
      let total = 0;
      cartObject.items.forEach((item) => {
        items += "<tr><td>" + item.productName + "</td><td>"+ item.quantity + "</td><td>"+ item.price + "</td></tr>";
        total += (item.price * item.quanity);
      });
      const msg = {
        to: "usamah.ateeq@gmail.com", 
        from: "usamah.ateeq@systemsltd.com", 
        subject: "Your order is complete",
        text: "Please find detail of your order",
        html: `<strong><table>${items}<tr><td colspan=2>Total</td><td>${total}</td></table></strong>`
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      res.status(500).send("We could not send the email");
    }
  } catch (error) {
    res.status(500).send("There was an error checking out");
    console.log(error);
  }
  res.status(200).send({
    success:true,
    message: "Email sent"
  });

});

module.exports = router;
