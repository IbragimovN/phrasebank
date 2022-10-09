//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var random = require('mongoose-simple-random');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect('mongodb+srv://ibragimovnd:7143316zN@cluster0.hrflc9n.mongodb.net/phraseDB', {useNewUrlParser: true});
const phraseSchema = mongoose.Schema({
  phrase: String,
  meaning: String,
  reputation: { type: Number, default: 0 }
});
phraseSchema.plugin(random);

const Sample = mongoose.model("Sample", phraseSchema);
const Phrase = mongoose.model("phrase", phraseSchema);
var progress = 1;
var questionsArr = [];

app.route('/')
.get(function(req,res){
  res.render('list')
});

app.route('/add')
.get(function(req, res){
  res.render("add")
})
.post(function(req,res){
  const newPhrase = new Phrase({
    phrase: req.body.phrase,
    meaning: req.body.meaning,
  });
  newPhrase.save()
  console.log('New Document has been saved');
  res.redirect("/add")
});

app.route("/test")
.get(function(req, res){
  function clicked(){

  }
  var random = Math.floor(Math.random() * 4);
  var question;

  Phrase.findRandom({}, {}, {limit: 4}, function(err, results) {
    if (!err) {
      randomData = JSON.parse(JSON.stringify(results[random]));
      question = randomData.phrase;
      res.render("test", {randomQuest: question, results, progress})
    }
  });
})
.post(async function(req,res){
  var selectedAnswer = req.body.button;
    if(selectedAnswer === randomData.meaning){ // If answer is true
      randomData.answer = "true";
      Phrase.findOneAndUpdate({ _id: randomData._id }, { $inc: { reputation: 1 } }, {new: true },function(err, response) {
        if (err) {
        console.log(err);
       }});
      randomData.selected = selectedAnswer;
      questionsArr.push(randomData);
      if (progress === 10) {
        let sumOfAns = questionsArr.filter((el) => {
          return Object.values(el).some((val) =>
            String(val).toLowerCase().includes("true"))})
        res.render("Results", {result: questionsArr, sumOfAns});
        progress = 1;
        questionsArr = [];
      } else {res.redirect("/test")}
    } else if(selectedAnswer !== randomData.meaning){ //If answer is wrong
      randomData.answer = "wrong";
      Phrase.findOneAndUpdate({ _id: randomData._id }, { $inc: { reputation: -1 } }, {new: true },function(err, response) {
        if (err) {
        console.log(err);
       }});
      randomData.selected = selectedAnswer;
      questionsArr.push(randomData);
      if (progress === 10) {
        let sumOfAns = questionsArr.filter((el) => {
          return Object.values(el).some((val) =>
            String(val).toLowerCase().includes("true"))})
        res.render("Results", {result: questionsArr, sumOfAns});
        progress = 1;
        questionsArr = [];
      } else {res.redirect("/test")}
    };
    progress++;
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000
}

app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
