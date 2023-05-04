require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const createUser = require('./userShema');
const nodemailer = require('nodemailer');


const app = express();
const port = process.env.PORT || 5000;

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Connecting to mongoDB 
const url = process.env.MONGODB_URI
const conDB = async() => {
  try {
    const connectDB = await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 60000 });
    if(connectDB){
      console.log("connected to the database");
    } else {
      console.log(error => error);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
}
conDB();


// Define a route that responds to POST requests with JSON data
app.post('/home', async(req, res) => {
  const {name, email, password} = req.body 
  
  const newUser =  new createUser({
    name,
    email,
    password
  })

  const userCreated = await newUser.save()
  if(!userCreated) {
    console.log("user cannot be created");
    return res.status(500).send("user cannot be created")
  } else {
    console.log("user has been created to the database");
  }

  // Send email Notification
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASS,
    },
  });
  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'User Created',
    text: `Hey there, your account has been created`
  };
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return res.status(200).send('User has been created and Email sent')

});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
