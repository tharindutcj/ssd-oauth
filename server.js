"use strict";

var path = require("path");
var bodyParser = require("body-parser");
var express = require("express");
var session = require("express-session");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));
app.set("/view", path.join(__dirname, "/public/view"));

// session
app.use(
    session({
        secret: "notasecret",
        resave: true,
        saveUninitialized: true
    })
);

// drive authentication and upload api
var auth = require("./controllers/auth.controller");
app.use("/auth-api", auth);

app.use("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

// server start
app.listen(port, function (err) {
    if (err) {
        console.error(err);
        return;
    }

    console.log("Server running on port " + port);
});