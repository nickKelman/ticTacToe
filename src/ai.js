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
		return AIMarker === SQUARE_MARKERS.PLAYER_1 ? SQUARE_MARKERS.PLAYER_2 : SQUARE_MARKERS.PLAYER_1;
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