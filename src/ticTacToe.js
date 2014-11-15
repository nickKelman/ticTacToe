var app = angular.module('ticTacToe', ['ui.bootstrap']);

app.constant('SQUARE_MARKERS', {
	EMPTY: '',
	PLAYER_1: 'X',
	PLAYER_2: 'O'
});

app.controller('dropdownCtrl', function($scope) {
	$scope.status = {
	    isopen: true
  	};
});

app.controller('boardCtrl', function($scope, SQUARE_MARKERS) {
	var boardIsFull = function () {
		boardFull = true;
		_.each($scope.board, function (row) {
			_.each(row, function (cell) {
				if(cell === SQUARE_MARKERS.EMPTY) {
					boardFull = false;
				}
			});
		});
		return boardFull;
	};

	$scope.resetGame = function () {
		$scope.state = {
			winningPlayer: undefined,
			playerOneTurn: true
		};
		$scope.board = [
			[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
			[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
			[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
		];
	};

	$scope.gameIsOver = function () {
		return !_.isUndefined($scope.state.winningPlayer) || boardIsFull();
	};

	$scope.rows = [0, 1, 2]
	$scope.columns = [0, 1, 2]
	$scope.playerOneMarker = SQUARE_MARKERS.PLAYER_1;
	$scope.playerTwoMarker = SQUARE_MARKERS.PLAYER_2;
	$scope.resetGame();
});

app.controller('rowCtrl', function($scope, SQUARE_MARKERS) {

	var checkHorizontalWin = function() {
		_.each($scope.board, function (row) {
			if(_.unique(row).length === 1 && row[0] !== SQUARE_MARKERS.EMPTY) {
				$scope.state.winningPlayer = row[0];
				return;
			}
		});
	};

	var checkVerticalWin = function() {
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
		_.each(columnState, function (colState, index) {
			if(colState.couldBeWin) {
				$scope.state.winningPlayer = $scope.board[0][index];
			}
		});
	};

	var checkTopRightDiagonalWin = function () {
		var rightDiagonal = _.map($scope.board, function (row, index) {
			return row[$scope.columns.length - 1 - index];
		});
		if(_.unique(rightDiagonal).length === 1 && rightDiagonal[0] !== SQUARE_MARKERS.EMPTY) {
			$scope.state.winningPlayer = rightDiagonal[0];
		}
	};

	var checkTopLeftDiagonalWin = function () {
		var leftDiagonal = _.map($scope.board, function (row, index) {
			return row[index];
		});
		if(_.unique(leftDiagonal).length === 1 && leftDiagonal[0] !== SQUARE_MARKERS.EMPTY) {
			$scope.state.winningPlayer = leftDiagonal[0];
		}
	};

	var checkDiagonalWin = function () {
		return checkTopLeftDiagonalWin() || checkTopRightDiagonalWin();
	};

	var checkWin = function () {
		checkHorizontalWin();
		checkVerticalWin();
		checkDiagonalWin();
	};

	$scope.handleMove = function(rowIndex, columnIndex) {
		if(!$scope.gameIsOver()) {
			$scope.board[rowIndex][columnIndex] = $scope.state.playerOneTurn ? SQUARE_MARKERS.PLAYER_1 : SQUARE_MARKERS.PLAYER_2;
			$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
			checkWin();
		}
	};
});