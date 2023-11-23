var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const Users = require("../models/user");
const auth = require("../middleware/authentication");

const validateUser = [
  body("first_name").notEmpty().withMessage("First name is required"),
  body("last_name").notEmpty().withMessage("Last name is required"),
  body("email").notEmpty().withMessage("Email is required"),
  body("email").isEmail().withMessage("Not a valid email address"),
  body("password").notEmpty().withMessage("password is required"),
];

/* GET users listing. */
router.get("/", auth.authenticate, async (req, res, next) => {
  try {
    const usersResult = await Users.find();
    const users = [];
    usersResult.forEach((user) => {
      users.push({
        name: user.first_name + " " + user.last_name,
        email: user.email,
      });
    });
    res.send(users);
  } catch (error) {
    res.status(500).send("There was an error processing your request");
    console.log(error);
  }
});

router.get("/:id", auth.authenticate, async (req, res, next) => {
  try {
    const userObject = await Users.findById({ _id: req.params.id });
    res.send({
      firstName: userObject.first_name,
      lastName: userObject.last_name,
      email: userObject.email,
    });
  } catch (error) {
    res
      .status(500)
      .send(
        "We encountered a problem while fetching the user you are trying to find "
      );
    console.log(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const userObject = await Users.findOne({ email: req.body.email }).then(
      (userObject) => {
        if (userObject) {
          if (userObject.password === req.body.password) {
            const token = auth.getAccessToken(userObject);
            const data = {
              user: {
                name: userObject.first_name + " " + userObject.last_name,
                email: userObject.email,
                token: token,
              },
            };
            res.send(data);
          } else {
            res.status(404).send("Please check your email and password");
          }
        } else {
          res.status(404).send("User not found");
        }
      }
    );
  } catch (error) {
    res.status(500).send("Could not login. Username/Password is incorrect");
    console.log(error);
  }
});

router.post("/", validateUser, async (req, res, next) => {
  try {
    const validUser = validationResult(req);
    if (!validUser.isEmpty()) {
      return res.send({ errors: validUser.array() });
    }

    const { first_name, last_name, email, password } = req.body;

    const userObject = await Users.findOne({ email: email });
    if (userObject) {
      return res.send({ errors: "Email already exists" });
    }

    const user = await Users.create({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
    });

    res
      .status(200)
      .send({
        name: user.first_name + " " + user.last_name,
        email: user.email,
      });
  } catch (error) {
    res.status(500).send("There was an error creating the user");
    console.log(error);
  }
});

router.put(
  "/:id",
  [auth.authenticate, validateUser],
  async (req, res, next) => {
    try {
      const validUser = validationResult(req);
      if (!validUser.isEmpty()) {
        return res.send({ errors: validUser.array() });
      }
      if (req.params.id) {
        const { first_name, last_name, email, password } = req.body;
        await Users.updateOne(
          { _id: req.params.id },
          {
            $set: {
              first_name: first_name,
              last_name: last_name,
              email: email,
              password: password,
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
      res.status(500).send("There was an error updating the user");
      console.log(error);
    }
  }
);

router.delete("/:id", auth.authenticate, async (req, res, next) => {
  try {
    if (req.params.id) {
      const del = await Users.findOneAndDelete({ _id: req.params.id });
      res
        .status(202)
        .send({
          success: true,
          message: "User deleted successfully",
          email: del.email,
        });
    } else {
      res.status(500).send("Record id was not provided");
    }
  } catch (error) {
    res
      .status(500)
      .send("There was an error deleting the user. User not found");
    console.log(error);
  }
});

module.exports = router;
