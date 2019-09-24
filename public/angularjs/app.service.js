"use strict";

var mainApp = angular.module("AppService", []);

//Basic service functions are implemented here
mainApp.factory('AuthService', [
    "$http",
    "$q",
    function ($http, $q) {
        return {
            // check user validations
            getUser: function () {
                var defer = $q.defer();

                $http.get("/auth-api/user").then(
                    (results) => {
                        defer.resolve(results.data);
                    },
                    (err) => {
                        defer.reject(err);
                    }
                );

                return defer.promise;
            },
            // request oauth url from server
            getOAuthUrl: function () {
                var defer = $q.defer();

                $http.get("/auth-api/auth").then(
                    (results) => {
                        defer.resolve(results.data);
                    },
                    (err) => {
                        defer.reject(err);
                    }
                );

                return defer.promise;
            },
            //call to logout method
            logout: function () {
                var defer = $q.defer();

                $http.post("/auth-api/logout").then(
                    (results) => {
                        defer.resolve(results.data);
                    },
                    (err) => {
                        defer.reject(err);
                    }
                );

                return defer.promise;
            }
        }
    }
]);


/**
 * This method include all Uploading services
 */
mainApp.factory('UploadService', [
    "$http",
    "$q",
    function ($http, $q) {
        return {
            // upload image to drive
            uploadImage: function (image) {
                var defer = $q.defer();

                var formData = new FormData();
                formData.append("image", image);

                $http.post("/auth-api/upload", formData, {
                        transformRequest: angular.identity,
                        headers: {
                            "Content-Type": undefined
                        }
                    })
                    .then(
                        (result) => {
                            console.log("Success++++++++++++");
                            console.log(result);
                            defer.resolve(result);
                        },
                        (err) => {
                            console.log("Error++++++++++++");
                            defer.reject(err);
                        }
                    );

                return defer.promise;
            }
        }
    }
]);