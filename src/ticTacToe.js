var app = angular.module('ticTacToe', ['ui.bootstrap']);

app.constant('SQUARE_MARKERS', {
	EMPTY: '',
	PLAYER_1: 'X',
	PLAYER_2: 'O'
});

app.service('AI', function(SQUARE_MARKERS) {
	var getWinMove = function(board, AIMarker) {
		var winMove;
		var hasTwoAIoneEmpty = function (set, isRow, index) {
			var emptySpot = set.indexOf(SQUARE_MARKERS.EMPTY);
			if(set.indexOf(AIMarker) !== set.lastIndexOf(AIMarker) &&
				emptySpot !== -1) {
				if(isRow) {
					winMove = {
						row: index,
						column: emptySpot,
						waysToWin: winMove ? ++winMove.waysToWin : 1
					}
				} else {
					winMove = {
						row: emptySpot,
						column: index,
						waysToWin: winMove ? ++winMove.waysToWin : 1
					}
				}
			}
		}
		if(board[1][1] === AIMarker) {
			_.each(board, function (row, rowIndex) {
				_.each(row, function (cell, columnIndex) {
					if(cell === SQUARE_MARKERS.EMPTY && board[2 - rowIndex][2 - columnIndex] === AIMarker) {
						winMove = {
							row: rowIndex,
							column: columnIndex,
							waysToWin: winMove ? ++winMove.waysToWin : 1
						}
						return;
					}
				})
			})
		} 
		var firstColumn = _.map(board, function (row) {
			return row[0];
		});
		var lastColumn = _.map(board, function (row) {
			return row[2];
		});
		hasTwoAIoneEmpty(board[0], true, 0);
		hasTwoAIoneEmpty(board[2], true, 2);
		hasTwoAIoneEmpty(firstColumn, false, 0);
		hasTwoAIoneEmpty(lastColumn, false, 2);
		return winMove;
	};

	var getBlockMove = function(board, AIMarker) {
		if(AIMarker === SQUARE_MARKERS.PLAYER_1) {
			return getWinMove(board, SQUARE_MARKERS.PLAYER_2);
		}
		else {
			return getWinMove(board, SQUARE_MARKERS.PLAYER_1);
		}
	};

	var getForkMove = function (board, AIMarker) {
		var forkMove;
		_.each(board, function (row, rowIndex){
			_.each(row, function (cell, columnIndex) {
				if(board[rowIndex][columnIndex] === SQUARE_MARKERS.EMPTY) {
					var tmpBoard = $.extend(true, {}, board);
					tmpBoard[rowIndex][columnIndex] = AIMarker;
					var winMove = getWinMove(tmpBoard, AIMarker);
					if(winMove && (winMove.waysToWin > 1)) {
						forkMove = {
							row: rowIndex,
							column: columnIndex
						}
					}
				}
			});
		});
		return forkMove;
	};

	var getNumberOfBlankCells = function (board) {
		var counter = 0;
		_.each(board, function (row, rowIndex){
			_.each(row, function (cell, columnIndex) {
				if(board[rowIndex][columnIndex] === SQUARE_MARKERS.EMPTY) {
					counter++;
				}
			});
		});
		return counter;
	};

	var blockingForkWillResultInTrap = function (board, AIMarker) {
		if(board[1][1] === AIMarker && getNumberOfBlankCells(board) === 6) {
			if(board[0][0] === board[2][2] && board[0][0] !== SQUARE_MARKERS.EMPTY) {
				return true;
			} else if (board[0][2] === board[2][0] && board[0][2] !== SQUARE_MARKERS.EMPTY) {
				return true;
			}
		}
		return false;
	};

	var getOppositeAIMarker = function (AIMarker) {
		return AIMarker = SQUARE_MARKERS.PLAYER_1 ? SQUARE_MARKERS.PLAYER_2 : SQUARE_MARKERS.PLAYER_1;
	};

	var getBlockForkMove = function (board, AIMarker) {
		if(blockingForkWillResultInTrap(board, AIMarker)) {
			return getEmptySideMove(board, AIMarker);
		}
		return getForkMove(board, getOppositeAIMarker(AIMarker));
	};

	var getCenterMove = function (board, AIMarker) {
		if(board[1][1] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 1,
				column: 1
			}
		}
	};

	var getOppositeCornerMove = function (board, AIMarker) {
		var oppMark = getOppositeAIMarker(AIMarker);
		if(board[0][0] === oppMark && board[2][2] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 2,
				column: 2
			}
		} else if (board[2][2] === oppMark && board[0][0] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 0,
				column: 0
			}
		} else if (board[0][2] === oppMark && board[2][0] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 2,
				column: 0
			}
		} else if (board[2][0] === oppMark && board[0][2] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 0,
				column: 2
			}
		}
	};

	var getEmptyCornerMove = function (board, AIMarker) {
		if(board[0][0] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 0,
				column: 0
			}
		} else if (board[2][2] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 2,
				column: 2
			}
		} else if (board[0][2] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 0,
				column: 2
			}
		} else if (board[2][0] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 2,
				column: 0
			}
		}
	};

	/**
		Whatever is left
	**/
	var getEmptySideMove = function (board, AIMarker) {
		if(board[0][1] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 0,
				column: 1
			}
		} else if(board[1][0] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 1,
				column: 0
			}
		} else if(board[1][2] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 1,
				column: 2
			}
		} else if(board[2][0] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 2,
				column: 0
			}
		}
	};

	var getRandomLegalMove = function (board, AIMarker) {
		var move;
		_.each(board, function (row, rowIndex) {
			_.each(row, function (cell, columnIndex) {
				if(cell === SQUARE_MARKERS.EMPTY) {
					move = {
						row: rowIndex,
						column: columnIndex
					}
				}
			});
		});
		return move;
	};

	this.determineNextMove = function (board, AIMarker) {
		return getWinMove(board, AIMarker) || getBlockMove(board, AIMarker) || 
		getForkMove(board, AIMarker) || getBlockForkMove(board, AIMarker) || 
		getCenterMove(board, AIMarker) || getOppositeCornerMove(board, AIMarker) ||
		getEmptyCornerMove(board, AIMarker) || getEmptySideMove(board, AIMarker) || 
		getRandomLegalMove(board);
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

app.controller('boardCtrl', function($scope, SQUARE_MARKERS, AI) {
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

	$scope.checkWin = function () {
		checkHorizontalWin();
		checkVerticalWin();
		checkDiagonalWin();
	};

	$scope.getCurrentMarker = function () {
		return $scope.state.playerOneTurn ? SQUARE_MARKERS.PLAYER_1 : SQUARE_MARKERS.PLAYER_2;
	};

	$scope.makeAIMove = function () {
		var nextMove = AI.determineNextMove($scope.board, $scope.getCurrentMarker());
		$scope.board[nextMove.row][nextMove.column] = $scope.getCurrentMarker();
		$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
		$scope.checkWin();
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

app.controller('rowCtrl', function($scope, SQUARE_MARKERS, AI) {
	var isLegalMove = function (row, col) {
		return $scope.board[row][col] === SQUARE_MARKERS.EMPTY;
	};

	$scope.handleMove = function(rowIndex, columnIndex) {
		if(!$scope.gameIsOver() && isLegalMove(rowIndex, columnIndex)) {
			$scope.board[rowIndex][columnIndex] = $scope.getCurrentMarker();
			$scope.state.playerOneTurn = !$scope.state.playerOneTurn;
			$scope.checkWin();
			if(!$scope.gameIsOver() && ($scope.state.selectedMode === $scope.gameModes[1] ||
				$scope.state.selectedMode === $scope.gameModes[2])) {
				$scope.makeAIMove();
			}
		}
	};
});