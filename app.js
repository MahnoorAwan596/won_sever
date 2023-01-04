const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const authenticate = require("./middleware/authenticate");
const fs = require("fs");

var Publishable_Key = 'pk_test_yKONw0n63AR2OCYEfbgdwJlg'
var Secret_Key = 'sk_test_7tZHyX642LmkZN8myf1Fs6yh'

const stripe = require('stripe')(Secret_Key)
const cors = require('cors');

// const path = require("path");

// const router = require('express').Router()

const app = express();

// app.use(express.static(__dirname + "./public/"));

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000'
}));
dotenv.config({ path: "./config.env" });

// Connect to db
require("./db/conn");

const PORT = process.env.PORT;

//importing userschema
const User = require("./model/userSchema");
// const Contest = require("./model/contestSchema");
const Contact = require("./model/contactSchema");
// const Contestimage = require("./model/contestimageSchema.js");
const Winner = require("./model/winnerSchema.js");
const imageModel = require("./model/imagesSchema");
const Events = require("./model/eventSchema");

// Importing controller functions
const {
  getContests,
  getContest,
  createContest,
  deleteContest,
  updateContest,
  getuploads,
  getWinner,
  getEvents,
} = require("./controllers/contestController");
// const Contactimage = require('./model/contestImageSchema')

//to convert json data from postman into object and show here
app.use(express.json());




// for deployment building connection
// app.use(express.static(path.join(__dirname, "../react-responsive-website/build")));
// *means all urls
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../react-responsive-website/build/index.html"));
// })




// ------------------------------------------------------------------------------------------------

// Adding routes here
app.get("/", (req, res) => {
  res.send("Hello HOME from the server");
});

// Signup
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone, usertype } = req.body;
    //validation of fields
    if (!username || !email || !password || !phone || !usertype) {
      return res.status(422).json({ error: "Required" });
    } else {
      //check if user exist
      const userExist = await User.findOne({ email: email });
      if (userExist) {
        return res.status(422).json({ error: "Email already exist" });
      } else {
        // getting data & if user does not exist create new
        const user = new User({ username, email, password, phone, usertype });
        // hashing password pre-saving method
        // working in userSchema as a middleware
        // wait to save
        await user.save();
        // registration
        res.json({ message: "user registered successfully" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});


app.post('/payment',async  function(req, res){

	// Moreover you can take more details from user
	// like Address, Name, etc from form
	stripe.customers.create({
		email: req.body.receipt_email,
		source: req.body.source,
		
	})
	.then((customer) => {

		
		return stripe.charges.create({
			amount: req.body.price,	 
			description: 'Web Development Product',
			currency: 'USD',
			customer: customer.id
		});
	})
	.then(async (charge) => {

    const updateUser = await  User.findByIdAndUpdate(req.body.id, {
      price: req.body.price},
      console.log(updateUser)
)  
		res.json({message:"payment done" , status:true }) // If no error occurs
	})
	.catch((err) => {
		res.send(err)	 // If some error occurs
	});
})


// Login
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Required" });
    } else {
      //here userLogin is containing complete data from db
      const userLogin = await User.findOne({ email: email });

      if (userLogin) {
        console.log("/////////////", userLogin);
        const isMatch = await bcrypt.compare(password, userLogin.password);
        const token = await userLogin.generateAuthToken();

        res.cookie("jwtoken", token, {
          expires: new Date(Date.now() + 25892000000), //cookie should be expire after these milli seconds
          httpOnly: true, //kahan add kr skty wo bta dia http, wrna wo srf secure py chly ga, hm ny http py b chlana hy cookie ko
        });
        if (!isMatch) {
          res.status(400).json({ error: "Invalid Credentials " });
        } else {
          res.json({ userLogin });
        }
      } else {
        res.status(400).json({ error: "Invalid Credentials " });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

// GET user data for contact page and home page
app.get("/getdata", authenticate, (req, res) => {
  console.log("Hello my Data");
  res.send(req.rootUser);
});

// Logout
app.get("/logout", (req, res) => {
  console.log("Hello my Logout page");
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).send("User lOgout.");
});

// Contact Us
app.post("/contact", async (req, res) => {
  try {
    const { username, email, usertype, message } = req.body;
    if (!username || !email || !usertype || !message) {
      return res.status(422).json({ error: "Required" });
    } else {
      const contact = new Contact({ username, email, usertype, message });
      await contact.save();
      res.json({ message: "Message sent successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

// GET all Contests
app.get("/browse/", getContests);

// GET single Contest
app.get("/browse/contestopen/:id", getContest);

// Create Contest
app.post("/browse/", createContest);

// Select Winner
app.get("/winner/:id", getWinner);

app.post("/winner", async (req, res) => {
  console.log("Winner", req);
  const { name, email, contestId, phone, userId } = req.body;
  const winner = new Winner({ name, email, contestId, phone, userId });
  await winner.save();
  return res.json({ message: "Winner Created successfully" });
});

// upload Contest photo by user
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload/", upload.single("File"), (req, res) => {
  console.log("file/////////", req.body);
  const saveImage = imageModel({
    name: req.body.name,
    contestId: req.body.contestId,
    userId: req.body.userId,
    email: req.body.email,
    phone: req.body.phone,
    img: {
      data: fs.readFileSync("uploads/" + req.file.filename),
      contentType: "image/png",
    },
  });
  saveImage
    .save()
    .then((res) => {
      console.log("image is saved");
    })
    .catch((err) => {
      console.log(err, "error has occur");
    });
  res.send("image is saved");
});

app.get("/upload/:id", getuploads);
// DELETE Contest
app.delete("/browse/:id", deleteContest);

// UPDATE Contest
app.patch("/browse/:id", updateContest);

// dummy to check
app.get('/loginauth', authenticate, (req, res) => {
  console.log('hello login to create authentication');
  res.send(req.rootUser);
})

// add news
app.post("/addevents", async (req, res) => {
  try {
    const { username, email, subject, description } = req.body;
    if (!username || !email || !subject || !description) {
      return res.status(422).json({ error: "Required" });
    } else {
      const events = new Events({ username, email, subject, description });
      await events.save();
      res.json({ message: "News added successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

// GET all news
app.get("/fetchevents", getEvents);

app.listen(PORT, () => {
  console.log("Server is running at port " + PORT);
});
