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
const phrasalvSchema = mongoose.Schema({
  phrasalVerb: String,
  meaning: String,
  reputation: { type: Number, default: 0 },
});
phrasalvSchema.plugin(random);

const Sample = mongoose.model("Sample", phrasalvSchema);
const PhrasalVerb = mongoose.model("phrasalVerb", phrasalvSchema);
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
    const newPhrasalVerb = new PhrasalVerb({
      phrasalVerb: req.body.phrasalVerb,
      meaning: req.body.meaning,
    });
    newPhrasalVerb.save();
    console.log("New Document has been saved");
    res.redirect("/add");
  });

app.route("/dictionary").get(function (req, res) {
  var page = req.query.page;
  PhrasalVerb.count({}, function (err, count) {
    phraseAmount = count;
  });
  PhrasalVerb.find(
    {},
    {},
    { sort: { _id: -1 }, limit: page * 50 },
    function (err, d_result) {
      const dictions = JSON.parse(JSON.stringify(d_result)).slice(
        (page - 1) * 50
      );
      res.render("dictionary", { dictions, Amount: phraseAmount, page });
    }
  );
});

app.route("/:phrase_id/delete").get(function (req, res, next) {
  console.log(req.params.phrase_id);
  PhrasalVerb.deleteOne({ _id: req.params.phrase_id }, function (err, data) {
    if (!err) {
      console.log(data);
    } else {
      console.log("error");
    }
  });
  res.redirect("back");
});

app
  .route("/test")
  .get(function (req, res) {
    function clicked() {}
    var random = Math.floor(Math.random() * 4);
    var question;

    PhrasalVerb.findRandom({}, {}, { limit: 4 }, function (err, results) {
      if (!err) {
        randomData = JSON.parse(JSON.stringify(results[random]));
        question = randomData.phrasalVerb;
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
      PhrasalVerb.findOneAndUpdate(
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
      PhrasalVerb.findOneAndUpdate(
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
