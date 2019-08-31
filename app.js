//jshint esversion: 6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

mongoose.connect('mongodb://localhost:27017/restaurantDB', {
  useNewUrlParser: true
});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

//SCHEMAS

var setupSchema = new mongoose.Schema({
  nameOfRestaurant: String,
  sizeTableS: Number,
  sizeTableM: Number,
  sizeTableL: Number,
  setupComplete: {
    type: Boolean,
    default: false
  }
});

var reserveSchema = new mongoose.Schema({
  tableNumber: Number,
  sizeOfTable: String,
  taken: {
    type: Boolean,
    default: false
  }
});

//MODELS

const Setup = mongoose.model("Setup", setupSchema);
const Reserve = mongoose.model("Reserve", reserveSchema);

//VARIABLES
let nameOfRestaurant = "";
let sizeTableS;
let sizeTableM;
let sizeTableL;

//APP.GET
app.get("/", function(req, res) {
  Setup.findOne({
    setupComplete: true
  }, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (!result) {
      res.redirect("/setup");
    } else {
      // Reserve.collection.drop();
      //getting the name of the restaurant
      nameOfRestaurant = result.nameOfRestaurant;
      res.redirect("/reserve");
    }
  });
});

app.get("/setup", function(req, res) {
  res.render("setup.ejs");
});

app.get("/reserve", function(req, res) {
  Setup.find({
    setupComplete: true
  }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      sizeTableS = result.sizeTableS;
      sizeTableM = result.sizeTableM;
      sizeTableL = result.sizeTableL;
      if (sizeTableS > 0) {
        for (let i = 1; i < sizeTableS; i++) {
          const reserve = new Reserve({
            tableNumber: i,
            sizeOfTable: "S",
            taken: false
          });

          reserve.save();
        }
      }
      if (sizeTableM > 0) {
        for (let i = 1; i <= sizeTableM; i++) {
          const reserve = new Reserve({
            tableNumber: i,
            sizeOfTable: "M",
            taken: false
          });

          reserve.save();
        }
      }

      if (sizeTableL > 0) {
        for (let i = 1; i <= sizeTableL; i++) {
          const reserve = new Reserve({
            tableNumber: i,
            sizeOfTable: "L",
            taken: false
          });

          reserve.save();
        }
      }

    }

  });
  res.render("reserve.ejs", {
    nameOfRestaurant: nameOfRestaurant,
    sizeTableS: sizeTableS,
    sizeTableM: sizeTableM,
    sizeTableL: sizeTableL
  });
});

//APP.POST
app.post("/setup", function(req, res) {
  const setup = new Setup({
    nameOfRestaurant: req.body.nameOfRestaurant,
    sizeTableS: req.body.sizeTableS,
    sizeTableM: req.body.sizeTableM,
    sizeTableL: req.body.sizeTableL,
    setupComplete: true
  });

  setup.save();

  res.redirect("/");
});

// app.post("/reserve", function(req,res){
// });


//APP.LISTEN
app.listen(3000, function() {
  console.log("Server started at port 3000 locally");
});
