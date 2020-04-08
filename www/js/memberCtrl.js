uslApp.controller('memberCtrl', function memberCtrl($scope, $location, $http, $interval, permission, dataFabric, throbber) {
    $scope.errorMsg = dataFabric.readErrMsg();
    $scope.msg = dataFabric.readMsg();
    $scope.member = permission.member;
    $scope.remember_username = false;

    $scope.inProgress = false;
    $scope.new_dependent = {};
    $scope.timeoutStop = null;

    $scope.login = function () {
        $scope.inProgress = true;
        $scope.errorMsg = '';
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/member_login.php',
            data: {username: $scope.member.username, password: $scope.member.password}
        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            var resp = response.data;
            if (resp.status === 'Active') {
                permission.jwt = resp.token;
                permission.isLoggedIn = true;
                //register device for notifications
                if (app.storage.getItem("updNotifReg") === "true" || $scope.member.username !== app.storage.getItem("uname") ) {
                    if (!$scope.isBrowser()) {
                        $scope.updatePushRegistration();
                    }
                }
                app.storage.setItem("uname", $scope.member.username);
                app.storage.setItem("remember_uname", $scope.remember_username);
                var login_time = new Date().getTime();
                dataFabric.addItem("last_active_time", login_time);
                //get member data
                $scope.getMemberInfo();
                if ($scope.timeoutStop != null) {
                    $interval.cancel($scope.timeoutStop);
                }
                $scope.timeoutStop = $interval(function () {
                    var warningShown = false;
                    var tnow = new Date().getTime();
                    var tm = dataFabric.getItem("last_active_time") + 1000 * 25 * 60;
                    if (dataFabric.getItem("session_exp_time") <= tnow && dataFabric.getItem("session_exp_time") > 0) {
                        $interval.cancel($scope.timeoutStop);
                        dataFabric.addItem("session_exp_time", 0);
                        permission.logout();
                        $location.url('/login');
                    }

                    if (tm <= tnow && permission.isLoggedIn && !warningShown) {
                        var exp_time = new Date(tnow + 5 * 60 * 1000);
                        dataFabric.addItem('session_exp_time', exp_time);
                        warningShown = true; // so that we do not repeat the warning
                        navigator.notification.confirm("Your session will expire at " + $scope.formatTimeAMPM(exp_time) +". Do you wish to continue using the app?",
                            function (button) {
                                if (button == 1) {
                                    warningShown = false;
                                    dataFabric.addItem('last_active_time', tnow);
                                    dataFabric.addItem("session_exp_time", 0);
                                } else {
                                    $interval.cancel($scope.timeoutStop);
                                    permission.logout();
                                    $location.url('/login');
                                }
                            },
                            "U.S. Legal Services",
                            "Yes,No");
                    }
                }, 1000*60);
            } else {
                $scope.errorMsg = resp.message;
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to login. Please try again or contact U.S. Legal services if the error persists";
        });
    };

    $scope.demoLogin = function () {
        permission.isLoggedIn = true;
        permission.isDemo = true;
        $scope.getMemberInfo();

        var login_time = new Date().getTime();
        dataFabric.addItem("last_active_time", login_time);
        //get member data
        if ($scope.timeoutStop != null) {
            $interval.cancel($scope.timeoutStop);
        }
        var warningShown = false;
        $scope.timeoutStop = $interval(function () {
            var tnow = new Date().getTime();
            var tm = dataFabric.getItem("last_active_time") + 1000 * 25 * 60;
            if (dataFabric.getItem("session_exp_time") <= tnow && dataFabric.getItem("session_exp_time") > 0) {
                $interval.cancel($scope.timeoutStop);
                permission.logout();
                $location.url('/login');
                dataFabric.addItem("session_exp_time", 0);
            }
            console.log(warningShown);
            if (tm <= tnow && permission.isLoggedIn && !warningShown) {
                var exp_time = new Date(tnow + 5 * 60 * 1000);
                dataFabric.addItem('session_exp_time', exp_time);
                warningShown = true; // so that we do not repeat the warning
                navigator.notification.confirm("Your session will expire at " + $scope.formatTimeAMPM(exp_time) +". Do you wish to continue using the app?",
                    function (button) {
                        if (button == 1) {
                            warningShown = false;
                            dataFabric.addItem('last_active_time', tnow);
                            dataFabric.addItem("session_exp_time", 0);
                        } else {
                            $interval.cancel($scope.timeoutStop);
                            permission.logout();
                            $location.url('/login');
                        }
                    },
                    "U.S. Legal Services",
                    "Yes,No");
            }
        }, 1000*60);

    };

    $scope.formatTimeAMPM = function(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    $scope.updatePushRegistration = function() {
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/member_device_update.php',
            headers: {
                'Authorization': permission.jwt,
            },
            data: {devices: app.storage.getItem('registrationId')}
        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            var resp = response.data[0];
            if (resp.status === 'Success') {
                // do nothing

            } else {
                app.storage.removeItem('registrationId')
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to login. Please try again or contact U.S. Legal services if the error persists";
        });
    };

    $scope.getMemberInfo = function () {
        $scope.inProgress = true;
        var req = null;
        if (permission.isDemo) {
            req = {
                method: 'GET',
                url: 'js/data/demo/john_doe.json'
            };
        } else {
            req = {
                method: 'GET',
                url: app.getAPIEndPoint()+'/api/v1/member_info.php',
                headers: {
                    'Authorization': permission.jwt,
                }
            };
        }
        $http(req).then(function (response) {
            $scope.inProgress = false;
            var resp = response.data;
            //alert(JSON.stringify(resp.data));
            if (resp.status === 'Success') {
                $scope.member = resp.data;
                $scope.member.effective_date = dateStrToMDY($scope.member.effective_date);
                if (!permission.isDemo) {
                    var jwtparts = permission.jwt.split('.');
                    $scope.member.member_id = JSON.parse(atob(jwtparts[1])).member_id;
                }

                var preq = {
                    method: 'GET',
                    url: 'js/permissions/active.permissions.json'
                };
                $http(preq).then(function (perm) {
                    //console.log(perm.data);
                    permission.setMember($scope.member, perm.data);
                    //console.log($scope.member);
                    $location.url('/');
                });

            } else {
                $scope.errorMsg = resp.message;
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to retrieve data. Please try again or contact U.S. Legal services if the error persists";
        });
    };

    $scope.registerMember = function () {
        $scope.inProgress = true;
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/member_registration.php',
            data: {
                number: $scope.member.number,
                first_name: $scope.member.first_name,
                last_name: $scope.member.last_name,
                zip:  $scope.member.zip,
                employee_id:  $scope.member.employee_id
            }
        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            var resp = response.data;
            if (resp.status === 'Active' && resp.already_registered === 'No' ) {
                permission.jwt = resp.token;
                $location.url('/setpass');
            } else {
                $scope.errorMsg = resp.message;
                $scope.hasLoginError = true;
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to register. Please try again or contact U.S. Legal services if the error persists";
        });
    };

    $scope.addDependent = function () {
        if ($scope.new_dependent.last_name === null
            || $scope.new_dependent.last_name === undefined
            || $scope.new_dependent.last_name === "") {
            $scope.new_dependent.last_name = $scope.member.last_name;
        }
        if (permission.isDemo) {
            $scope.pushDependent();
        } else {
            $scope.inProgress = true;
            throbber.start();
            var req = {
                method: 'POST',
                url: app.getAPIEndPoint()+'/api/v1/dependent_creation.php',
                data: {
                    first_name: $scope.new_dependent.first_name,
                    last_name: $scope.new_dependent.last_name,
                    type: $scope.new_dependent.type,
                },
                headers: {
                    'Authorization': permission.jwt
                }
            };
            $http(req).then(function (response) {
                $scope.inProgress = false;
                throbber.stop();
                var resp = response.data[0];
                if (resp.status === 'Success') {
                    $scope.pushDependent();
                } else {
                    $scope.errorMsg = resp.message;
                }
            }).catch(function() {
                // handle errors
                $scope.inProgress = false;
                $scope.errorMsg = "An error occurred trying to add dependent. Please try again or contact U.S. Legal services if the error persists";
            });
        }
    };

    $scope.pushDependent = function () {
        $scope.member.dependents.push($scope.new_dependent);
        navigator.notification.alert("Dependent information has been added", function () {}, "U.S. Legal Services");
        $location.url('/account_info');
    }


    $scope.updateContactInfo = function () {

        if (permission.isDemo) {
            $scope.updateSuccess();
        } else {

            $scope.inProgress = true;
            throbber.start();
            var req = {
                method: 'POST',
                url: app.getAPIEndPoint()+'/api/v1/update_member_info.php',
                data: {
                    telephone_number: $scope.member.phone,
                    address1: $scope.member.address1,
                    state: $scope.member.state,
                    zip: $scope.member.zip,
                    city: $scope.member.city,
                    county: $scope.member.county
                },
                headers: {
                    'Authorization': permission.jwt,
                }
            };
            $http(req).then(function (response) {
                $scope.inProgress = false;
                throbber.stop();
                var resp = response.data[0];
                if (resp.status === 'Success') {
                    $scope.updateSuccess();
                } else {
                    $scope.errorMsg = resp.message;
                }
            }).catch(function() {
                // handle errors
                $scope.inProgress = false;
                $scope.errorMsg = "An error occurred trying to update your profile. Please try again or contact U.S. Legal services if the error persists";
            });
        }
    };

    $scope.updateSuccess = function () {
        permission.member = $scope.member;
        navigator.notification.alert("Your account information has been updated", function () {
        }, "U.S. Legal Services");
        $location.url('/account_info');
    };

    $scope.initialSetup = function () {
        $scope.inProgress = true;
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/password_setup.php',
            data: {
                password: $scope.member.password,
                username: $scope.member.username,
                security_question: $scope.member.security_question,
                security_answer:  $scope.member.security_answer
            },
            headers: {
                'Authorization': permission.jwt
            }
        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            var resp = response.data;
            if (resp.status === 'Success') {
                navigator.notification.alert(resp.message, function () {}, "U.S. Legal Services");
                $location.url('/login');
            } else {
                $scope.errorMsg = resp.message;
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to set the password. Please try again or contact U.S. Legal services if the error persists";
        });
    };

    $scope.passwordResetStep1 = function () {
        $scope.inProgress = true;
        throbber.start();
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/get_secret_question.php',
            data: {
                username: $scope.member.username
            }

        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            throbber.stop();
            var resp = response.data;
            if (resp.status === 'Active') {
                dataFabric.addItem('sec_question', resp.secret_question);
                permission.jwt = resp.token;
                $location.url('/pass_reset_step2');
            } else {
                $scope.errorMsg = resp.message;
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to set the password. Please try again or contact U.S. Legal services if the error persists";
        });
    };

    $scope.getSecurityQuestion = function() {
        return dataFabric.getItem('sec_question');
    };

    $scope.passwordResetStep2 = function () {
        $scope.inProgress = true;
        throbber.start();
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/validate_secret_answer.php',
            data: {
                security_answer: $scope.member.security_answer
            },
            headers: {
                'Authorization': permission.jwt
            }

        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            throbber.stop();
            var resp = response.data;
            if (resp.status === 'Success') {
                dataFabric.removeItem('sec_question');
                permission.jwt = resp.token;
                $location.url('/pass_reset_step3');
            } else {
                $scope.errorMsg = resp.message;
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to check security answer. Please try again or contact U.S. Legal services if the error persists";
        });
    };

    $scope.passwordResetStep3 = function () {
        $scope.inProgress = true;
        throbber.start();
        var req = {
            method: 'POST',
            url: app.getAPIEndPoint()+'/api/v1/password_reset.php',
            data: {
                password: $scope.member.password
            },
            headers: {
                'Authorization': permission.jwt
            }

        };
        $http(req).then(function (response) {
            $scope.inProgress = false;
            throbber.stop();
            var resp = response.data;
            if (resp.status === 'Success') {
                navigator.notification.alert("Your password has been reset. You can use it to login now.", function () {}, "U.S. Legal Services");
                permission.jwt = null;
                $location.url('/login');
            } else {
                $scope.errorMsg = resp.message;
            }
        }).catch(function() {
            // handle errors
            $scope.inProgress = false;
            $scope.errorMsg = "An error occurred trying to set password. Please try again or contact U.S. Legal services if the error persists";
        });
    };


    $scope.getEffectiveDate = function() {
        if ($scope.member != null) {
            return dateStrToMDY($scope.member.effective_date);
        }
        return "N/A"
    };

    $scope.isPasswordUpper = function () {
        if ($scope.member == null) {
            return false;
        }
        if ($scope.member.password == null) {
            return false;
        }
        return (/[A-Z]/.test($scope.member.password));
    };

    $scope.isPasswordDigit = function () {
        if ($scope.member == null) {
            return false;
        }
        if ($scope.member.password == null) {
            return false;
        }
        return (/[0-9]/.test($scope.member.password));
    };

    $scope.isPasswordSpecial = function () {
        if ($scope.member == null) {
            return false;
        }
        if ($scope.member.password == null) {
            return false;
        }
        return (/[@#/!$%&]/.test($scope.member.password));
    };

    $scope.formatMemberPhone = function () {
        $scope.member.phone = $scope.phoneFormat($scope.member.phone);
        var $e = $('#memberphone')[0];
        setTimeout(function(){ $e.selectionStart = $e.selectionEnd = 10000; }, 0);
    };


    $scope.checkAccessPermission = function () {

        if ($location.path() === '/pass_reset_step2' && (dataFabric.getItem('sec_question') == null || permission.jwt == null)) {
            $location.url('/login');
        }

        $scope.remember_username = (app.storage.getItem('remember_uname') === "true");
        if ($scope.remember_username) {
            var uname = app.storage.getItem("uname");
            if (uname && $scope.member == null) {
                $scope.member = {};
                $scope.member.username = uname;
            }
        }
    }();


});
