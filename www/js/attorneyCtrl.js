uslApp.controller('attorneyCtrl', function attorneyCtrl($scope, $http, $location, permission, dataFabric, throbber) {
    $scope.errorMsg = dataFabric.readErrMsg();
    $scope.msg = dataFabric.readMsg();
    $scope.inProgress = false;
    $scope.searchedAtLeastOnce = false;

    $scope.zipSearch = false;
    $scope.countySearch = false;

    $scope.attorneys = {};
    $scope.search = {};

    $http.get('js/data/coverage.json').then(function(response) {
        $scope.coverageItems = response.data;
    });

    /*$scope.show_state_county_search = false;
    $scope.show_zip_search = false;*/

    $scope.search = function () {
        $scope.inProgress = true;
        throbber.start();
        var searchData = {
            state: $scope.search.state,
            county: $scope.search.county,
            zip: $scope.search.zip,
            distance: $scope.search.radius,
            coverage: $scope.search.coverage
        };

        var req = null;

        if (permission.isDemo) {
            req = {
                method: 'GET',
                url: 'js/data/demo/attorney_search.json'
            };
        } else {
            req = {
                method: 'POST',
                url: app.getAPIEndPoint()+'/api/v1/attorney_search.php',
                data: searchData,
                headers: {
                    'Authorization': permission.jwt
                }
            };
        }

        $http(req).then(function (response) {
            $scope.inProgress = false;
            $scope.searchedAtLeastOnce = true;
            throbber.stop();
            var resp = response.data[0];
            //alert(JSON.stringify(resp));
            if (resp.status === 'Success' ) {
                $scope.attorneys = resp.data;
                dataFabric.addItem('cases', $scope.cases);
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    };

    $scope.selectState = function (state) {
        $scope.stateCounties = $scope.countyList[state];
    }

    $scope.showZipSearch = function () {
        $scope.zipSearch = true;
        $scope.countySearch = false;
        $scope.clearSearch();
    };

    $scope.showCountySearch = function () {
        $scope.zipSearch = false;
        $scope.countySearch = true;
        $scope.clearSearch();
    };

    $scope.clearSearch = function () {
        $scope.search.zip = null;
        $scope.search.state = null;
        $scope.search.county = null;
        $scope.search.radius = null;
    }

});
