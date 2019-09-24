/**
 * app.js
 * 
 * Angular Js Main Application
 */

"use strict";

var app = angular.module('app', ["ngRoute", "ngFileUpload","AppService"]);

//Config the all routes
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: 'LoginController',
            templateUrl: 'view/login.html'
        })
        .when("/upload", {
            templateUrl: "view/upload.html",
            controller: "UploadController"
        })
        .otherwise({
            redirectTo: "/"
        });
    $locationProvider.html5Mode(true);
})

//Login controller to handle all method in login
app.controller("LoginController", [
    "$scope",
    "$location",
    "AuthService",
    function ($scope, $location, AuthService) {
        $scope.initUrl = function () {
            var currentUrl = $location.url();

            if (currentUrl === "/") {
                AuthService.getOAuthUrl().then((data) => {
                        console.log(data);
                        $scope.authUrl = data.url;
                    },
                    (err) => {
                        console.error(err);
                    }
                );
            }
        };

        //call the init URL function
        $scope.initUrl();
    }
]);


//Handle the logout
app.controller("LogoutController", [
    "$scope",
    "$location",
    "AuthService",
    function ($scope, $location, AuthService) {

        //Logout the user
        $scope.logout = function () {
            console.log("Logout called");
            AuthService.logout().then(() => {
                    $location.path("/login");
                },
                (err) => {
                    console.error(err);
                }
            );
        };

    }
]);

//Upload controller to handle all method in image upload
app.controller("UploadController", [
    "$scope",
    "$location",
    "$window",
    "AuthService",
    "UploadService",
    function ($scope, $location, $window, AuthService, UploadService) {
        //check user is authenticated or not, if not redirect to the login page
        $scope.isAuthenticated = function () {
            var currentUrl = $location.url();

            if (currentUrl === "/upload") {
                AuthService.getUser().then((data) => {},
                    (err) => {
                        if (err.status == 404) {
                            console.log(err);
                            $window.location.href = '/';
                        }
                    }
                );
            }
        };

        //invoke the isAuthenticated function
        $scope.isAuthenticated();

        $scope.file = "";
        $scope.upload_status = "";
        $scope.data = {
            message: "",
            status: true
        };

        console.log($scope.file);

        // upload image function
        $scope.upload = function () {
            var fileType = $scope.file.type;
            if (!(fileType == "image/png" || fileType == "image/jpg" || fileType == "image/jpeg")) {
                $scope.data = {
                    message: "Not an Image File!",
                    status: false
                };

                return;
            }

            //set upload status into uploading
            $scope.upload_status = "Uploading...";

            //call upload service to upload the selected image
            UploadService.uploadImage($scope.file).then((data) => {
                    console.log(data);

                    //clear the file
                    $scope.file = "";

                    //reset the upload status
                    $scope.upload_status = "";

                    $scope.data = {
                        message: "Uploaded Successfully",
                        status: true
                    };
                },
                (err) => {
                    //clear the file
                    $scope.file = "";
                    //reset the upload status
                    $scope.upload_status = "";
                    
                    $scope.data = {
                        message: "Something went wrong!",
                        status: false
                    };
                }
            );
        };
    }
]);