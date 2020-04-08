var uslApp = angular.module('uslApp', ["ngRoute", "ngAnimate"]);

uslApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "templates/main.html",
            controller: 'memberCtrl'
        })
        .when("/register", {
            templateUrl : "templates/register.html",
            controller: 'memberCtrl'
        })
        .when("/setpass", {
            templateUrl : "templates/setpass.html",
            controller: 'memberCtrl'
        })
        .when("/submit_citation", {
            templateUrl : "templates/submit_citation.html",
            controller: 'citationCtrl'
        })
        .when("/case/:id/case_files", {
            templateUrl : "templates/case_files.html",
            controller: 'docUploadCtrl'
        })
        .when("/case/:id/case_files_upload/:upload_type", {
            templateUrl : "templates/case_files_upload.html",
            controller: 'docUploadCtrl'
        })
        .when("/cases", {
            templateUrl : "templates/cases.html",
            controller: 'casesCtrl'
        })
        .when("/case/:id", {
            templateUrl : "templates/case.html",
            controller: 'casesCtrl'
        })
        .when("/matter_cases", {
            templateUrl : "templates/matter_cases.html",
            controller: 'matterCasesCtrl'
        })
        .when("/new_matter_case", {
            templateUrl : "templates/new_matter_case.html",
            controller: 'matterCasesCreateCtrl'
        })
        .when("/matter_case/:id", {
            templateUrl : "templates/matter_case.html",
            controller: 'matterCasesCtrl'
        })
        .when("/attorney_search", {
            templateUrl : "templates/attorney_search.html",
            controller: 'attorneyCtrl'
        })
        .when("/plan_docs/:plan_code/:state", {
            templateUrl : "templates/plan_docs.html",
            controller: 'planDocsCtrl'
        })
        .when("/account_info", {
            templateUrl : "templates/account_info.html",
            controller: 'memberCtrl'
        })
        .when("/membership_card", {
            templateUrl : "templates/membership_card.html",
            controller: 'memberCtrl'
        })
        .when("/account_update", {
            templateUrl : "templates/account_update.html",
            controller: 'memberCtrl'
        })
        .when("/account_add_dependent", {
            templateUrl : "templates/account_add_dependent.html",
            controller: 'memberCtrl'
        })
        .when("/login", {
            templateUrl : "templates/login.html",
            controller: 'memberCtrl'
        })
        .when("/pass_reset_step1", {
            templateUrl : "templates/pass_reset_step1.html",
            controller: 'memberCtrl'
        })
        .when("/pass_reset_step2", {
            templateUrl : "templates/pass_reset_step2.html",
            controller: 'memberCtrl'
        })
        .when("/pass_reset_step3", {
            templateUrl : "templates/pass_reset_step3.html",
            controller: 'memberCtrl'
        })
        .otherwise('/');
}).run( function($rootScope, $location, permission, dataFabric) {

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {

        if (!permission.isDemo && !permission.isLoggedIn
            && $location.path() !== '/pass_reset_step1'
            && $location.path() !== '/pass_reset_step2'
            && $location.path() !== '/pass_reset_step3'
            && $location.path() !== '/register'
            && $location.path() !== '/setpass') {

            if ( next.templateUrl === "templates/login.html" ) {
                // already going to #login, no redirect needed
            } else {
                // not going to #login, we should redirect now
                $location.path( "/login" );
            }
        }

        if ($location.path() === 'templates/case_files.html') {
            event.preventDefault();
        }

        if (permission.isLoggedIn) {
            if ( next.templateUrl === "templates/login.html" ) {
                $location.path( "/" );
            }
        }
        window.scrollTo(0,0);
    });
});


uslApp.directive('uslPassMatch', function() {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attr, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            scope.$watch(attr.ngModel, function() {
                validate();
            });

            attr.$observe('uslPassValid', function(val) {
                validate();
            });

            var validate = function() {
                // values
                var val1 = ngModel.$viewValue;
                var val2 = attr.uslPassValid;

                // set validity
                ngModel.$setValidity('uslPassValid', val1 === val2);
            };
        }
    };
});


String.prototype.replaceAll = function(search, replace)
{
    //if replace is not sent, return original string otherwise it will
    //replace search string with 'undefined'.
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};


