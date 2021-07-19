main();

/** 
 * returns the winner of a game of tic tac toe
 * @argument ticTacToeGrid a 2-dimensional array of the game board, 0 = empty, 1 = player 1, 2 = player 2
 * @returns 1 if player 1 wins, 2 if player 2 wins, 0 if it is a tie, -1 if the game is not over
 */
function isGameOver(ticTacToeGrid) {
  // check rows
  for (let i = 0; i < ticTacToeGrid.length; i++) {
    if (ticTacToeGrid[i][0] === ticTacToeGrid[i][1] && ticTacToeGrid[i][0] === ticTacToeGrid[i][2] && ticTacToeGrid[i][0] !== 0) {
      return ticTacToeGrid[i][0];
    }
  }

  // check columns
  for (let i = 0; i < ticTacToeGrid.length; i++) {
    if (ticTacToeGrid[0][i] === ticTacToeGrid[1][i] && ticTacToeGrid[0][i] === ticTacToeGrid[2][i] && ticTacToeGrid[0][i] !== 0) {
      return ticTacToeGrid[0][i];
    }
  }

  // check diagonals
  if (ticTacToeGrid[0][0] === ticTacToeGrid[1][1] && ticTacToeGrid[0][0] === ticTacToeGrid[2][2] && ticTacToeGrid[0][0] !== 0) {
    return ticTacToeGrid[0][0];
  }
  if (ticTacToeGrid[0][2] === ticTacToeGrid[1][1] && ticTacToeGrid[0][2] === ticTacToeGrid[2][0] && ticTacToeGrid[0][2] !== 0) {
    return ticTacToeGrid[0][2];
  }

  // check if the game over
  for (let i = 0; i < ticTacToeGrid.length; i++) {
    for (let j = 0; j < ticTacToeGrid[i].length; j++) {
      if (ticTacToeGrid[i][j] === 0) {
        return -1;
      }
    }
  }

  // it is a tie
  return 0;
}

/**
 * Generate game grids and display each grid as a table
 */
async function playGame(player1Name, player2Name) {
  return new Promise(res => {
    console.log('Predict a winner: ');

    // once data from the stdin buffer
    process.stdin.once("data", (data) => {
      // let the data be the users prediction of the winner
      let prediction = data.toString();
      // remove the new line from the prediction
      prediction = prediction.trim();

      // add a new line
      console.log("");

      // generate the game grids
      let gameGrids = generateGameGrids();

      for (let i = 0; i < gameGrids.length; i++) {
        // print whos turn it is
        if (i % 2 === 0) {
          console.log(`${player1Name}'s turn`);
        } else {
          console.log(`${player2Name}'s turn`);
        }

        console.log(drawGrid(gameGrids[i]));
      }

      // get the winner
      let winner = isGameOver(gameGrids[gameGrids.length - 1]);

      // print the number of turns
      console.log(`The number of turns is ${gameGrids.length}`);

      // check if the game ended in a tie
      if (winner === 0) {
        console.log(`It's a tie!`);
      } else {
        // get the winners name
        let winnerName = (winner === 1) ? player1Name : player2Name;

        // print the winner
        console.log(`${winnerName} wins!`);

        // compare the prediction to the winners name
        if (prediction === winnerName) {
          console.log('The prediction was correct!');
        } else {
          console.log('The prediction was wrong!');
        }
      }

      res();
    });
  });
}

/**
 * play a best of three match of tic tac toe
 */
async function main() {
  console.log('===============================================');
  console.log('================= TIC TAC TOE =================');
  console.log('===============================================');
  console.log("");

  // generate the player names
  let player1Name = generatePlayerName();
  let player2Name = generatePlayerName();

  // make sure player names are unique
  while (player1Name === player2Name) {
    player2Name = generatePlayerName();
  }

  // print whos X and whos O
  console.log(`${player1Name} plays as X`);
  console.log(`${player2Name} plays as O`);
  // print a new line
  console.log("");

  // play the game
  await playGame(player1Name, player2Name);

  // print a new line
  console.log("");

  // play again
  console.log("Would you like to play again?");
  console.log("1. Yes");
  console.log("2. No");
  console.log("");

  // once data from the stdin buffer
  process.stdin.once("data", (data) => {
    // get the data
    let input = data.toString().trim();

    // check if the user wants to play again
    if (input === "1") {
      console.log("");
      main();
    } else {
      // end the program
      process.exit();
    }
  });
}

/**
 * @return a random adjective with an animalname
 */
function generatePlayerName() {
  let adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
  let animals = ["ant", "bat", "cat", "dog", "eel", "fish", "goat", "guinea pig", "kangaroo", "leopard", "lion", "mouse", "rabbit", "shark", "snail", "swan", "tiger", "whale", "zebra"];
  let adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  let animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective} ${animal}`;
}

/**
 * Generate an empty grid, and simulate the moves of the players
 * the players alternate turns and player 1 always goes first
 * return all boards after the game is over
 */
function generateGameGrids() {
  let gameGrids = [];
  let grid = generateEmptyGrid();
  let player = 1;
  while (isGameOver(grid) === -1) {
    playMove(grid, player);
    // save a deep copy of the grid
    gameGrids.push(JSON.parse(JSON.stringify(grid)));
    player = player % 2 + 1;
  }
  return gameGrids;
}

function generateEmptyGrid() {
  let grid = [[0,0,0],[0,0,0],[0,0,0]];
  return grid;
}

function playMove(grid, player) {
  // get a random row and column
  let row = Math.floor(Math.random() * 3);
  let column = Math.floor(Math.random() * 3);

  // while the cell is not empty
  while (grid[row][column] !== 0) {
    // get a new row and column
    row = Math.floor(Math.random() * 3);
    column = Math.floor(Math.random() * 3);
  }

  grid[row][column] = player;
}

function drawGrid(grid) {
  let output = "";
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      // add a vertical line
      if (j !== 0) {
        output += "|";
      }

      // add a space
      output += " ";

      // draw 0 as a space
      if (grid[i][j] === 0) {
        output += " ";
      }
      // draw 1 as player 1
      else if (grid[i][j] === 1) {
        output += "X";
      }
      // draw 2 as player 2
      else if (grid[i][j] === 2) {
        output += "O";
      }

      // add a space
      output += " ";
    }

    output += "\n";
    // add a horizontal line
    if (i !== 2) {
      output += "---+---+---\n";
    }
  }
  return output;
}
