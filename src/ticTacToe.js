var app = angular.module('ticTacToe', []);

app.constant('SQUARE_MARKERS', {
	EMPTY: '',
	PLAYER_1: 'X',
	PLAYER_2: 'O'
});

app.controller('boardCtrl', function($scope, SQUARE_MARKERS) {
	$scope.state = {
		playerOneTurn: true
	};
	$scope.rows = [0, 1, 2]
	$scope.columns = [0, 1, 2]
	$scope.board = [
		[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
		[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
		[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
	]
});

app.controller('rowCtrl', function($scope, SQUARE_MARKERS) {

	var isHorizontalWin = function() {
		var horizontalWin = false;
		_.each($scope.board, function (row) {
			if(_.unique(row).length === 1 && row[0] !== SQUARE_MARKERS.EMPTY) {
				horizontalWin = true;
				return;
			}
		});
		return horizontalWin;
	};

	var isVerticalWin = function() {
		var columnState = [
			{
				lastElement: undefined,
				couldBeWin: true
			},
			{
				lastElement: undefined,
				couldBeWin: true
			},
			{
				lastElement: undefined,
				couldBeWin: true
			}
		];

		/**
			Determines whether a win is still plausible for the passed in column.
		**/
		var verticalWinNotPossible = function (column, currentRow) {
			return !(columnState[column].couldBeWin && 
					$scope.board[currentRow][column] !== SQUARE_MARKERS.EMPTY &&
					(_.isUndefined(columnState[column].lastElement) || 
						columnState[column].lastElement === $scope.board[currentRow][column]))
		};

		_.each($scope.rows, function (row) {
			_.each($scope.columns, function (column) {
				if(verticalWinNotPossible(column, row)) {
					columnState[column].couldBeWin = false;
				} else {
					columnState[column].lastElement = $scope.board[row][column];
				}
			})
		});
		return _.any(_.pluck(columnState, 'couldBeWin'));
	};

	var isDiagonalWin = function () {

	};

	var checkWin = function () {
		if(isHorizontalWin() || isVerticalWin()) {
			console.log('Win');
		}
	};

	$scope.handleMove = function(rowIndex, columnIndex) {

		$scope.board[rowIndex][columnIndex] = $scope.state.playerOneTurn ? SQUARE_MARKERS.PLAYER_1 : SQUARE_MARKERS.PLAYER_2;
		$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
		checkWin();
	};
});