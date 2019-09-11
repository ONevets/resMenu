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
  setupComplete: {type: Boolean, default: false}
});

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
const TableSetup = mongoose.model("TableSetup", tableSetupSchema);

//APP.ROUTE

app.route("/")
  .get(function(req, res) {
    TableSetup.findOne({
      setupComplete: true
    }, function(err, resultSetup) {
      if (err) {
        console.log(err);
      }
      if (!resultSetup) {
        res.redirect("/setup");
      } else {
        res.redirect("/menu");
      }
    });
  });

app.route("/setup")
  .get(function(req, res) {
    Setup.findOne({setupComplete: true}, function(err, resultFound){
      if(err){
        console.log(err);
      }
      else{
        // tableSetup.collection.drop();
        let sizeTableS = resultFound.sizeTableS;
        let sizeTableM = resultFound.sizeTableM;
        let sizeTableL = resultFound.sizeTableL;
        let totalTable = resultFound.totalTable;
        res.render("customer/setup.ejs", {sizeTableS: sizeTableS, sizeTableM: sizeTableM, sizeTableL: sizeTableL, totalTable: totalTable});
      }

    });

  })
  .post(function(req, res) {
    console.log(req.body);
    let tableNumber = req.body.tableNumber;
    const tableSetup = new TableSetup({
      tableNumber: tableNumber,
      setupComplete: true
    });
    tableSetup.save();
    res.redirect("/");
  });

app.route("/menu")
  .get(function(req,res){
    res.render("customer/menu.ejs");
  });

//APP.LISTEN
app.listen(3000, function() {
  console.log("Server started at port 3000 locally");
});
