uslApp.controller('planDocsCtrl', function planDocsCtrl($scope, $location, $http, permission, dataFabric, $routeParams) {
    $scope.errorMsg = dataFabric.readErrMsg();
    $scope.msg = dataFabric.readMsg();
    $scope.inProgress = false;

    $scope.planDocs = {};

    $scope.getPlanDocs = function () {
        $scope.inProgress = true;
        var req = {
            method: 'POST',
            data: {
                plan_code: $routeParams.plan_code,
                state: $routeParams.state
            },
            url: app.getAPIEndPoint()+'/api/v1/get_policy_pdf.php',
            headers: {
                'Authorization': permission.jwt,
            }
        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            var resp = response.data;
            if (resp.status === 'Success') {
                $scope.planDocs = resp.data[0];
                if ($scope.planDocs == null) {
                    $scope.planDocs = {};
                }
                for (var i = 0; i < permission.member.member_plan.length; i++) {
                    if (permission.member.member_plan[i].planCode === $routeParams.plan_code) {
                        $scope.planDocs.plan = permission.member.member_plan[i];
                    }
                }
            } else {
                $scope.errorMsg = resp.message;
            }
        });
    }();

    $scope.openPDF = function (fileURL) {
        if (permission.isDemo) {
            navigator.notification.alert("Cannot download any plan documents in demo mode!", function () {}, "U.S. Legal Services");
        } else {
            window.open(fileURL, '_system', 'location=no');
        }
    };

});
