angular.module('app')

.component('adminApproversByName', {
    templateUrl: 'app/pages/admin/admin-sections/admin-approvers/admin-approvers-name.tpl.html',
    controller: function (peopleApi, userApi, adminApi, dropdownLists, globalState, modalHelper) {
        var $ctrl = this;

        $ctrl.errors = [];
        $ctrl.spUser = null;
        $ctrl.organizations = [];
        $ctrl.isLoading = globalState.isLoading;

        $ctrl.newApprover = {
            Lob: null,      // Lob Obj
            SubLob: null,   // SubLob Obj
            ApproverUserId: null,
            IsApproverBenefit: false,
            IsApproverCost: false,
            IsCfo: false,
            IsSponsor: false
        };

        $ctrl.getLobs = getApproversByUserId;
        $ctrl.addOrganization = addOrganization;
        $ctrl.removeApprover = removeApprover;

        $ctrl.LOBList = dropdownLists.getOptions('LOB');

        $ctrl.peopleSearch = function peopleSearch(term) {
            return peopleApi.search(term);
        };

        $ctrl.getSpUser = function() {
            return $ctrl.spUser ? $ctrl.spUser : null;
        };

        $ctrl.onSpUserSelect = function (person) {
            $ctrl.isLoading(true);

            if(person!==null){
                userApi.getUserByAccount(person.spId).then(function(user) {
                    $ctrl.spUser = user;
                    $ctrl.newApprover.ApproverUserId = user.id
                    getApproversByUserId();
                }, function (errs) {
                    $ctrl.errors = errs;
                }).finally(function () {
                    $ctrl.isLoading(false);
                });
            } else {
                $ctrl.spUser = null;
                $ctrl.organizations = [];
                $ctrl.isLoading(false);
            }

        };

        // for inline updates using the checkboxes
        $ctrl.updateApprover = function (approver, entry) {

            // If all boxes are unchecked, delete row
            if(allUnchecked(approver)) {
                _removeApprover(approver, function() {
                    // on cancel, revert the changes
                    approver[entry] = true;
                });
                return;
            }

            $ctrl.isLoading(true);
            if(approver.Lob) {
                approver.Lob = approver.Lob.id;
            }
            if(approver.SubLob) {
                approver.SubLob = approver.SubLob.id;
            }
            adminApi.updateApprover(approver).then(function (results) {
                // refresh approvers list
                getApproversByUserId();
            }, function (errs) {
                $ctrl.errors = errs;
            }).finally(function () {
                $ctrl.isLoading(false);
            });

        };
        $ctrl.updateApproverModel = function (approver) {
            $ctrl.isLoading(true);

            if(approver.all){
                approver.IsApproverBenefit = true;
                approver.IsApproverCost = true;
                approver.IsCfo = true;
                approver.IsSponsor = true;
            }
            adminApi.updateApprover(approver).then(function (results) {}, function (errs) {
                $ctrl.errors = errs;
            }).finally(function () {
                // refresh approvers list
                $ctrl.isLoading(false);
                getApproversByUserId();
            });
        };

        $ctrl.onLobSelect = function(lob) {
            $ctrl.onSubLobSelect(null);
            $ctrl.newLob = lob;
        };

        $ctrl.onSubLobSelect = function(subLob) {
            $ctrl.newSubLob = subLob;
        };

        function getApproversByUserId() {

            $ctrl.isLoading(true);

            var id_params = {
                userid: $ctrl.spUser.id
            };

            adminApi.getAproverNames(id_params).then(function (approvers) {

                // before assigning need to convert approver Lob & SubLob properties --> full Obj's
                approvers.forEach(function (approver, index){
                    var newLobObj = $ctrl.LOBList.filter(function (lobObj){

                        if(approver.Lob === lobObj.id && approver.SubLob === null){
                            // TODO: break out of filter when Lob is found
                            return true;
                        }
                        else if(approver.Lob === lobObj.id && approver.SubLob !== null) {

                            var newSubLobObj = lobObj.sub.filter(function (subLobObj){
                                return approver.SubLob === subLobObj.id;
                            })[0];

                            approvers[index].SubLob = newSubLobObj;
                            return true;
                        }

                    })[0];

                    approvers[index].Lob = newLobObj;

                });
                $ctrl.organizations = approvers;
                $ctrl.errors = [];

            }, function (errs) {
                $ctrl.errors = errs;

                // REMOVE THIS when API get updated. Shouldn't return exception when no approvers are found
                // should return success true and []
                $ctrl.approvers = [];
            }).finally(function () {
                $ctrl.isLoading(false);
            });
        };

        function allUnchecked(approver) {
            return !approver.IsApproverBenefit &&
                    !approver.IsApproverCost &&
                    !approver.IsCfo &&
                    !approver.IsSponsor;

        }

        function addOrganization () {

            if(!validateNewApprover()) {
                $ctrl.errors = [
                    { message: 'An LOB and at least one checkbox selection are required for new approvers.' }
                ];
                return;
            }
            $ctrl.newApprover.Lob = $ctrl.newLob.id;

            if($ctrl.newSubLob === null || $ctrl.newSubLob === undefined){
                $ctrl.newApprover.SubLob = null;
            }
            else{
                $ctrl.newApprover.SubLob = $ctrl.newSubLob.id;
            }

            $ctrl.isLoading(true);
            adminApi.createApprover($ctrl.newApprover).then(function (results) {
                // refresh approvers list
                getApproversByUserId();
                // resetNewApprover();
            }, function (errs) {
                $ctrl.errors = errs;
            }).finally(function () {
                $ctrl.isLoading(false);
                resetNewApprover();
            });
        }

        function removeApprover (approver) {
            _removeApprover(approver);
        }

        function resetNewApprover() {
            $ctrl.newLob = null;
            $ctrl.newSubLob = null;
            $ctrl.newApprover.IsApproverBenefit = false;
            $ctrl.newApprover.IsApproverCost = false;
            $ctrl.newApprover.IsCfo = false;
            $ctrl.newApprover.IsSponsor = false;
        }

        function showDeleteModal() {
            var opt = {
                title: 'Are you sure you want to delete this admin?',
                okBtn: 'OK',
                cancelBtn: 'Cancel',
                templateUrl: 'app/common/modals/delete-prompt-modal.tpl.html',
                icon: 'trash',
                btnType: 'confirm-delete'
            };
            return modalHelper.openSimplePrompt(opt);
        }

        function validateNewApprover() {
            return $ctrl.newLob && !allUnchecked($ctrl.newApprover);
        }

        function _removeApprover(approver, onCancel) {
            showDeleteModal().then(function() {
                $ctrl.isLoading(true);
                adminApi.deleteApprover(approver.Id).then(function (results) {
                    // refresh lob org list
                    getApproversByUserId(approver.Id);
                }, function (errs) {
                    $ctrl.errors = errs;
                }).finally(function (){
                    $ctrl.isLoading(false);
                });
            }, function() {
                if(onCancel) {
                    onCancel();
                }
            });
        }

    }
});
