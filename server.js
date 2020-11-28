var express = require('express');
var app = express();
var cors = require('cors')
var path = require('path');
const nodemailer = require("nodemailer");
const TEST_SEND_TO = process.env.PAWSIBLE_USER
const SEND_TO = process.env.PAWSIBLE_EMAIL
const sendTo = TEST_SEND_TO


let transporter = nodemailer.createTransport({
    host: "Smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.PAWSIBLE_USER, // generated ethereal user
      pass: process.env.PAWSIBLE_PASS, // generated ethereal password
    },
})
app.use(cors())

app.use(express.urlencoded({
    extended: true
}))

app.use(express.static('views'))



// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.post('/contact-form', (req, res) => {
    console.log('req.body', req.body) 
    transporter.sendMail({
        from: req.body.email, // sender address
        to: sendTo,
        subject: "It's Pawsible", // Subject line
        text: createText(req.body),
        html: htmlTemplate(req), // html body
    })
    .then(info=>{
        console.log(info)
        res.sendFile(path.join(__dirname + '/views/formsubmitted.html'));
    })
    .catch(console.error)
})

app.listen(8080);
console.log("Server stared :)")



function createText(data){
    return JSON.stringify(data)
}
function htmlTemplate(req){
    return `
        <h1>Hi Carol,</h1>
        <h3>We have a new order request!</h3>
        <p>Name: ${req.body.firstname} ${req.body.lastname}</p>
        <p>Phone: ${req.body.phone}</p>
        <p>E-mail: ${req.body.email}</p>
        <p>Subject: ${req.body.subject}</p>
    `;
}