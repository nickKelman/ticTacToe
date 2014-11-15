var app = angular.module("ticTacToe", []);

app.constant("SQUARE_MARKERS", {
	EMPTY: '',
	PLAYER_1: 'X',
	PLAYER_2: 'O'
});

app.controller("boardCtrl", function($scope, SQUARE_MARKERS) {
	var EMPTY = '',
	PLAYER_1 = 'X',
	PLAYER_2 = 'O';

	$scope.state = {
		playerOneTurn: true
	};
	$scope.rows = [0, 1, 2]
	$scope.board = [
		[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
		[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
		[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
	]
});

app.controller("rowCtrl", function($scope, SQUARE_MARKERS) {
	$scope.columns = [0, 1, 2]
	$scope.handleMove = function(rowIndex, columnIndex) {
		$scope.board[rowIndex][columnIndex] = $scope.state.playerOneTurn ? SQUARE_MARKERS.PLAYER_1 : SQUARE_MARKERS.PLAYER_2;
		$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
	};
});