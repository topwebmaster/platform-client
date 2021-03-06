module.exports = [
    '$scope',
    '$translate',
    '$q',
    'gravatar',
    'UserEndpoint',
    'RoleHelper',
function(
    $scope,
    $translate,
    $q,
    gravatar,
    UserEndpoint,
    RoleHelper
) {
    $translate('api.users').then(function(title){
        $scope.title = title;
    });

    $scope.getRole = function(role) {
        return RoleHelper.getRole($scope.roles, role);
    };

    $scope.selectedUsers = [];

    $scope.isToggled = function(user) {
        return $scope.selectedUsers.indexOf(user.id) > -1;
    };

    $scope.toggleUser = function(user) {
        var idx = $scope.selectedUsers.indexOf(user.id);
        if (idx > -1) {
            $scope.selectedUsers.splice(idx, 1);
        } else {
            $scope.selectedUsers.push(user.id);
        }
    };

    $scope.deleteUsers = function() {
        $translate('notify.user.bulk_destroy_confirm', {
            count: $scope.selectedUsers.length
        }).then(function(message) {
            if (window.confirm(message)) {
                var calls = [];
                angular.forEach($scope.selectedUsers, function(userId) {
                    calls.push( UserEndpoint.delete({ id: userId }).$promise );
                });
                $q.all(calls).then($scope.filterRole);
            }
        });
    };

    $scope.changeRole = function() {
        $translate('notify.user.bulk_role_change_confirm', {
            count: $scope.selectedUsers.length,
            role:  $scope.getRole($scope.changedRole)
        }).then(function(message) {
            if (window.confirm(message)) {
                var calls = [];
                angular.forEach($scope.selectedUsers, function(userId) {
                    calls.push( UserEndpoint.update({ id: userId }, { id: userId, role: $scope.changedRole }).$promise );
                });
                $q.all(calls).then($scope.filterRole);
            }
            $scope.changedRole = null;
        });
    };

    $scope.filterRole = function() {
        $scope.users = UserEndpoint.query({ role: $scope.filteredRole });
        $scope.selectedUsers = [];
    };

    $scope.filteredRole = '';

    // hydrate!
    $scope.users = UserEndpoint.query();
    $scope.roles = [
        // TODO: make this an endpoint
        {
            name: 'guest',
            display_name: 'Guest',
        },
        {
            name: 'user',
            display_name: 'Member',
        },
        {
            name: 'admin',
            display_name: 'Admin',
        }
    ];
}];
