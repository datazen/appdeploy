/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // note: when enabling debug, if need to run on actual device, add this to config.xml: <access origin="http://108.166.9.91" />
    debug: false,
    isBrowser: false,
    storage: null,
    //API url source
    getAPIEndPoint: function () {
        if (app.debug) {
            return "http://ec2-18-232-76-10.compute-1.amazonaws.com"
        } else {
            return "https://api.uslegalservices.net";
        }
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        StatusBar.overlaysWebView(false);
        document.addEventListener("backbutton", function (e) {
            if (jQuery('nav').hasClass("clicked")) {
                jQuery('nav').removeClass("clicked");
                jQuery('#menuTrigger').removeClass("clicked");
                e.preventDefault();
            } else {
                history.back();
            }
        }, false );
        angular.bootstrap(document, ['uslApp']);
        app.storage = window.localStorage;

        $('.phone-number').bind('click', function(e) {
            e.preventDefault();
            var phoneLink = $(e.currentTarget).attr('href');
            window.open(phoneLink, '_system', 'location=yes');
        });
        app.setupPush();
    },

    setupPush: function() {
        //console.log('calling push init');
        var push = PushNotification.init({
            android: {},
            browser: {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },
            ios: {
                alert: "true",
                badge: true,
                sound: 'false'
            },
            windows: {}
        });
        //console.log('after init');

        push.on('registration', function(data) {
            //console.log('registration event: ' + data.registrationId);

            var oldRegId = app.storage.getItem('registrationId');
            app.storage.setItem('registrationId', data.registrationId);
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                app.storage.setItem('updNotifReg', "true");
                console.log("Need to Update Push Notification ID");
                // Post registrationId to your app server as the value has changed
            } else {
                app.storage.setItem('updNotifReg', "false");
                console.log("Same Push Notification ID");
            }
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            //console.log('notification event');
            navigator.notification.alert(
                data.message,         // message
                null,                 // callback
                data.title,           // title
                'Ok'                  // buttonName
            );
        });
    }



};


function dateStrToMDY(dateStr) {
    if (dateStr != null) {
        var dt = new Date(dateStr);
        return (dt.getUTCMonth() + 1) + "/" + dt.getUTCDate() + "/" + dt.getUTCFullYear();
    }
    return "--";
}