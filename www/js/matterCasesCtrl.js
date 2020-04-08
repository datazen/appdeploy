uslApp.controller('matterCasesCtrl', function matterCasesCtrl($scope, $location, $http, permission, dataFabric, $routeParams, throbber) {
    $scope.errorMsg = dataFabric.readErrMsg();
    $scope.msg = dataFabric.readMsg();
    $scope.inProgress = false;
    $scope.matterCases = dataFabric.getItem('matterCases');
    $scope.new_case = {};

    $scope.open_cases_buttion = "Show Open Matter Cases";
    $scope.closed_cases_buttion = "Show Closed Matter Cases";

    $scope.getMatterCases = function () {
        $scope.inProgress = true;

        var req = null;
        if (permission.isDemo) {
            req = {
                method: 'GET',
                url: 'js/data/demo/matter_cases.json'
            };
        } else {
            req = {
                method: 'GET',
                url: app.getAPIEndPoint()+'/api/v1/get_all_matter_case.php',
                headers: {
                    'Authorization': permission.jwt
                }
            };
        }

        $http(req).then(function (response) {
            $scope.inProgress = false;
            //alert(JSON.stringify(response));
            var resp = response.data[0];
            if (resp.status === 'Success' ) {
                $scope.matterCases = resp.data;

                if ( $scope.matterCases != null) {
                    for (var i = 0; i < $scope.matterCases.length; i++) {
                        $scope.matterCases[i].datecreated = dateStrToMDY($scope.matterCases[i].datecreated);
                        $scope.matterCases[i].datemodified = dateStrToMDY($scope.matterCases[i].datemodified);
                        $scope.matterCases[i].assigned_date = dateStrToMDY($scope.matterCases[i].assigned_date);
                        $scope.matterCases[i].authorization_date = dateStrToMDY($scope.matterCases[i].authorization_date);
                    }
                }

                dataFabric.addItem('matterCases', $scope.matterCases);
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };

    $scope.createMatterCase = function () {
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
                navigator.notification.alert("Matter case has been created.", function () {}, "U.S. Legal Services");
                $location.url('/matter_cases/');
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };


    $scope.showMatterCase = function(matter_number) {
        $location.url('/matter_case/'+matter_number);
    };

    $scope.getCurrentMatterCase = function() {
        if ($scope.matterCases != null) {
            for (var i = 0; i < $scope.matterCases.length; i++) {
                if ($scope.matterCases[i].matter_number === $routeParams.id) {
                    return $scope.matterCases[i];
                }
            }
        }
    };

    $scope.currentMatterCase = $scope.getCurrentMatterCase();

    $scope.toggleOpenCases = function() {
        if ($scope.show_open_cases) {
            $scope.show_open_cases = false;
            $scope.open_cases_buttion = "Show Open Matter Cases";
        } else {
            $scope.show_open_cases = true;
            $scope.open_cases_buttion = "Hide Open Matter Cases";
        }
    };

    $scope.toggleClosedCases = function() {
        if ($scope.show_closed_cases) {
            $scope.show_closed_cases = false;
            $scope.closed_cases_buttion = "Show Closed Matter Cases";
        } else {
            $scope.show_closed_cases = true;
            $scope.closed_cases_buttion = "Hide Closed Matter Cases";
        }
    };


    $scope.filtOpen = function(item) {
        if (item.status !== "Void" && item.status !== "Closed") {
            return true;
        }
        return false;
    };


    $scope.autoLoadCases = function() {
        if ($routeParams.id == null) {
            $scope.getMatterCases();
        }
    }();


});
