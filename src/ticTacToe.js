var app = angular.module('ticTacToe', ['ui.bootstrap']);

app.constant('SQUARE_MARKERS', {
	EMPTY: '',
	PLAYER_1: 'X',
	PLAYER_2: 'O'
});

app.constant('BOARD', {
	rows: [0, 1, 2],
	columns: [0, 1, 2]
})

/**
	Utility functions
**/
app.service('utils', function (SQUARE_MARKERS, BOARD) {
	/**
		Checks for any horizontal win
	**/
	var checkHorizontalWin = function(board, gameState) {
		_.each(board, function (row) {
			if(_.unique(row).length === 1 && row[0] !== SQUARE_MARKERS.EMPTY) {
				gameState.winningPlayer = row[0];
				return;
			}
		});
	};

	/**
		Checks for any vertical win
	**/
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
			Determines whether a win is still plausible for the passed in column
			and current Row. The currentRow gets called from top to bottom.
		**/
		var verticalWinNotPossible = function (column, currentRow) {
			return !(columnState[column].couldBeWin && 
					board[currentRow][column] !== SQUARE_MARKERS.EMPTY &&
					(_.isUndefined(columnState[column].lastElement) || 
						columnState[column].lastElement === board[currentRow][column]))
		};

		_.each(BOARD.rows, function (row) {
			_.each(BOARD.columns, function (column) {
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

	/**
		Determines if a win exists using the diagonal involving the top-right square.
	**/
	var checkTopRightDiagonalWin = function (board, gameState) {
		var rightDiagonal = _.map(board, function (row, index) {
			return row[2 - index];
		});
		if(_.unique(rightDiagonal).length === 1 && rightDiagonal[0] !== SQUARE_MARKERS.EMPTY) {
			gameState.winningPlayer = rightDiagonal[0];
		}
	};

	/**
		Determines if a win exists using the diagonal involving the top-left square
	**/
	var checkTopLeftDiagonalWin = function (board, gameState) {
		var leftDiagonal = _.map(board, function (row, index) {
			return row[index];
		});
		if(_.unique(leftDiagonal).length === 1 && leftDiagonal[0] !== SQUARE_MARKERS.EMPTY) {
			gameState.winningPlayer = leftDiagonal[0];
		}
	};

	/**
		Checks if there is any diagonla with its win-condition satisfied
	**/
	var checkDiagonalWin = function (board, gameState) {
		return checkTopLeftDiagonalWin(board, gameState) || checkTopRightDiagonalWin(board, gameState);
	};

	/**
		Checks to see if any win condition is met
	**/
	this.checkWin = function (board, gameState) {
		checkHorizontalWin(board, gameState);
		checkVerticalWin(board, gameState);
		checkDiagonalWin(board, gameState);
	};

	/**
		Gets the current marker based on which player's turn it is
	**/
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
  	$scope.setGameMode = function(mode) {
	    $scope.state.selectedMode = mode;
  	};
});

app.controller('boardCtrl', function($scope, SQUARE_MARKERS, BOARD, aiService, utils) {
	/**
		Makes a move for the computer, changes player turn, and checks for win condition.
	**/
	$scope.makeAIMove = function () {
		var nextMove = aiService.determineNextMove($scope.board, utils.getCurrentMarker($scope.state));
		$scope.board[nextMove.row][nextMove.column] = utils.getCurrentMarker($scope.state);
		$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
		utils.checkWin($scope.board, $scope.state);
	};

	/**
		Checks to see if the board is full
	**/
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

	/**
		When the user changes the mode of the game, the board is reset
	**/
	$scope.$watch('state.selectedMode', function (newValue, oldValue) {
		if(newValue !== oldValue) {
			$scope.resetGame();
		}
	});

	/**
		Resets the turn back to player1
		Resets the winning player
		Resets the board
		Makes a move for the computer if in Computer vs. Human mode
	**/
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

	/**
		Checks to see if the board is full or if someone has won the game
	**/
	$scope.gameIsOver = function () {
		return !_.isUndefined($scope.state.winningPlayer) || boardIsFull();
	};

	$scope.playerOneMarker = SQUARE_MARKERS.PLAYER_1;
	$scope.playerTwoMarker = SQUARE_MARKERS.PLAYER_2;
	$scope.resetGame();
	$scope.rows = BOARD.rows;
	$scope.columns = BOARD.columns;
});

app.controller('rowCtrl', function($scope, SQUARE_MARKERS, aiService, utils) {
	/**
		Checks to see if the given row and column is already occupied on the board.
	**/
	var isLegalMove = function (row, col) {
		return $scope.board[row][col] === SQUARE_MARKERS.EMPTY;
	};

	/**
		If the is not over and the move is legal, makes the move for the player,
		changes turn, checks for win, then makes the move for the computer if in the propper
		mode.
	**/
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