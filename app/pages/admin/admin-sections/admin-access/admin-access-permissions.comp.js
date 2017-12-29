angular.module('app')

.component('adminAccessPermissions', {
    templateUrl: 'app/pages/admin/admin-sections/admin-access/admin-access-permissions.tpl.html',
    controller: function (accessShared, dropdownLists, adminApi, peopleApi, userApi, adminUsersApi, globalState) {

        var $ctrl = this;
        
        $ctrl.userPermissions = accessShared.userPermissions;
        $ctrl.spUser = null;
        $ctrl.isLoading = globalState.isLoading;
        $ctrl.errors = accessShared.errors() ? accessShared.errors() : [];
        $ctrl.LOBList = dropdownLists.getOptions('LOB');

        $ctrl.newPermission = {
            "UserID": null,
            "LOB": null
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
                    $ctrl.newPermission.UserID = user.id
                }, function (errs) {
                    $ctrl.errors = errs;
                });
            } else {
                $ctrl.spUser = null;
            }

        };

        $ctrl.removePermission = function (userId, userPermissionId) {

            $ctrl.isLoading(true);

            adminUsersApi.removePermission(userId, userPermissionId).then(function (results) {    
                // refresh permission list
                adminUsersApi.getAllUserPermissions().then(function (permissions) {
                    accessShared.userPermissions(permissions);
                    $ctrl.errors = [];
                }, function(err){
                    $ctrl.errors = err;
                }).finally(function () {
                    $ctrl.isLoading(false);
                });
            }, function (errs) {
                $ctrl.errors = errs;
            });

        }

        $ctrl.addPermission = function () {
            $ctrl.isLoading(true);
            $ctrl.newPermission.LOB = $ctrl.LOB.id;
                        
            adminUsersApi.createPermission($ctrl.newPermission).then(function (results) {
                // refresh permission list
                adminUsersApi.getAllUserPermissions().then(function (permissions) {
                    accessShared.userPermissions(permissions);
                    $ctrl.errors = [];
                    $ctrl.isLoading(false);
                }, function(err){
                    $ctrl.errors = err
                }).finally(function (){
                    $ctrl.isLoading(false);
                });
                resetPermission();
                $ctrl.spUser = {};
                $ctrl.LOB = null;
                //$ctrl.newPermission = null;
            }, function (errs) {
                $ctrl.errors = errs;
                $ctrl.isLoading(false);
            });
        }

        function resetPermission() {
            $ctrl.newPermission.UserID = false;
            $ctrl.newPermission.LOB = false;
        }

    }
});