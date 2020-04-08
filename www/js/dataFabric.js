uslApp.service('dataFabric', function () {
    this.vals = [];
    this.msg = null;
    this.errMsg = false;

    this.setMsg = function(msg) {
        this.msg = msg;
    };

    this.readMsg = function () {
        var m = this.msg;
        this.msg = null;
        return m;
    };

    this.setErrMsg = function(msg) {
        this.errMsg = msg;
    };

    this.readErrMsg = function () {
        var m = this.errMsg;
        this.errMsg = null;
        return m;
    };

    this.addItem = function(key, val) {
        this.vals[key] = val;
    };

    this.getItem = function(key) {
        return this.vals[key];
    };

    this.removeItem = function(key) {
        this.vals[key] = null;
    };

});