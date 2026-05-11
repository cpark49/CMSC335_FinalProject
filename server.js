const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const Mood = require("./models/Mood");

const app = express();
const router = express.Router();

const port = process.env.PORT || 5001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "css")));

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.log("MongoDB connection error:", error));

function getMoodMessage(mood) {

  if (mood === "happy") {
    return `That is great to hear!
I hope your day keeps going well.
Enjoy this dog to celebrate your happiness :)`;
  }

  if (mood === "mad") {
    return `I am sorry you are feeling mad.
It's okay to feel this way sometimes.
Hopefully this dog can make your day a little better :)`;
  }

  if (mood === "depressed") {
    return `I am sorry you are feeling this way.
Please remember that you matter.
Hopefully this dog can bring you at least a small smile today :)`;
  }

  if (mood === "stressed") {
    return `Stress can feel overwhelming sometimes.
Take a deep breath and focus on one thing at a time.
Enjoy this random dog and take a small mental break :)`;
  }

  return `Thank you for sharing how you feel.`;
}

router.get("/", async (req, res) => {

  const moods = await Mood.find()
    .sort({ createdAt: -1 })
    .limit(5);

  res.render("index", {
    moods: moods
  });
});

router.post("/submit", async (req, res) => {

  const selectedMood = req.body.mood;

  const message = getMoodMessage(selectedMood);

  const apiResponse = await fetch("https://random.dog/woof.json");

  const dogData = await apiResponse.json();

  const isVideo =
    dogData.url.endsWith(".mp4") ||
    dogData.url.endsWith(".webm");

  const newMood = new Mood({
    mood: selectedMood,
    message: message,
    dogUrl: dogData.url
  });

  await newMood.save();

  res.render("result", {
    mood: selectedMood,
    message: message,
    dogUrl: dogData.url,
    isVideo: isVideo
  });
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Web server started and running at http://localhost:${port}`);
});