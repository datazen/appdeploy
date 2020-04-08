uslApp.service('throbber', function () {
    this.inProgress = false;
    this.throbber = null;

    this.start = function() {
       this.inProgress = true;
       this.throbber = jQuery('<img>');
       this.throbber.attr('src', 'img/throbber.gif');
       this.throbber.css({"position": "fixed", "top": "50%", "left": "50%", "transform": "translate(-50%, -50%)"})
       jQuery('body').append(this.throbber);
       window.setTimeout(this.stop, 5000);
    };

    this.stop = function() {
        this.inProgress = false;
        this.throbber.remove();
    }
});