uslApp.controller('citationCtrl', function citationCtrl($scope, $location, $http, permission, dataFabric, $routeParams, throbber) {
    $scope.errorMsg = dataFabric.readErrMsg();
    $scope.msg = dataFabric.readMsg();
    $scope.inProgress = false;
    $scope.citation = null;
    $scope.citation_numbers = [{id: 0}];

    $scope.submitCitation = function () {

        if ($scope.citation.court_time == null) {
            $scope.citation.court_time = jQuery('#court_time').val();
        }

        /*if ($scope.citation.court_time != null) {
            $scope.citation.court_date = $scope.citation.court_date + " " + $scope.citation.court_time;
        }*/

        var court_date = $scope.citation.court_date;

        if (court_date != null) {
            if (court_date instanceof Date) {
                if ($scope.citation.court_time == null) {
                    court_date.setHours($scope.citation.court_time.getHours());
                    court_date.setMinutes($scope.citation.court_time.getMinutes());
                }
            } else {
                if ($scope.citation.court_time == null || $scope.citation.court_time.length === 0) {
                    court_date = $scope.dateStringToDate($scope.citation.court_date);
                } else {

                    court_date = $scope.dateTimeToDate($scope.citation.court_date, $scope.citation.court_time);
                }
            }
        }

        if (permission.isDemo) {
            $scope.submitSuccess(123);
        }

        throbber.start();
        $scope.citation.number = "";
        for (var i = 0; i < $scope.citation_numbers.length; i++) {
            $scope.citation.number += ', ' + $scope.citation_numbers[i].num;
        }
        $scope.citation.number = $scope.citation.number.substring(1);
        $scope.inProgress = true;
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/citation_for_cdl.php',
            data: {
                ver_number: $scope.ver_number,
                citation_number: $scope.citation.number,
                date_issued: $scope.citation.issue_date,
                court_datetime: court_date,
                court_phone:  $scope.citation.court_phone,

            },
            headers: {
                'Authorization': permission.jwt
            }
        };

        $http(req).then(function (response) {
            $scope.inProgress = false;
            throbber.stop();
            var resp = response.data[0];
            if (resp.status === 'Success' ) {
                $scope.submitSuccess(resp.case_number);
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };

    $scope.submitSuccess = function (case_number) {
        dataFabric.addItem("cit_num", $scope.citation_numbers[0].num);
        dataFabric.addItem("canUploadCit", true);
        dataFabric.addItem("canUploadVER", true);
        dataFabric.addItem("canUploadOther", true);
        navigator.notification.alert("Your ticket has been submitted. A representative will contact you in 24-48 business hours.", function () {}, "U.S. Legal Services");
        $location.url('/case/' + case_number + "/case_files/");
    };

    $scope.addCitationNumber = function() {
        $scope.citation_numbers.push({'id': $scope.citation_numbers.length});
    };

    $scope.removeCitationNumber = function() {
        $scope.citation_numbers.splice( $scope.citation_numbers.length -1);
    };

    $scope.formatCourtPhone = function () {
        $scope.citation.court_phone = $scope.phoneFormat($scope.citation.court_phone);
        var $e = $('#courtphone')[0];
        setTimeout(function(){ $e.selectionStart = $e.selectionEnd = 10000; }, 0);
    };


    $scope.onLoad = function () {
        if (app.setDatepickers != null) {
            app.setDatepickers();
        }
        if (app.setTimepicker != null) {
            app.setTimepicker();
        }
    }();


});
