/**
	This service makes decisions for the computer in human
	vs computer matchups. It is designed to never allow the human
	to win.
**/
app.service('aiService', function(SQUARE_MARKERS) {
	var getOppositeAIMarker = function (AIMarker) {
		return AIMarker === SQUARE_MARKERS.PLAYER_1 ? SQUARE_MARKERS.PLAYER_2 : SQUARE_MARKERS.PLAYER_1;
	};

	/**
		Based on the input board and marker, this function determines
		a move to win the game, and how many possible moves exist
		to win the game.
	**/
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

	/**
		If the opponent has a move (or more) to win the game, this will return
		a space to block one of the winning moves.
	**/
	var getBlockMove = function(board, AIMarker) {
		return getWinMove(board, getOppositeAIMarker(AIMarker));
	};

	/**
		If the marker has a chance to set up two or more win moves at once,
		this function will return the space where is possible.
	**/
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

	/**
		Returns the number of unmarked cells on the board.
	**/
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

	/**
		There is a dangerous situation where the user chooses to corners opposite
		eachother, adn the CPU chooses the middle tile. This function tells us if
		the board is in that dangerous situation.
	**/
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

	/**
		If we are in the dangerous situation described above, we choose an empty
		side-space. Otherwise, we return a spot that the opponent could use as a
		fork.
	**/
	var getBlockForkMove = function (board, AIMarker) {
		if(blockingForkWillResultInTrap(board, AIMarker)) {
			return getEmptySideMove(board, AIMarker);
		}
		return getForkMove(board, getOppositeAIMarker(AIMarker));
	};

	/**
		Returns the center spot if available.
	**/
	var getCenterMove = function (board, AIMarker) {
		if(board[1][1] === SQUARE_MARKERS.EMPTY) {
			return {
				row: 1,
				column: 1
			}
		}
	};

	/**
		If the opponent has a corner with an empty corner opposite it, this function
		will return the spot opposite it. (If more than one returns the last one encountered 
		[arbitrary])
	**/
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

	/**
		Returns an arbitrary empty corner if it exists.
	**/
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
		Returns an empty side move if it exists
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

	/**
		Originally used for testing, now used as a failsafe. This function
		returns a random empty square. This function should never be encountered.
	**/	
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

	/**
		Determines the optimal move for the computer (in terms of never losing).
		It follows a desicion tree similar to the one found in the strategy section here:
			http://en.wikipedia.org/wiki/Tic-tac-toe

	**/
	this.determineNextMove = function (board, AIMarker) {
		return getWinMove(board, AIMarker) || getBlockMove(board, AIMarker) || 
		getForkMove(board, AIMarker) || getBlockForkMove(board, AIMarker) || 
		getCenterMove(board, AIMarker) || getOppositeCornerMove(board, AIMarker) ||
		getEmptyCornerMove(board, AIMarker) || getEmptySideMove(board, AIMarker) || 
		getRandomLegalMove(board);
	};
});