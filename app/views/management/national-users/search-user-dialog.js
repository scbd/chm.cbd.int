define([], function() {

    return ['$scope', '$http', 'government', function ($scope, $http, government) {

        var _ctrl = this;

        _ctrl.search = function() {

            if($scope.form.$invalid || !_ctrl.email)
                return;

            _ctrl.loading = true;

            var email = _ctrl.email.toLowerCase();

            $http.get('https://api.cbd.int/api/v2013/users/national', { params : { q : { email : email } } }).then(function(res) {
                _ctrl.user = res.data[0] || {
                    government : government,
                    email : email,
                    roles : [],
                    new:true
                };

            }).catch(function(err){

                _ctrl.error = err.data || err;

            }).finally(function(){

                delete _ctrl.loading;

            });
        };

        _ctrl.save = function() {

            delete _ctrl.user.new;

            $scope.closeThisDialog(_ctrl.user);
        };
	}];
});
