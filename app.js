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

let sizeTableS = 0;
let sizeTableM = 0;
let sizeTableL = 0;
let totalTable = 0;

//APP.ROUTE
app.route("/")
  .get(function(req, res) {
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

app.route("/setup")
  .get(function(req, res) {
    Setup.collection.drop();
    res.render("setup.ejs");
  })
  .post(function(req, res) {
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

app.route("/reserve")
  .get(function(req, res) {

    //if havent setup yet then go to /setup
    Setup.findOne({}, function(err, resultSetup) {
      if (err) {
        console.log(err);
      }
      if (!resultSetup) {
        res.redirect("/setup");
      } else {

        Reserve.find({}, function(err, resultReserve) {
          let arraySizeTableS = [];
          let arraySizeTableM = [];
          let arraySizeTableL = [];

          if (err) {
            console.log(err);
          }

          if (resultReserve) {
            resultReserve.forEach(function(element) {
              if (element.sizeOfTable === "S") {
                arraySizeTableS.push(element.sizeOfTable);
              } else if (element.sizeOfTable === "M") {
                arraySizeTableM.push(element.sizeOfTable);
              } else if (element.sizeOfTable === "L") {
                arraySizeTableL.push(element.sizeOfTable);
              }
            });
            console.log(arraySizeTableL);
            console.log(arraySizeTableS);
            console.log(arraySizeTableM);
            res.render("reserve.ejs", {
              nameOfRestaurant: resultSetup.nameOfRestaurant,
              arraySizeTableS: arraySizeTableS,
              arraySizeTableM: arraySizeTableM,
              arraySizeTableL: arraySizeTableL,
              totalTable: resultSetup.totalTable
            });
          }
        });
      }
    });
  });

  // app.post("/reserve", function(req,res){
  // });
  
app.route("/booked")
  .get(function(req,res){
    res.render("booked.ejs");
  });




//APP.LISTEN
app.listen(3000, function() {
  console.log("Server started at port 3000 locally");
});
