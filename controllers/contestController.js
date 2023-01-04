const Contest = require("../model/contestSchema");
const ImageModel = require("../model/imagesSchema");
const Winner = require("../model/winnerSchema");
const mongoose = require("mongoose");
const Events = require("../model/eventSchema");
// const formidable = require("formidable");

// Get all contests
const getContests = async (req, res) => {
  const contests = await Contest.find({}).sort({ createdAt: -1 }); // Sort by date and -1 for descending order

  return res.status(200).json(contests);
};

// Get single contest
const getContest = async (req, res) => {
  const { id } = req.params; // Id to find single document

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such contest" });
  }

  const contest = await Contest.findById({ _id: id });

  if (!contest) {
    return res.status(404).json({ error: "No such contest" });
  }

  return res.status(200).json(contest);
};

// GET winner
const getWinner = async (req, res) => {
  const { id } = req.params;
  const winner = await Winner.find({ userId: id });

  if (!winner) {
    return res.status(404).json({ error: "No such contest" });
  }

  return res.status(200).json(winner);
};

// Create a new contest
const createContest = async (req, res) => {
  const {
    contestcreator,
    contesttitle,
    designtype,
    description,
    designusedas,
    enddate,
    budget,
    additionaldescription,
  } = req.body;
  if (
    !contestcreator ||
    !contesttitle ||
    !designtype ||
    !description ||
    !designusedas ||
    !enddate ||
    !budget ||
    !additionaldescription
  ) {
    return res.status(422).json({ error: "Plz fill the field properly" });
  }
  try {
    const contest = new Contest({
      contestcreator,
      contesttitle,
      designtype,
      description,
      designusedas,
      enddate,
      budget,
      additionaldescription,
    });

    const contestCreated = await contest.save();
    if (contestCreated) {
      return res.status(201).json({ message: "Contest created successfully" });
    } else {
      return res.status(500).json({ error: "Failed to create contest" });
    }
  } catch (err) {
    console.log(err);
  }
};

// Delete a contest
const deleteContest = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such contest" });
  }

  const contest = await Contest.findOneAndDelete({ _id: id });

  if (!contest) {
    return res.status(404).json({ error: "No such contest" });
  }

  res.status(200).json(contest);
};

// Update a contest
const updateContest = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such contest" });
  }

  const contest = await Contest.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!contest) {
    return res.status(404).json({ error: "No such contest" });
  }

  res.status(200).json(contest);
};

// Get images
const getuploads = async (req, res) => {
  const { id } = req.params;
  const Images = await ImageModel.find({ contestId: id }); // Sort by date and -1 for descending order

  return res.status(200).json(Images);
};

// Get all events
const getEvents = async (req, res) => {
  const events = await Events.find({}).sort({ createdAt: -1 }); // Sort by date and -1 for descending order

  return res.status(200).json(events);
};

// Exporting functions
module.exports = {
  getContests,
  getContest,
  createContest,
  deleteContest,
  getuploads,
  getWinner,
  updateContest,
  getEvents,
};
