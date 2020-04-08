uslApp.controller('docUploadCtrl', function docUploadCtrl($scope, $location, $http, permission, $routeParams, dataFabric, throbber) {
    $scope.errorMsg = dataFabric.readErrMsg();

    $scope.imgs = [];
    $scope.case = null;
    $scope.upload_type = $routeParams.upload_type;

    $scope.uploadFiles = function () {

        if (permission.isDemo) {
            navigator.notification.alert("File(s) have been uploaded.", function () {}, "U.S. Legal Services");
            $location.url('/case/123/case_files/');
        }

        $scope.inProgress = true;
        throbber.start();
        var pdf = $scope.compile();

        var fd = new FormData();
        fd.append('attachment', $scope.dataURItoBlob(pdf));
        fd.append('doc_type', $scope.upload_type);
        fd.append('cdl_id', $routeParams.id);
        fd.append('citation_number', dataFabric.getItem('cit_num'));

        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/cdl_case_files.php',
            data: fd,
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'Authorization': permission.jwt
            }
        };

        $http(req).then(function (response) {
            throbber.stop();
            var resp = response.data;
            if (resp.status === "Success") {
                navigator.notification.alert("File(s) have been uploaded.", function () {}, "U.S. Legal Services");
                $location.url('/case/' + $routeParams.id + "/case_files/");
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };

    $scope.capturePhoto = function () {
        navigator.camera.getPicture(
            pushImg,
            function (s) {
                if (s !== "Camera cancelled.") {
                    navigator.notification.alert('An Error has occurred accessing the camera: ' + s, null, 'Camera Error!', 'OK');
                }
            },
            {destinationType: Camera.DestinationType.DATA_URL, mediaType: Camera.MediaType.PICTURE, correctOrientation: true, quality:50, targetWidth:800}
        );
    };

    $scope.dataURItoBlob = function(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++)
        {
            ia[i] = byteString.charCodeAt(i);
        }

        var bb = new Blob([ab], { "type": mimeString });
        return bb;
    };

    $scope.capturePhotoFromGallery = function () {
        navigator.camera.getPicture(pushImg, null, {
                destinationType: Camera.DestinationType.DATA_URL,
                mediaType: Camera.MediaType.PICTURE,
                sourceType:Camera.PictureSourceType.SAVEDPHOTOALBUM,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 800,
                correctOrientation: true,
                quality:50
            });
    };

    var pushImg = function(imageData) {
        $scope.imgs.push(imageData);
        var $cameraPic = jQuery('<img/>');
        $cameraPic.attr('src', 'data:image/jpeg;base64,' + imageData);
        jQuery('#imgs').append($cameraPic);
        $cameraPic.css({'height': $cameraPic.width() + 'px' });
    };

    $scope.compile = function() {
        var doc = new jsPDF();
        doc.setFontSize(40);
        for (var i = 0; i < $scope.imgs.length; i++) {
          // if more than one image, add a new page beforehand
          if (i !== 0) {
            doc.addPage('A4', 'p');
          }
          doc.addImage("data:image/jpeg;base64," + $scope.imgs[i], 'JPEG', 15, 40, 180, 180);
        }
        return doc.output('datauristring');
    };


    $scope.uploadCit = function() {
        if (dataFabric.getItem('canUploadCit')) {
            dataFabric.removeItem('canUploadCit');
            $location.url('/case/' + $routeParams.id + "/case_files_upload/cit");
        }
    };

    $scope.uploadVer = function() {
        if (dataFabric.getItem('canUploadVER')) {
            dataFabric.removeItem('canUploadVER');
            $location.url('/case/' + $routeParams.id + "/case_files_upload/ver");
        }
    };

    $scope.uploadOther = function() {
        if (dataFabric.getItem('canUploadOther')) {
            dataFabric.removeItem('canUploadOther');
            $location.url('/case/' + $routeParams.id + "/case_files_upload/oth");
        }
    };

    $scope.uploadDone = function() {
        dataFabric.removeItem('canUploadCit');
        dataFabric.removeItem('canUploadVER');
        dataFabric.removeItem('canUploadOther');
        $location.url('/');
    };

    $scope.canUpload = function(type) {
        if (type === "cit") {
            return dataFabric.getItem('canUploadCit');
        }
        if (type === "ver") {
            return dataFabric.getItem('canUploadVER');
        }
        if (type === "other") {
            return dataFabric.getItem('canUploadOther');
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