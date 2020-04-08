uslApp.controller('menuCtrl', function menuCtrl($scope, $window, $location, permission) {

    $scope.menuActive = "";

    $scope.go_back = function() {
        $window.history.back();
    };

    $scope.menuTrigger = function() {
        if (!jQuery('nav').hasClass("clicked")) {
            jQuery('nav').addClass("clicked");
            jQuery('#menuTrigger').addClass("clicked");
        } else {
            jQuery('nav').removeClass("clicked");
            jQuery('#menuTrigger').removeClass("clicked");
        }
    };

    $scope.logout = function () {
        permission.logout();
        $scope.menuTrigger();
        navigator.notification.alert("You have successfully logged out.", function () {
            $location.url('/');
        }, "U.S. Legal Services");
    };


    $scope.isLoggedIn = function() {
        return permission.isLoggedIn;
    }

});