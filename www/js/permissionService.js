uslApp.service('permission', function () {
    this.jwt = null;
    this.isLoggedIn = false;
    this.isDemo = false;
    this.member = null;
    this.ActivePermissions = {};


    this.hasPermission = function(action) {
        if (this.member != null && this.member.status === 'Active') {
            return this.ActivePermissions[action];
        }
        return false;
    };

    this.logout = function() {
        this.member = null;
        this.jwt = null;
        this.isLoggedIn = false;
        this.isDemo = false;
        this.ActivePermissions = {};
    };

    this.setMember = function (mem, permissions) {
        this.ActivePermissions = permissions;
        this.member = mem;
        for (var i = 0; i < mem.member_plan.length; i++) {
            if (mem.member_plan[i].planType === "CDL") {
                this.ActivePermissions.submit_citation = true;
                this.ActivePermissions.view_cdl_cases = true;
            }
        }
        if (mem.Policy_holder === "Yes") {
            this.ActivePermissions.add_dependents = true;
        } else {
            this.ActivePermissions.add_dependents = false;
        }
    };

    this.getMember = function () {
        return this.member;
    }
});