angular.module('app')

.component('adminAccessRoles', {
    templateUrl: 'app/pages/admin/admin-sections/admin-access/admin-access-roles.tpl.html',
    controller: function (accessShared, dropdownLists, adminApi, peopleApi, userApi, adminUsersApi, globalState) {
        
        var $ctrl = this;
        
        $ctrl.userRoles = accessShared.userRoles;
        $ctrl.spUser = null;
        $ctrl.isLoading = globalState.isLoading;
        $ctrl.errors = accessShared.errors() ? accessShared.errors() : [];
        $ctrl.RoleList = dropdownLists.getOptions('SecurityRole');

        $ctrl.newRole = {
            "UserID": null,
            "SecurityRole": null
        }; 

        $ctrl.peopleSearch = function peopleSearch(term) {
            return peopleApi.search(term);
        };

        $ctrl.getSpUser = function() {
            return $ctrl.spUser ? $ctrl.spUser : null;
        };

        $ctrl.onSpUserSelect = function (person) {

            if(person!==null){
                userApi.getUserByAccount(person.spId).then(function(user) {
                    $ctrl.spUser = user;
                    $ctrl.newRole.UserID = user.id
                }, function (errs) {
                    $ctrl.errors = errs;
                });
            } else {
                $ctrl.spUser = null;
            }

        };

        $ctrl.removeRole = function (userId, userRoleId) {

            $ctrl.isLoading(true);

            adminUsersApi.removeUser(userId, userRoleId).then(function (results) {              
                // refresh role list
                adminUsersApi.getAllUserRoles().then(function (roles) {
                    accessShared.userRoles(roles);
                    $ctrl.isLoading(false);
                }, function(err){
                    $ctrl.errors = err;
                }).finally(function () {
                    $ctrl.isLoading(false);
                });
            }, function (errs) {
                $ctrl.isLoading(false);
                $ctrl.errors = errs;
            });

        };

        $ctrl.addRole = function () {
            $ctrl.isLoading(true);
            $ctrl.newRole.SecurityRole = $ctrl.Role.id
                        
            adminUsersApi.createUser($ctrl.newRole).then(function (results) {
                // refresh approvers list
                adminUsersApi.getAllUserRoles().then(function (roles) {
                    accessShared.userRoles(roles);
                }, function(err){
                    $ctrl.errors = err;
                }).finally(function () {
                    $ctrl.isLoading(false);
                });
                resetRole();
                $ctrl.spUser = {};
                $ctrl.Role = null;
                // $ctrl.newRole = null;
            }, function (errs) {
                $ctrl.isLoading(false);
                $ctrl.errors = errs;
            });
        }

        function resetRole() {
            $ctrl.newRole.UserID = false;
            $ctrl.newRole.SecurityRole = false;
        }

    }
});