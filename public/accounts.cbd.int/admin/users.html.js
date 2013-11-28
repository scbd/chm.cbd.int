function ViewController ($scope, authHttp, $route) {

	$scope.roles = authHttp.get('/api/v2013/roles', { cache: true }).then(function (response) { 
		var map = {};
		response.data.forEach(function (role) {
			map[role.roleId] = role;
		});
		return map; 
	});

	function populate () {
		authHttp.get('/api/v2013/users', { params: { q: $scope.freetext, sk: $scope.currentPage*25, l: 25 } }).then(function (response) {
			$scope.users =  response.data;
		});
	};

	function setPage (page) {
		$scope.currentPage = Math.max(0, Math.min($scope.pageCount-1, page|0));
	};

	//

    $scope.pageCount = 4;
    $scope.pages = [0, 1, 2, 3];
    $scope.currentPage = 0;

    $scope.actionSetPage = setPage;

	$scope.$watch('freetext', populate);
	$scope.$watch('currentPage', populate);
}