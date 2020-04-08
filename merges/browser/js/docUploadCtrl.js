uslApp.controller("docUploadCtrl", function docUploadCtrl($scope, $location, $http, permission, $routeParams, dataFabric, throbber) {
    $scope.errorMsg = dataFabric.readErrMsg();

    $scope.case = null;
    $scope.upload_type = $routeParams.upload_type;

    var dropbox = document.getElementById("dropbox");
    $scope.dropText = "Drop PDF file here...";

    // init event handlers
    function dragEnterLeave(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $scope.$apply(function () {
            $scope.dropText = "Drop PDF file here...";
            $scope.dropClass = ""
        })
    };

    if (dropbox != null) {

        dropbox.addEventListener("dragenter", dragEnterLeave, false);
        dropbox.addEventListener("dragleave", dragEnterLeave, false);
        dropbox.addEventListener("dragover", function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var clazz = "not-available";
            var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf("Files") >= 0;
            $scope.$apply(function () {
                $scope.dropText = ok ? "Drop PDF file here..." : "Only files are allowed!";
                $scope.dropClass = ok ? "over" : "not-available";
            })
        }, false);
        dropbox.addEventListener("drop", function (evt) {
            console.log("drop evt:", JSON.parse(JSON.stringify(evt.dataTransfer)));
            evt.stopPropagation();
            evt.preventDefault();
            $scope.$apply(function () {
                $scope.dropText = "Drop PDF file here...";
                $scope.dropClass = ""
            });
            var files = evt.dataTransfer.files;

            if (files.length > 0) {
                $scope.$apply(function () {
                    $scope.files = [];
                    $scope.files.push(files[0])
                })
            }
        }, false);
    }
    //============== DRAG & DROP =============

    $scope.setFiles = function(element) {
        $scope.$apply(function() {
            //console.log("files:", element.files);
            // Turn the FileList object into an Array
            $scope.files = [];
            for (var i = 0; i < element.files.length; i++) {
                $scope.files.push(element.files[i])
            }
        });
    };

    $scope.uploadFiles = function () {

        if (permission.isDemo) {
            navigator.notification.alert("File have been uploaded.", function () {}, "U.S. Legal Services");
            $location.url("/case/123/case_files/");
        }

        $scope.inProgress = true;
        throbber.start();

        var fd = new FormData();
        fd.append("attachment",  $scope.files[0]);
        fd.append("doc_type", $scope.upload_type);
        fd.append("cdl_id", $routeParams.id);
        fd.append("citation_number", dataFabric.getItem("cit_num"));

        var req = {
            method: "POST",
            url: app.getAPIEndPoint()+'/api/v1/cdl_case_files.php',
            data: fd,
            transformRequest: angular.identity,
            headers: {
                "Content-Type": undefined,
                "Authorization": permission.jwt
            }
        };

        $http(req).then(function (response) {
            throbber.stop();
            var resp = response.data;
            if (resp.status === "Success") {
                navigator.notification.alert("File have been uploaded.", function () {}, "U.S. Legal Services");
                $location.url("/case/" + $routeParams.id + "/case_files/");
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };


    $scope.uploadCit = function() {
        if (dataFabric.getItem("canUploadCit")) {
            dataFabric.removeItem("canUploadCit");
            $location.url("/case/" + $routeParams.id + "/case_files_upload/cit");
        }
    };

    $scope.uploadVer = function() {
        if (dataFabric.getItem("canUploadVER")) {
            dataFabric.removeItem("canUploadVER");
            $location.url("/case/" + $routeParams.id + "/case_files_upload/ver");
        }
    };

    $scope.uploadOther = function() {
        if (dataFabric.getItem("canUploadOther")) {
            dataFabric.removeItem("canUploadOther");
            $location.url("/case/" + $routeParams.id + "/case_files_upload/oth");
        }
    };

    $scope.uploadDone = function() {
        dataFabric.removeItem("canUploadCit");
        dataFabric.removeItem("canUploadVER");
        dataFabric.removeItem("canUploadOther");
        $location.url("/");
    };

    $scope.canUpload = function(type) {
        if (type === "cit") {
            return dataFabric.getItem("canUploadCit");
        }
        if (type === "ver") {
            return dataFabric.getItem("canUploadVER");
        }
        if (type === "other") {
            return dataFabric.getItem("canUploadOther");
        }
        return false;
    };


    $scope.uploadType = function() {
        if ($scope.upload_type === "cit") {
            return "citation"
        }
        if ($scope.upload_type === "ver") {
            return "roadside inspection"
        }
        if ($scope.upload_type === "other") {
            return "other"
        }
        return "";
    };
});