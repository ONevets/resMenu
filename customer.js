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

var tableSetupSchema = new mongoose.Schema({
  tableNumber: Number,
  setupComplete: {default: false}
});

//MODELS

const tableSetup = mongoose.model("tableSetup", tableSetupSchema);

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

//booking the place
app.route("/booked")
  .get(function(req,res){
    res.render("booked.ejs");
  })
  .post(function(req,res){
    console.log(req.body);
    tableNumber = parseInt(req.body.button);
    console.log(tableNumber);
    Reserve.findOne({tableNumber: tableNumber}, function(err, foundTable){
      if(err){
        console.log(err);
      }
      if(foundTable.taken === true){
        res.redirect("/taken");
      } else{
        Reserve.updateOne({tableNumber: tableNumber }, {$set: {taken: true} }, function(err){
          if(err){
            console.log(err);
          } else{
            console.log("Updated");
          }
        });
        res.redirect("/booked");
      }
    });

  });

app.route("/taken")
  .get(function(req,res){
    res.render("taken.ejs");
  });

//APP.LISTEN
app.listen(3000, function() {
  console.log("Server started at port 3000 locally");
});
