var app = {

    debug: true,
    isBrowser: true,
    storage: null,
    //API url source
    getAPIEndPoint: function () {
        if (app.debug) {
            return "http://108.166.9.91"
        } else {
            return "https://api.uslegalservices.net";
        }
    },
    // Application Constructor
    initialize: function () {
        angular.bootstrap(document, ['uslApp']);
        app.storage = window.localStorage
    },

    setDatepickers: function() {
        jQuery('.datepicker').datepicker();
    },

    setTimepicker: function() {
        jQuery('.timepicker').timepicker({
            timeFormat: 'h:mm p',
            interval: 30,
            minTime: '8',
            maxTime: '6:00pm',
            defaultTime: '11',
            startTime: '8:00',
            dynamic: false,
            dropdown: true,
            scrollbar: true
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

// Platform: browser
window.navigator.notification = window.navigator.notification || {};

window.navigator.notification.alert = function(message, callback, title) {
    // `notification.alert` executes asynchronously
    setTimeout(function() {
        var $d = jQuery('#dialog');
        if ($d === null || $d.length === 0) {
            jQuery('body').append("<div id='dialog'></div>");
            $d = jQuery('#dialog');
        }
        $d.html("<div class='dbody'><div class='dtitle'><span>" + title + "</span><span id='close'>&times;</span></div>" +
            "<div class='dmsg'><p>" + message + "</p></div></div>");
        $d.css("display", "block");

        jQuery('#close').click(function () {
            $d.css("display", "none");
        });
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target === $d.get(0)) {
                $d.css("display", "none");
            }
        };


        if (callback) {
            callback();
        }
    }, 0);
};

window.navigator.notification.confirm = function(message, callback, title, buttonLabels) {
    // `notification.alert` executes asynchronously
    setTimeout(function() {
        var $d = jQuery('#dialog');
        if ($d === null || $d.length === 0) {
            jQuery('body').append("<div id='dialog'></div>");
            $d = jQuery('#dialog');
        }
        var html = "<div class='dbody'><div class='dtitle'><span>" + title + "</span></div>" +
            "<div class='dmsg'><p>" + message + "</p></div><div>";
        var bLabels = buttonLabels.split(',');

        for (var i = bLabels.length - 1; i >= 0; i--) {
            var btnID = "btn" + i;
            html = html + '<a href="javascript:;" id="' + btnID + '"><div class="dbtn">'+bLabels[bLabels.length - 1 - i]+'</div></a>';
        }

        html = html + "</div></div>";

        $d.html(html);
        $d.css("display", "block");

        for (i = bLabels.length - 1; i >= 0; i--) {
            btnID = "#btn" + i;
            jQuery(btnID).click({b: i}, function (event) {
                callback(event.data.b);
                $d.css("display", "none");
            });
        }

    }, 0);
};
