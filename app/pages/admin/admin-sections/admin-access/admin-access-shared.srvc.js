angular.module('app').factory('accessShared', function($q, util, adminApi, dropdownLists) {
    
    var _scope = {};

    return {
        approvers: util.createGetterSetter(_scope, 'approvers'),
        userRoles: util.createGetterSetter(_scope, 'userRoles'),
        userPermissions: util.createGetterSetter(_scope, 'userPermissions'),
        isLoading: util.createGetterSetter(_scope, 'isLoading'),
        errors: util.createGetterSetter(_scope, 'errors'),

        getAllAprovers: function () {
            
            return $q(function (resolve, reject){
                
                adminApi.getAproverNames({}).then(function (approvers) {
                   
                    // filter out duplicate approvers who belong too sublob when only lob selected
                    approvers = approvers.filter(function (approver) {
                        return approver.SubLob === null
                    });
                   
                    // before assigning need to convert approver Lob & SubLob properties --> full Obj's
                    approvers.forEach(function (approver, index){
                        var newLobObj = dropdownLists.getOptions('LOB').filter(function (lobObj){
                            
                            if(approver.Lob === lobObj.id && approver.SubLob === null){
                                // TODO: break out of filter when Lob is found
                                return true;
                            }
                            
                        })[0];
                        approvers[index].Lob = newLobObj;
                    });
                    resolve(approvers);
                }, function (err) {
                    reject(err);
                });
            }); 
        }
    };
});
    