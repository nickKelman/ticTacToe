var app = angular.module('ticTacToe', ['ui.bootstrap']);

app.constant('SQUARE_MARKERS', {
	EMPTY: '',
	PLAYER_1: 'X',
	PLAYER_2: 'O'
});

app.service('utils', function (SQUARE_MARKERS) {
	var checkHorizontalWin = function(board, gameState) {
		_.each(board, function (row) {
			if(_.unique(row).length === 1 && row[0] !== SQUARE_MARKERS.EMPTY) {
				gameState.winningPlayer = row[0];
				return;
			}
		});
	};

	var checkVerticalWin = function(board, gameState) {
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
					board[currentRow][column] !== SQUARE_MARKERS.EMPTY &&
					(_.isUndefined(columnState[column].lastElement) || 
						columnState[column].lastElement === board[currentRow][column]))
		};

		_.each([0,1,2], function (row) {
			_.each([0,1,2], function (column) {
				if(verticalWinNotPossible(column, row)) {
					columnState[column].couldBeWin = false;
				} else {
					columnState[column].lastElement = board[row][column];
				}
			})
		});
		_.each(columnState, function (colState, index) {
			if(colState.couldBeWin) {
				gameState.winningPlayer = board[0][index];
			}
		});
	};

	var checkTopRightDiagonalWin = function (board, gameState) {
		var rightDiagonal = _.map(board, function (row, index) {
			return row[2 - index];
		});
		if(_.unique(rightDiagonal).length === 1 && rightDiagonal[0] !== SQUARE_MARKERS.EMPTY) {
			gameState.winningPlayer = rightDiagonal[0];
		}
	};

	var checkTopLeftDiagonalWin = function (board, gameState) {
		var leftDiagonal = _.map(board, function (row, index) {
			return row[index];
		});
		if(_.unique(leftDiagonal).length === 1 && leftDiagonal[0] !== SQUARE_MARKERS.EMPTY) {
			gameState.winningPlayer = leftDiagonal[0];
		}
	};

	var checkDiagonalWin = function (board, gameState) {
		return checkTopLeftDiagonalWin(board, gameState) || checkTopRightDiagonalWin(board, gameState);
	};

	this.checkWin = function (board, gameState) {
		checkHorizontalWin(board, gameState);
		checkVerticalWin(board, gameState);
		checkDiagonalWin(board, gameState);
	};

	this.getCurrentMarker = function (state) {
		return state.playerOneTurn ? SQUARE_MARKERS.PLAYER_1 : SQUARE_MARKERS.PLAYER_2;
	};
});

app.controller('gameCtrl', function($scope) {
	$scope.gameModes = [
		'Human vs Human',
		'Human vs Computer',
		'Computer vs Human'
	];
	$scope.state = {
		selectedMode: $scope.gameModes[0]
	}
});

app.controller('dropdownCtrl', function($scope) {
	$scope.status = {
	    isopen: true
  	};
  	$scope.setGameMode = function(mode) {
	    $scope.state.selectedMode = mode;
  	};
});

app.controller('boardCtrl', function($scope, SQUARE_MARKERS, AI, utils) {
	$scope.makeAIMove = function () {
		var nextMove = AI.determineNextMove($scope.board, utils.getCurrentMarker($scope.state));
		$scope.board[nextMove.row][nextMove.column] = utils.getCurrentMarker($scope.state);
		$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
		utils.checkWin($scope.board, $scope.state);
	};

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

	$scope.$watch('state.selectedMode', function (newValue, oldValue) {
		if(newValue !== oldValue) {
			$scope.resetGame();
		}
	});

	$scope.resetGame = function () {
		var newGameDefaults = {
			winningPlayer: undefined,
			playerOneTurn: true
		};
		_.extend($scope.state, newGameDefaults)
		$scope.board = [
			[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
			[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
			[SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY, SQUARE_MARKERS.EMPTY],
		];
		if($scope.state.selectedMode === $scope.gameModes[2]) {
			$scope.makeAIMove();
		}
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

app.controller('rowCtrl', function($scope, SQUARE_MARKERS, AI, utils) {
	var isLegalMove = function (row, col) {
		return $scope.board[row][col] === SQUARE_MARKERS.EMPTY;
	};

	$scope.handleMove = function(rowIndex, columnIndex) {
		if(!$scope.gameIsOver() && isLegalMove(rowIndex, columnIndex)) {
			$scope.board[rowIndex][columnIndex] = utils.getCurrentMarker($scope.state);
			$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
			utils.checkWin($scope.board, $scope.state);
			if(!$scope.gameIsOver() && ($scope.state.selectedMode === $scope.gameModes[1] ||
				$scope.state.selectedMode === $scope.gameModes[2])) {
				$scope.makeAIMove();
			}
		}
	};
});