//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var random = require('mongoose-simple-random');
const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect('mongodb+srv://ibragimovnd:7143316zN@cluster0.hrflc9n.mongodb.net/phraseDB', {useNewUrlParser: true});
const phraseSchema = mongoose.Schema({
  phrase: String,
  meaning: String
});
phraseSchema.plugin(random);

const Sample = mongoose.model("Sample", phraseSchema);
const Phrase = mongoose.model("phrase", phraseSchema);
var process = 1;
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
    meaning: req.body.meaning
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
      randomData = results[random];
      question = randomData.phrase;
      res.render("test", {randomQuest: question, results, process})
    }
  });
})
.post(function(req,res){
  var selectedAnswer = req.body.button;
  process++;
  if(process > 10){
    res.render("Results", {result: questionsArr});
    process = 1;
    } else {
  if(selectedAnswer === randomData.meaning){ // If answer is true
    randomData.answer = "Answer is true";
    questionsArr.push(randomData);
    res.redirect("/test")
  } else if(selectedAnswer !== randomData.meaning){ //If answer is wrong
    randomData.answer = "Answer is wrong";
    questionsArr.push(randomData);
    res.redirect("/test")
  }}
})


app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});
