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
    if (this.x === 4) return null;
    return new Box(this.x + 1, this.y);
  }

  getBottomBox() {
    if (this.y === 4) return null;
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
const getRandomGrid = () => {
  let grid = [[O, O, O, "", "", "", "", ""], [O, O, O, "", "", "", "", ""], [O, O, O, "", "", "", "", ""], ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""], ["", "", "", "", "", X, X, X], ["", "", "", "", "", X, X, X], ["", "", "", "", "", X, X, X]];

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
    return new State(getRandomGrid(), 0, 0, "playing");
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
    const { grid, move, time, status } = this.state;

    // Render grid
    const newGrid = document.createElement("div");
    newGrid.className = "grid";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const button = document.createElement("button");

        if (status === "playing") {
          button.addEventListener("click", readyBox);
          function readyBox(event) {
            if (event.target.textContent === 0) {
              // grid[i][j] = 0;
              // console.log(event.target.textContent + ' ');
              event.target.textContent = "";
              button.textContent = '';
            }
          }
          button.addEventListener("click", this.handleClickBox(new Box(j, i))); // "click" mousedown  mouseup
          // Drag and Drop
          button.draggable = true;
          let content;
          let data;
          button.addEventListener("dragstart", dragStart);
          button.addEventListener("dragend", dragEnd);
          function dragStart(event) {
            event.dataTransfer.setData('text', event.target.id);
            event.dataTransfer.setData('content', event.target.textContent);
            // console.log('dragstart');
            setTimeout(() => {
              // button.textContent = '';
              if (this.textContent !== '') {
                grid[i][j] = 0;
              }
              // event.target.style.opacity = '0';
              // event.target.style.display = 'none';
              // this.classList.add("dropZone");
            }, 500)
          };

          function dragEnd(event) {
            console.log('dragEnd');
          };

          const dragOver = function (event) {
            event.preventDefault();
            console.log('dragover');
          };
          function dragEnter(event) {
            event.preventDefault();
            console.log('dragEnter' + this.textContent);
          };

          button.addEventListener('drop', function (event) {
            event.preventDefault();
            data = event.dataTransfer.getData('text');
            content = event.dataTransfer.getData('content');
            console.log('dragDrop ' + content);
            setTimeout(() => {
              if (grid[i][j] == 0) {
                grid[i][j] = content;
              }
            }, 0);
          });

          button.addEventListener("dragover", dragOver);
          button.addEventListener("dragenter", dragEnter);


          button.textContent = grid[i][j] === "" ? 0 : grid[i][j].toString();
          newGrid.appendChild(button);

          if (grid[i][j] == 0) {
            button.classList.add("dropZone");
          }
        }
      }
    }
    document.querySelector(".grid").replaceWith(newGrid);

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
      document.querySelector(".message").textContent = `Ура! Вы выиграли, за ${time} сек.`;
    } else {
      document.querySelector(".message").textContent = "";
      growing.innerHTML = "";
    }
  }
}


const GAME = Game.ready();