uslApp.controller('matterCasesCreateCtrl', function matterCasesCreateCtrl($scope, $location, $http, permission, dataFabric, $routeParams, throbber) {
    $scope.errorMsg = dataFabric.readErrMsg();
    $scope.msg = dataFabric.readMsg();
    $scope.inProgress = false;
    $scope.new_case = {};

    $scope.createMatterCase = function () {
        if (permission.isDemo) {
            navigator.notification.alert("Matter case has been created (demo mode).", function () {}, "U.S. Legal Services");
            $location.url('/matter_cases/');
        }
        throbber.start();
        $scope.inProgress = true;
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/matter_case_create.php',
            data: {
                who: $scope.new_case.who,
                when: $scope.new_case.when,
                where: $scope.new_case.where,
                what:  $scope.new_case.what,

            },
            headers: {
                'Authorization': permission.jwt
            }
        };

        $http(req).then(function (response) {
            $scope.inProgress = false;
            throbber.stop();
            var resp = response.data[0];
            //alert(JSON.stringify(response));
            if (resp.status === 'Success' ) {
                navigator.notification.alert("Matter case has been created. A representative will contact you in 24-48 business hours.", function () {}, "U.S. Legal Services");
                $location.url('/matter_cases/');
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };
    });
