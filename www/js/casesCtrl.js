uslApp.controller('casesCtrl', function casesCtrl($scope, $http, $location, permission, dataFabric, $routeParams) {
    $scope.errorMsg = dataFabric.readErrMsg();
    $scope.msg = dataFabric.readMsg();
    $scope.inProgress = false;
    $scope.cases = dataFabric.getItem('cases');

    $scope.show_open_cases = false;
    $scope.open_cases_buttion = "Show Open CDL & Roadside Inspection Cases";
    $scope.show_closed_cases = false;
    $scope.closed_cases_buttion = "Show Closed CDL & Roadside Inspection Cases";

    $scope.getCases = function () {

        var req = null;
        if (permission.isDemo) {
            req = {
                method: 'GET',
                url: 'js/data/demo/cdl_cases.json'
            };
        } else {
            req = {
                method: 'GET',
                url: app.getAPIEndPoint()+'/api/v1/case_resolution_status.php',
                headers: {
                    'Authorization': permission.jwt
                }
            };
        }
        $scope.inProgress = true;

        $http(req).then(function (response) {
            $scope.inProgress = false;
            var resp = response.data[0];
            //alert(JSON.stringify(resp));
            if (resp.status === 'Success' ) {
                $scope.cases = resp.data;
                dataFabric.addItem('cases', $scope.cases);
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };

    $scope.showCase = function(case_id) {
        $location.url('/case/'+case_id);
    };

    $scope.getCurrentCase = function() {
        $scope.currentCase = null;
        if ($scope.cases != null) {
            for (var i = 0; i < $scope.cases.length; i++) {
                if ($scope.cases[i].cdl_number === $routeParams.id) {
                    $scope.currentCase = $scope.cases[i];
                    for (var j = 0; j < $scope.currentCase.citations.length; j++) {
                        $scope.currentCase.citations[j].final_fine_amount
                            = $scope.getFinalAmnt($scope.currentCase.citations[j].final_fine_amount);

                        var stateCaps = "";
                        if ($scope.currentCase.ver_details.ver_report_number !== null) {
                            if ($scope.currentCase.ver_details.ver_issued_state != null) {
                                stateCaps = $scope.currentCase.ver_details.ver_issued_state.toUpperCase();
                            }
                            $scope.currentCase.ver_details.ver_report_number = $scope.currentCase.ver_details.ver_report_number.toUpperCase();

                            if ($scope.currentCase.ver_details.ver_report_number.indexOf(stateCaps) === -1
                                && $scope.currentCase.ver_details.ver_report_number.leading > 0) {
                                $scope.currentCase.ver_details.ver_report_number = stateCaps + $scope.currentCase.ver_details.ver_report_number;
                            }
                        }

                    }
                    return;
                }
            }
        }
    };

    $scope.getFinalAmnt = function(amnt) {
        if (amnt == null) {amnt = "";}
        if (amnt === "Contact Your Attorney") {return amnt;}
        if (amnt === "" && $scope.currentCase.status === "CLOSED") {
            amnt = "Contact Your Attorney";
        } else if (amnt !== "" ) {
            amnt  = "$" + amnt;
        } else {
            amnt = "N/A";
        }
        return amnt;
    };

    $scope.toggleOpenCases = function() {
        if ($scope.show_open_cases) {
            $scope.show_open_cases = false;
            $scope.open_cases_buttion = "Show Open CDL & Roadside Inspection Cases";
        } else {
            $scope.show_open_cases = true;
            $scope.open_cases_buttion = "Hide Open CDL & Roadside Inspection Cases";
        }
    };

    $scope.toggleClosedCases = function() {
        if ($scope.show_closed_cases) {
            $scope.show_closed_cases = false;
            $scope.closed_cases_buttion = "Show Closed CDL & Roadside Inspection Cases";
        } else {
            $scope.show_closed_cases = true;
            $scope.closed_cases_buttion = "Hide Closed CDL &Roadside Inspection Cases";
        }
    };


    $scope.filtOpen = function(item) {
        if (item.status !== "Void" && item.status !== "Closed") {
            return true;
        }
        return false;
    };

    $scope.currentCases = $scope.getCurrentCase();

    $scope.autoLoadCases = function() {
        if ($routeParams.id == null) {
            $scope.getCases();
        }
    }();


});
