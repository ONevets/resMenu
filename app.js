//jshint esversion: 6

//REQUIREMENTS

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
  totalTable: Number,
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
let sizeTableS = 0;
let sizeTableM = 0;
let sizeTableL = 0;
let totalTable = 0;

//APP.GET

app.get("/", function(req, res) {
  Setup.findOne({
    setupComplete: true
  }, function(err, resultSetup) {
    if (err) {
      console.log(err);
    }
    if (!resultSetup) {
      res.redirect("/setup");
    } else {
      // Reserve.collection.drop();
      Reserve.findOne({}, function(err, resultReserve) {
        if (err) {
          console.log(err);
        }

        if (!resultReserve) {
          //getting the name of the restaurant
          nameOfRestaurant = resultSetup.nameOfRestaurant;
          sizeTableS += resultSetup.sizeTableS;
          sizeTableM += resultSetup.sizeTableM;
          sizeTableL += resultSetup.sizeTableL;
          totalTable = 1;

          for (let i = 0; i < sizeTableS; i++) {
            const reserve = new Reserve({
              tableNumber: totalTable,
              sizeOfTable: "S",
              taken: false
            });

            totalTable += 1;
            reserve.save();
          }

          for (let i = 0; i < sizeTableM; i++) {
            const reserve = new Reserve({
              tableNumber: totalTable,
              sizeOfTable: "M",
              taken: false
            });

            totalTable += 1;
            reserve.save();
          }

          for (let i = 0; i < sizeTableL; i++) {
            const reserve = new Reserve({
              tableNumber: totalTable,
              sizeOfTable: "L",
              taken: false
            });

            totalTable += 1;
            reserve.save();
          }

          //minus'd due to table array count
          totalTable -= 1;
          res.redirect("/reserve");

        } else {
          res.redirect("/reserve");
        }


      });
    }
  });
});

app.get("/setup", function(req, res) {
  Setup.collection.drop();
  res.render("setup.ejs");
});

app.get("/reserve", function(req, res) {

  //if havent setup yet then go to /setup
  Setup.findOne({}, function(err, resultSetup) {
    if (err) {
      console.log(err);
    }
    if (!resultSetup) {
      res.redirect("/setup");
    } else {
      Reserve.find({}, function(err, resultReserve) {
        if (err) {
          console.log(err);
        }

        if (resultReserve) {
          console.log(totalTable);
          res.render("reserve.ejs", {
            nameOfRestaurant: nameOfRestaurant,
            sizeTableS: sizeTableS,
            sizeTableM: sizeTableM,
            sizeTableL: sizeTableL,
            totalTable: resultSetup.totalTable
          });
        }
      });
    }
  });


});

//APP.POST
app.post("/setup", function(req, res) {
  let setupTotalNumber = 0;

  for (let i = 0; i < req.body.sizeTableS; i++) {
    setupTotalNumber++;
  }

  for (let i = 0; i < req.body.sizeTableM; i++) {
    setupTotalNumber++;
  }

  for (let i = 0; i < req.body.sizeTableL; i++) {
    setupTotalNumber++;
  }

  const setup = new Setup({
    nameOfRestaurant: req.body.nameOfRestaurant,
    sizeTableS: req.body.sizeTableS,
    sizeTableM: req.body.sizeTableM,
    sizeTableL: req.body.sizeTableL,
    totalTable: setupTotalNumber,
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
