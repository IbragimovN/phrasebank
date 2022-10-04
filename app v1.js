//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {useNewUrlParser: true});

const itemSchema = new{
  name: String
};

const Item = mongoose.model("Item", itemSchema);
const Sample = mongoose.model("Sample", itemSchema)

const item1 = new Sample ({
    name: "My"
});


// const defaultItems = [item1, item2, item3];
// Item.insertMany(defaultItems, function(err){
//   if(err){console.log(err)}else{console.log("Success")}
// })

// Get the count of all users

  
  // Get a random entry

  // Again query all users but only fetch one offset by our random #

app.get("/test", function(req, res) {
  var randomData = [];
  var randomOrder = [];
  let someOrder = Math.floor(Math.random() * 4);

  for(var i = 0; i < 4; i++){
    Item.count().exec(function (err, count) {
    var random = Math.floor(Math.random() * count)
    Item.findOne().skip(random).exec(
      function (err, randomResult) {
        
        mongoose.model('Sample').findOne({_id: randomResult._id}, function(err, result) {
          if(result === null){console.log('Not found');
          let newPhrase = new (mongoose.model('Sample'))({
            _id: randomResult._id,
            name: randomResult.name
          });
          newPhrase.save(); randomData.push(newPhrase)} else { console.log('Found'); --i};
      })
      })
      });
  };
  // for(let y = 0; y < 4; y++){
  //   let someOrder = Math.floor(Math.random() * 4);
  //   if(randomOrder.includes(someOrder)){y--} else {randomOrder.push(someOrder)}
  // };
  console.log(randomData[0].name);
  res.render("list", {listTitle: randomData});
  


  const newItem = req.body.newItem;
  const item = new Item({
    name: newItem
  })
  item.save();
  res.redirect("/");
});

app.get("/getresult", function(req, res){
  res.send(console.log(randomData))
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
