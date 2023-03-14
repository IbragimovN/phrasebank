//jshint esversion:6

const express = require("express");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var random = require("mongoose-simple-random");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://ibragimovnd:7143316zN@cluster0.hrflc9n.mongodb.net/phraseDB",
  { useNewUrlParser: true }
);
const phraseSchema = mongoose.Schema({
  phrase: String,
  meaning: String,
  reputation: { type: Number, default: 0 },
});
phraseSchema.plugin(random);

const Sample = mongoose.model("Sample", phraseSchema);
const Phrase = mongoose.model("phrase", phraseSchema);
var progress = 1;
var questionsArr = [];
function reset() {
  progress = 1;
}
var phraseAmount;
app.route("/").get(function (req, res) {
  res.render("list", { functs: reset() });
});

app
  .route("/add")
  .get(function (req, res) {
    res.render("add");
  })
  .post(function (req, res) {
    const newPhrase = new Phrase({
      phrase: req.body.phrase,
      meaning: req.body.meaning,
    });
    newPhrase.save();
    console.log("New Document has been saved");
    res.redirect("/add");
  });

app.route("/dictionary").get(function (req, res) {
  let page = req.query.page;
  console.log(page)
  Phrase.count({}, function (err, count) {
    phraseAmount = count;
  });
  Phrase.find(
    {},
    {},
    { sort: { _id: -1 }, limit: page * 50 },
    function (err, d_result) {
      const dictions = JSON.parse(JSON.stringify(d_result)).slice(
        (page - 1) * 50
      );
      res.render("dictionary", { dictions, Amount: phraseAmount });
    }
  );
});

app.route("/:phrase_id/delete").get(function (req, res, next) {
  console.log(req.params.phrase_id);
  Phrase.deleteOne({ _id: req.params.phrase_id }, function (err, data) {
    if (!err) {
      console.log(data);

      console.log("Phrase has been deleted");
    } else {
      console.log("error");
    }
  });
  res.redirect("/dictionary");
});

app
  .route("/test")
  .get(function (req, res) {
    function clicked() {}
    var random = Math.floor(Math.random() * 4);
    var question;

    Phrase.findRandom({}, {}, { limit: 4 }, function (err, results) {
      if (!err) {
        randomData = JSON.parse(JSON.stringify(results[random]));
        question = randomData.phrase;
        reputation = randomData.reputation;
        res.render("test", {
          randomQuest: question,
          reputation,
          results,
          progress,
        });
      }
    });
  })
  .post(async function (req, res) {
    var selectedAnswer = req.body.button;
    if (selectedAnswer === randomData.meaning) {
      // If answer is true
      randomData.answer = "true";
      Phrase.findOneAndUpdate(
        { _id: randomData._id },
        { $inc: { reputation: 1 } },
        { new: true },
        function (err, response) {
          if (err) {
            console.log(err);
          }
        }
      );
      randomData.selected = selectedAnswer;
      questionsArr.push(randomData);
    } else if (selectedAnswer !== randomData.meaning) {
      //If answer is wrong
      randomData.answer = "wrong";
      Phrase.findOneAndUpdate(
        { _id: randomData._id },
        { $inc: { reputation: -1 } },
        { new: true },
        function (err, response) {
          if (err) {
            console.log(err);
          }
        }
      );
      randomData.selected = selectedAnswer;
      questionsArr.push(randomData);
    }
    if (progress === 10) {
      let sumOfAns = questionsArr.filter((el) => {
        return Object.values(el).some((val) =>
          String(val).toLowerCase().includes("true")
        );
      });
      res.render("Results", { result: questionsArr, sumOfAns });
      progress = 1;
      questionsArr = [];
    } else {
      res.redirect("/test");
    }
    progress++;
  });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
