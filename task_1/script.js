class Box {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getTopBox() {
    if (this.y === 0) return null;
    return new Box(this.x, this.y - 1);
  }

  getRightBox() {
    if (this.x === 7) return null;
    return new Box(this.x + 1, this.y);
  }

  getBottomBox() {
    if (this.y === 7) return null;
    return new Box(this.x, this.y + 1);
  }

  getLeftBox() {
    if (this.x === 0) return null;
    return new Box(this.x - 1, this.y);
  }

  getNextdoorBoxes() {
    return [
      this.getTopBox(),
      this.getRightBox(),
      this.getBottomBox(),
      this.getLeftBox()
    ].filter(box => box !== null);
  }

}

const swapBoxes = (grid, box1, box2) => {
  const temp = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp;
}

let O = 'O';
let X = 'X';
const getGrid = () => {
  let grid = [[O, O, O, 0, 0, 0, 0, 0], [O, O, O, 0, 0, 0, 0, 0], [O, O, O, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, X, X, X], [0, 0, 0, 0, 0, X, X, X], [0, 0, 0, 0, 0, X, X, X]];

  return grid;
};

class State {
  constructor(grid, move, time, status) {
    this.grid = grid;
    this.move = move;
    this.time = time;
    this.status = status;
  }

  static ready() {
    return new State(
      [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
      0,
      0,
      "ready"
    );
  }

  static start() {
    return new State(getGrid(), 0, 0, "playing");
  }
}

class Game {
  constructor(state) {
    this.state = state;
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    this.handleClickBox = this.handleClickBox.bind(this);
  }

  static ready() {
    return new Game(State.ready());
  }

  tick() {
    this.setState({ time: this.state.time + 1 });
  }

  setState(newState) {
    this.state = { ... this.state, ...newState };
    this.render();
  }

  handleClickBox(box) {
    return function () {
      const nextdoorBoxes = box.getNextdoorBoxes();
      const blankBox = nextdoorBoxes.find(
        nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
      );
      if (blankBox) {
        const newGrid = [...this.state.grid];
        swapBoxes(newGrid, box, blankBox);

      }
    }.bind(this);
  }

  render() {
    let { grid, move, time, status } = this.state;

    // Render grid
    const newGrid = document.createElement("div");
    newGrid.className = "grid";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const button = document.createElement("button");

        if (status === "playing") {

          button.addEventListener("click", this.handleClickBox(new Box(j, i))); // "click" mousedown  mouseup
          // Drag and Drop
          if (grid[i][j] === 0) {
            button.draggable = false;
          } else {
            button.draggable = true;
          }
          let content;
          let data;

          function dragStart(event) {
            event.dataTransfer.setData('text', event.target.id);
            event.dataTransfer.setData('content', event.target.textContent);
            setTimeout(() => {
              if (this.textContent === X || this.textContent === O) {
                grid[i][j] = 0;
              } else {
                return false;
              }
            }, 0)
          };

          function dragEnd(event) {
            if (this.textContent !== X || this.textContent !== O) {
              return false;
            }
          };

          const dragOver = function (event) {
            content = event.dataTransfer.getData('content');
            if (content === 0) {
              return false;
            } else {
              event.preventDefault();
            }
          };
          function dragEnter(event) {
            content = event.dataTransfer.getData('content');
            if (content === 0) {
              return false;
            } else {
              event.preventDefault();
            }
          };

          button.addEventListener('drop', function (event) {
            event.preventDefault();
            data = event.dataTransfer.getData('text');
            content = event.dataTransfer.getData('content');
            setTimeout(() => {
              if (grid[i][j] === 0) {
                grid[i][j] = content;
              } else {
                return false;
              }
            }, 0);
          });

          button.addEventListener("dragstart", dragStart);
          button.addEventListener("dragend", dragEnd);
          button.addEventListener("dragover", dragOver);
          button.addEventListener("dragenter", dragEnter);

          button.textContent = grid[i][j] === 0 ? "" : grid[i][j];
          newGrid.appendChild(button);

          if (grid[i][j] === 0) {
            button.classList.add("dropZone");
          }
        }
      }
    }
    document.querySelector(".grid").replaceWith(newGrid);
    let playerName;
    if (grid[0][0] === X && grid[0][1] === X && grid[0][2] === X &&
      grid[1][0] === X && grid[1][1] === X && grid[1][2] === X &&
      grid[2][0] === X && grid[2][1] === X && grid[2][2] === X) {
      status = "won";
      playerName = X;
    } else if (grid[5][5] === O && grid[5][6] === O && grid[5][7] === O &&
      grid[6][5] === O && grid[6][6] === O && grid[6][7] === O &&
      grid[7][5] === O && grid[7][6] === O && grid[7][7] === O) {
      status = "won";
      playerName = O;
    }

    //Render button
    const newButton = document.createElement("button");
    if (status === "ready") newButton.textContent = "Play";
    if (status === "playing") newButton.textContent = "Reset";
    if (status === "won") newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      clearInterval(this.tickId);
      this.tickId = setInterval(this.tick, 1000);  // time
      this.setState(State.start());
    });
    document.querySelector(".footer button").replaceWith(newButton);

    //Render time
    document.getElementById("time").textContent = `Time ${time}`;

    //Render message
    if (status === "won") {
      document.querySelector(".message").textContent = `Ура! Выиграл игрок ${playerName}`;
    } else {
      document.querySelector(".message").textContent = "";
    }
  }
}


const GAME = Game.ready();