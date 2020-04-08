uslApp.controller('mainCtrl', function mainCtrl($scope, $http, $window, $location,  permission) {

    $http.get('js/data/states.json').then(function(response) {
        $scope.stateList = response.data;
    });


    $http.get('js/data/counties.json').then(function(response) {
        $scope.countyList = response.data;
    });

    $scope.hasPermission = function(perm) {
        return permission.hasPermission(perm);
    };


    $scope.openUrl = function (URL) {
        window.open(URL, '_system', 'location=no');
    };

    $scope.openWebsite = function () {
        $scope.openUrl("http://www.uslegalservices.net");
    };

    $scope.scrollTo = function(elem) {
        $window.scrollTo(0, angular.element(document.getElementById(elem)).offsetTop);
    };

    $scope.isDemo = function () {
        return permission.isDemo;
    };

    $scope.isBrowser = function () {
        return app.isBrowser;
    };

    $scope.phoneFormat = function (input) {
        if (input == null) {
            input = "";
        }
        input = input.replace(/\D/g,'');
        input = input.substring(0,10);
        if (input.length === 0) {
            return input;
        }
        if(input.length < 4){
            input = '('+input;
        }else if(input.length < 7){
            input = '('+input.substring(0,3)+')'+input.substring(3,6);
        }else{
            input = '('+input.substring(0,3)+')'+input.substring(3,6)+'-'+input.substring(6,10);
        }
        return input;
    }

    $scope.dateStringToDate = function (inputStr) {
        inputStr = inputStr.replaceAll("/", "-")
        var from = inputStr.split("-");
        //console.log(from[2] + " - " + from[0] + " - " + from[1]);
        var f = new Date(from[2], from[0] - 1, from[1]);
        return f;
    };

    $scope.dateTimeToDate = function (date, time) {
        //format mm/dd/yyyy hh:mm a
        date = date.replaceAll("/", "-");
        var from = date.split("-");
        time = time.replaceAll(" ", ":");
        var t = time.split(":");

        if (time[2] === 'pm') {
            if (time[0] !== 12) {
                time[0] = 12 + time[0];
            }
        }

        //console.log(time);
        //console.log("date time " + from[2] + " - " + from[0] + " - " + from[1] + " : " + t[0] + ":" + t[1] );
        var f = new Date(from[2], from[0] - 1, from[1]);
        if (time.length > 0 && t[0] !== null && t[1] !== null) {
            f.setHours(t[0]);
            f.setMinutes(t[1]);
        }
        return f;
    };

    $scope.getSupportPhoneNumber = function () {
        var member = permission.getMember();
        if (member != null && member.support_phone != null && member.support_phone !== "" ) {
            return member.support_phone;
        }
        return "+1-800-356-5297";
    }

    $scope.getSupportPhoneNumberStr = function () {
        var member = permission.getMember();
        if (member != null && member.support_phone != null && member.support_phone !== "" ) {
            var phoneStr = member.support_phone.replaceAll("-", ".");
            phoneStr = phoneStr.replaceAll("+", "");
            phoneStr = phoneStr.replaceAll("(", "");
            phoneStr = phoneStr.replaceAll(")", ".");
            phoneStr = phoneStr.replaceAll(" ", "");
            return phoneStr;
        }
        return "1.800.356.LAWS";
    }

});
