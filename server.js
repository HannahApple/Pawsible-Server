var express = require('express');
var app = express();
var cors = require('cors')
var path = require('path');
const nodemailer = require("nodemailer");
const TEST_SEND_TO = process.env.PAWSIBLE_USER
const SEND_TO = process.env.PAWSIBLE_EMAIL
const sendTo = TEST_SEND_TO
const REDIRECT_URL = process.env.PAWSIBLE_REDIRECT_URL
const CLIENT_ID = process.env.PAWSIBLE_CLIENT_ID
const CLIENT_SECRET = process.env.PAWSIBLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.PAWSIBLE_REFRESH_TOKEN
const helmet = require("helmet");
const https = require('https');
const http = require('http');
const fs = require('fs');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    CLIENT_ID, 
    CLIENT_SECRET, 
    REDIRECT_URL 
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: TEST_SEND_TO, 
         clientId: CLIENT_ID,
         clientSecret: CLIENT_SECRET,
         refreshToken: REFRESH_TOKEN,
         accessToken: accessToken
    },
    tls: {
        rejectUnauthorized: false
      }
});


app.use(cors())
app.use(express.urlencoded({
    extended: true
}))
app.use(helmet.hsts());
app.use(express.static('views'))


// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.post('/contact-form', (req, res) => {

    console.log('req.body', req.body) 
    transporter.sendMail({
        from: req.body.email, // sender address
        to: TEST_SEND_TO,
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

console.log("Server stared :)")

// Listen both http & https ports
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync(__dirname + '/ssl/server.key'),
  cert: fs.readFileSync(__dirname + '/ssl/server.crt'),
}, app);

httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});



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