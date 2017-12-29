angular.module('app')

.component('adminApproversByOrg', {
    templateUrl: 'app/pages/admin/admin-sections/admin-approvers/admin-approvers-org.tpl.html',
    controller: function (dropdownLists, adminApi, peopleApi, userApi, globalState, modalHelper) {
        var $ctrl = this;

        $ctrl.errors = [];
        $ctrl.spUser = null;
        $ctrl.approvers = [];
        $ctrl.isLoading = globalState.isLoading;

        $ctrl.newApprover = {
            Lob: null,
            SubLob: null,
            ApproverUserId: null,
            IsApproverBenefit: false,
            IsApproverCost: false,
            IsCfo: false,
            IsSponsor: false
        };

        $ctrl.addApprover = addApprover;
        $ctrl.removeApprover = removeApprover;
        $ctrl.getApproversByLob = getApproversByLob;

        $ctrl.LOBList = dropdownLists.getOptions('LOB');

        $ctrl.peopleSearch = function peopleSearch(term) {
            return peopleApi.search(term);
        };

        $ctrl.getSpUser = function() {
            return $ctrl.spUser ? $ctrl.spUser : null;
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

            adminApi.updateApprover(approver).then(function (results) {
                // refresh approvers list
                getApproversByLob(approver.Lob, approver.SubLob);
            }, function (errs) {
                $ctrl.errors = errs;
            }).finally(function () {
                $ctrl.isLoading(false);
            });

        };

        // for inline updates using the all checkbox
        $ctrl.updateApproverModel = function (approver) {
            if(approver.all){
                approver.IsApproverBenefit = true;
                approver.IsApproverCost = true;
                approver.IsCfo = true;
                approver.IsSponsor = true;
            }

            $ctrl.isLoading(true);

            adminApi.updateApprover(approver).then(function (results) {
                // refresh approvers list
                getApproversByLob(approver.Lob, approver.SubLob);
            }, function (errs) {
                $ctrl.errors = errs;
            }).finally(function (){
                $ctrl.isLoading(false);
            });
        };


        $ctrl.onUserSelect = function (person) {
            if(person!==null){
                userApi.getUserByAccount(person.spId).then(function(user) {
                    $ctrl.spUser = user;
                    $ctrl.newApprover.ApproverUserId = user.id
                }, function (errs) {
                    $ctrl.errors = errs;
                });
            } else {
                $ctrl.spUser = null;
            }
        };

        $ctrl.onSelectLob = function (lob) {
            $ctrl.LOB = lob;
            $ctrl.onSelectSubLob(null);
            if(lob) {
                $ctrl.getApproversByLob($ctrl.LOB.id, null)
            }
        };

        $ctrl.onSelectSubLob = function (subLob) {
            $ctrl.SubLOB = subLob;
            if(subLob) {
                $ctrl.getApproversByLob($ctrl.LOB.id, $ctrl.SubLOB.id);
            } else {
                $ctrl.approvers = [];
            }
        };

        function getApproversByLob(lob, sublob) {

            $ctrl.isLoading(true);

            var id_params = {
                lob: lob
            };

            if(!angular.isDefined(sublob) || sublob !== null){
                id_params.sublob = sublob;
            }

            adminApi.getAproverNames(id_params).then(function (results) {

                // filter out duplicate approvers who belong too sublob when only lob selected
                if($ctrl.LOB !== null && !$ctrl.SubLOB){
                    $ctrl.approvers = results.filter(function (approver) {
                        return approver.SubLob === null
                    });
                } else{
                    $ctrl.approvers = results;
                }

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

        function addApprover () {

            if(!validateNewApprover()) {
                $ctrl.errors = [
                    { message: 'A user and at least one checkbox selection are required for new approvers.' }
                ];
                return;
            }

            $ctrl.isLoading(true);
            $ctrl.newApprover.Lob = $ctrl.LOB.id;

            if($ctrl.SubLOB === null || $ctrl.SubLOB === undefined){
                $ctrl.newApprover.SubLob = $ctrl.SubLOB
            }
            else{
                $ctrl.newApprover.SubLob = $ctrl.SubLOB.id;
            }

            adminApi.createApprover($ctrl.newApprover).then(function (results) {
                // refresh approvers list
                getApproversByLob($ctrl.newApprover.Lob, $ctrl.newApprover.SubLob);
            }, function (errs) {
                $ctrl.errors = errs;
            }).finally(function () {
                resetNewApprover();
                $ctrl.isLoading(false);
            });

        }

        function validateNewApprover() {
            return $ctrl.spUser && !allUnchecked($ctrl.newApprover);
        }

        function removeApprover (approver) {
           _removeApprover(approver);
        }

        function allUnchecked(approver) {
            return  !approver.IsApproverBenefit && !approver.IsApproverCost && !approver.IsCfo && !approver.IsSponsor;
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

        function _removeApprover(approver, onCancel) {
            showDeleteModal().then(function() {
                $ctrl.isLoading(true);
                adminApi.deleteApprover(approver.Id).then(function (results) {
                    // refresh approvers list
                    getApproversByLob(approver.Lob, approver.SubLob);
                }, function (errs) {
                    $ctrl.errors = errs;
                }).finally(function () {
                    $ctrl.isLoading(false);
                });
            }, function() {
                if(onCancel) {
                    onCancel();
                }
            });
        }

        function resetNewApprover() {
            $ctrl.spUser = null;
            $ctrl.newApprover.IsApproverBenefit = false;
            $ctrl.newApprover.IsApproverCost = false;
            $ctrl.newApprover.IsCfo = false;
            $ctrl.newApprover.IsSponsor = false;
        }
    }
});
