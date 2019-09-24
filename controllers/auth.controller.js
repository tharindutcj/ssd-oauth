/**
 * aut.controller.js
 *
 * This file contails user authentication and image upload API
 */

"use strict";


const {
    google
} = require('googleapis');

var fs = require("fs");
var multer = require("multer");
var request = require("request");
var express = require("express");
var router = express.Router();

/* * * * * * * * * * * * * * * * * * * * * */
//
// Config the google authentication details
//
/* * * * * * * * * * * * * * * * * * * * * */
const CLIENT_ID = "233375276793-69lb72a5v16akofnjis8ruijs1u2b3hv.apps.googleusercontent.com";
const CLIENT_SECRET = "J7un__UYkva1aHiCjS2ERabd";
const REDIRECT_URL = "http://localhost:3000/auth-api/callback";

var access_token = "";

// upload multipart files using multer
var upload = multer({dest: "uploads/"}).single("image");

/**
 * Generate oAuth url including scopes
 */
function getOAuthURL() {
    var OAuth2 = google.auth.OAuth2;

    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

    // generate usrl to request google drive and google plus permission
    var scopes = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/plus.me'
    ];
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
        scope: scopes
    });
    return url;
}


/**
 * This get function return the oAuth URL
 */
router.get("/auth", (req, res) => {
        res.json({
            url: getOAuthURL()
        });
    },
    (err) => {
        console.error(err);
        res.send(500);
    }
);

/**
 * This is call back function
 * In here, requrest to the google apis using authorization code and
 * receive the access token
 */
router.use("/callback", (req, res) => {
    console.log("Callback received");
    var session = req.session;
    var code = req.query.code;

    // receive access_token by sending authorization code
    var url = "https://www.googleapis.com/oauth2/v4/token";
    request({
            uri: url,
            method: "POST",
            form: {
                code: code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URL
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        },
        (err, response, body) => {
            if (err) {
                return console.error(err);
            }

            // set the access_token to session
            var json = JSON.parse(body);
            access_token = json.access_token;
            session["access_token"] = body;

            // redirect user to upload page for image upload
            res.redirect("/upload");
        }
    );
});

/**
 * This post request for upload image to google drive
 * access_token send in header of the request to authenticate user
 */
router.post("/upload", upload, (req, res) => {
    var file = req.file;

    // upload request
    var url = "https://www.googleapis.com/upload/drive/v3/files";
    request({
            uri: url,
            qs: {
                uploadType: "multipart"
            },
            method: "POST",
            headers: {
                "Content-Type": "multipart/related",
                Authorization: "Bearer " + access_token
            },
            multipart: [{
                    "Content-Type": "application/json; charset=UTF-8",
                    body: JSON.stringify({
                        name: file.originalname
                    })
                },
                {
                    "Content-Type": file.mimetype,
                    body: fs.createReadStream(file.path)
                }
            ]
        },
        (error, response, body) => {
            try {
                //remove uploaded file from local
                fs.unlinkSync(file.path)
            } catch (e) {
                console.error(e);
            }
            // console.log("++++++error++++++");
            // console.log(error);
            console.log("+++++response+++++++");
            console.log(response);
            // console.log("+++++body+++++++");
            // console.log(body);
            if (error) {
                console.error(error);
                res.sendStatus(500);
            }
            // console.log(body);
            // var json = JSON.parse(response.body);
            // console.log(json);
            // if(response.body.code == 200){
                
                res.sendStatus(200);
            // }else{
            //     console.log(json.error.message);
            //     res.status(json.error.code).send(json.error.message);
            // }
        }
    );
});

/**
 * Check whether user is authenticated or not
 * Basically here we check availability of access token is session
 */
router.get("/user", (req, res) => {
    if (req.session["access_token"]) {
        res.status(200).send("User authenticated");
    } else {
        res.status(404).send("User authentication expired");
    }
});

module.exports = router;