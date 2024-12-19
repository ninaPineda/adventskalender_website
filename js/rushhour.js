class Animator {
  static animate({
    duration = 100,
    timingFunction = (t) => t,
    onFrame,
    onEnd,
  }) {
    // Inspired from https://javascript.info/js-animation

    let startTime;
    requestAnimationFrame(function run(currentTime) {
      if (startTime === undefined) {
        startTime = currentTime;
      }

      const ellapsedMillis = currentTime - startTime;
      let timeFraction = ellapsedMillis / duration; // [0..1]
      if (timeFraction > 1) {
        timeFraction = 1;
      }

      // calculate the current animation state
      const progress = timingFunction(timeFraction);

      if (onFrame) {
        onFrame(progress);
      }

      if (timeFraction < 1) {
        requestAnimationFrame(run);
      } else {
        if (onEnd) {
          onEnd();
        }
      }
    });
  }
}

class Block {
  constructor({
    shape = [
      [1],
    ],
    x = 0,
    y = 0,
    possibleMoves = Direction.none(),
    possibleOverlaps = [],
    selectable = true,
    color = null,
    image = null,
    tag = null,
  } = {}) {
    this.shape = shape;
    this.cols = this.shape.reduce((acc, curr) => max(acc, curr.length), 0);
    this.rows = this.shape.length;
    this.x = x;
    this.y = y;
    this.possibleMoves = possibleMoves;
    this.possibleOverlaps = possibleOverlaps;
    this.selectable = selectable;
    this.color = color;
    this.image = image;
    this.tag = tag;
  }

  *shapeCoords() {
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        if (this.shape[y][x] === 1) {
          yield [this.x + x, this.y + y];
        }
      }
    }
  }

  containsCoord(x, y) {
    for (let [bx, by] of this.shapeCoords()) {
      if (x === bx && y === by) {
        return true;
      }
    }
    return false;
  }

  move(direction) {
    this.x += direction.dx;
    this.y += direction.dy;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  cannotOverlapWith(other) {
    return !this.possibleOverlaps.includes(other);
  }

  overlapsWith(other, dx = 0, dy = 0) {
    for (let [x, y] of this.shapeCoords()) {
      for (let [ox, oy] of other.shapeCoords()) {
        if (x === (ox + dx) && y === (oy + dy)) {
          return true;
        }
      }
    }
    return false;
  }
}

class Board {
  constructor({
    cols = 6,
    rows = 6,
    animate = true,
    color = null,
    image = null,
  } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.blocks = [];
    this.selectedBlock = null;
    this.pressedPoint = null;
    this.animate = animate;
    this.animationRunning = false;
    this.color = color;
    this.image = image;
    this.callbacks = {
      move: [],
      continuousMove: [],
      animation: [],
    };
    this.savedPositions = null;
  }

  savePositions() {
    this.savedPositions = new Map();
    for (let block of this.blocks) {
      this.savedPositions.set(block, {
        x: block.x,
        y: block.y,
      });
    }
  }

  restorePositions() {
    for (let block of this.blocks) {
      const {
        x,
        y,
      } = this.savedPositions.get(block);
      block.setPosition(x, y);
    }
  }

  addBlock(block) {
    this.blocks.push(block);
  }

  findBlocksWithTag(tag) {
    return this.blocks.filter((b) => b.tag === tag);
  }

  on(event, callback) {
    if (this.callbacks[event] === undefined) {
      console.warn(
        `'${event}' is not an event of the Board class. Valid events are ${
          Object.keys(this.callbacks).join(", ")
        }.`,
      );
      return;
    }
    this.callbacks[event].push(callback);
  }

  fireEvent(event, ...args) {
    this.callbacks[event].forEach((cb) => cb(...args));
  }

  blockAtCoord(x, y) {
    for (let block of this.blocks) {
      if (block.selectable && block.containsCoord(x, y)) {
        return block;
      }
    }
    return null;
  }

  // Mouse pressed on a block : select this block
  // Mouse dragged to another point : this point is the target that the selected block must follow, one step by one, each step taking the same amount of time.
  // Reference for the animation of the movements : https://www.youtube.com/watch?v=aJzu2rblcYg&ab_channel=GameLoc

  mousePressed(x, y) {
    x = floor(x);
    y = floor(y);

    this.pressedPoint = {
      x,
      y,
    };

    const block = this.blockAtCoord(x, y);
    if (block) {
      this.selectedBlock = block;
    }

    this.movesSincePressed = 0;
  }

  mouseDragged(x, y) {
    if (!this.pressedPoint || !this.selectedBlock) {
      return;
    }
    x = floor(x);
    y = floor(y);

    const draggedX = x - this.pressedPoint.x;
    const draggedY = y - this.pressedPoint.y;

    const diffX = round(draggedX);
    const diffY = round(draggedY);

    if (diffX === 0 && diffY === 0) {
      return;
    }

    // Choosing between a horizontal or vertical move, constrained to 1 unit
    let dx = 0;
    let dy = 0;
    if (abs(draggedX) > abs(draggedY)) {
      dx = constrain(diffX, -1, 1);
    } else {
      dy = constrain(diffY, -1, 1);
    }

    let direction = Direction.from(dx, dy);
    if (direction !== null) {
      if (this.tryMoveSelectedBlock(direction)) {
        // if I move the selected block by (dx, 0) or (dy, 0), I must
        // move 'this.pressedPoint' towards the same direction
        this.pressedPoint.x += dx;
        this.pressedPoint.y += dy;
      }
    } else {
      console.warn(
        "direction is null (should't be)",
        draggedX,
        draggedY,
        diffX,
        diffY,
        dx,
        dy,
      );
    }
  }

  mouseReleased() {
    if (this.selectedBlock !== null) {
      if (this.movesSincePressed > 0 || this.animationRunning) {
        this.fireEvent("continuousMove", this.selectedBlock);
      }
      this.selectedBlock = null;
    }
  }

  tryMoveSelectedBlock(direction) {
    if (this.animationRunning || !this.selectedBlock) {
      return false;
    }

    // Checking if direction if allowed for this block
    if (!this.selectedBlock.possibleMoves.includes(direction)) {
      return false;
    }

    // Checking if move is valid
    const {
      dx,
      dy,
    } = direction;
    for (let other of this.blocks) {
      if (
        other !== this.selectedBlock &&
        other.overlapsWith(this.selectedBlock, dx, dy) &&
        this.selectedBlock.cannotOverlapWith(other)
      ) {
        return false;
      }
    }

    if (this.animate) {
      // With animation
      const { x, y } = this.selectedBlock;
      const animatedBlock = this.selectedBlock;

      this.animationRunning = true;
      Animator.animate({
        duration: 50,
        onFrame: (progress) => {
          animatedBlock.x = lerp(x, x + dx, progress);
          animatedBlock.y = lerp(y, y + dy, progress);
          this.callbacks.animation.forEach((cb) => cb(animatedBlock));
        },
        onEnd: () => {
          this.animationRunning = false;
          this.movesSincePressed += 1;
          this.fireEvent("move", animatedBlock);

          // Gewinn-Check hier einfügen
          if (
            animatedBlock.tag === "red" &&
            animatedBlock.x === this.cols - animatedBlock.cols
          ) {
            console.log("Gewonnen! 🎉");
            rightAnswer();
          }
        },
      });
    } else {
      // Without animation
      this.selectedBlock.move(direction);
      this.movesSincePressed += 1;
      this.fireEvent("move", this.selectedBlock);

      // Gewinn-Check hier einfügen
      if (
        this.selectedBlock.tag === "red" &&
        this.selectedBlock.x === this.cols - this.selectedBlock.cols
      ) {
        console.log("Gewonnen! 🎉");
        rightAnswer();
      }
    }

    return true;
  }
}

class Direction {
  constructor(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }

  static all() {
    return [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
  }

  static vertical() {
    return [Direction.UP, Direction.DOWN];
  }

  static horizontal() {
    return [Direction.LEFT, Direction.RIGHT];
  }

  static none() {
    return [];
  }

  static from(dx, dy) {
    for (let dir of this.all()) {
      if (dir.dx === dx && dir.dy === dy) {
        return dir;
      }
    }
    return null;
  }
}

Direction.UP = new Direction(0, -1);
Direction.DOWN = new Direction(0, 1);
Direction.LEFT = new Direction(-1, 0);
Direction.RIGHT = new Direction(1, 0);

class CanvasDisplay {
  constructor(board, parentId) {
    this.board = board;

    const container = document.getElementById("canvas-container");

    // Breite und Höhe des Containers ermitteln
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Berechne die Verhältnisse
    const widthRatio = containerWidth / board.cols;
    const heightRatio = containerHeight / board.rows;

    if (widthRatio > heightRatio) {
      this.unit = floor(containerWidth / board.rows);
    } else {
      this.unit = floor(containerHeight / board.cols);
    }

    // const maxWidth = min(windowWidth, windowHeight);
    // this.unit = floor(maxWidth / board.cols);

    createCanvas(
      board.cols * this.unit,
      board.rows * this.unit,
    ).parent(parentId);
  }

  show() {
    if (this.board.image) {
      image(
        this.board.image,
        0,
        0,
        this.board.cols * this.unit,
        this.board.rows * this.unit,
      );
    } else {
      clear();
    }

    const board = this.board;

    if (board.color !== null) {
      background(board.color);
    }

    for (let block of board.blocks) {
      this.showBlock(block);
    }
  }

  showBlock(block) {
    const unit = this.unit;

    if (block.color !== null) {
      const inside = unit * 0.8;

      noStroke();

      for (let [x, y] of block.shapeCoords()) {
        fill(block.color);
        square(x * unit, y * unit, unit);
        fill(0, 25);
        square(x * unit + inside, y * unit + inside, unit - 2 * inside);
      }

      if (block.selectable) {
        // Contour of block
        stroke(0, 0, 0, 150);
        strokeWeight(unit * 0.04);
        rect(
          block.x * unit,
          block.y * unit,
          block.cols * unit,
          block.rows * unit,
        );
      }
    }

    if (block.image != null) {
      image(
        block.image,
        block.x * unit,
        block.y * unit,
        block.cols * unit,
        block.rows * unit,
      );
    }
  }
}

function createCarsBoard(maxWidth) {
  const vertCar = [
    [1],
    [1],
  ];
  const horiCar = [
    [1, 1],
  ];

  const vertTruck = [
    [1],
    [1],
    [1],
  ];
  const horiTruck = [
    [1, 1, 1],
  ];

  const cars = [
    new Block({
      x: 3,
      y: 1,
      shape: vertCar,
      color: "#78B53E", // light green
      possibleMoves: Direction.vertical(),
    }),

    new Block({
      x: 4,
      y: 1,
      shape: horiTruck,
      color: "#FFC600", // yellow
      possibleMoves: Direction.horizontal(),
    }),

    new Block({
      x: 1,
      y: 2,
      shape: vertCar,
      color: "#FF8601", // orange
      possibleMoves: Direction.vertical(),
    }),

    new Block({
      x: 4,
      y: 2,
      shape: vertTruck,
      color: "#AE7ACF", // light purple
      possibleMoves: Direction.vertical(),
    }),

    new Block({
      x: 5,
      y: 2,
      shape: horiCar,
      color: "#45B5FF", // light blue
      possibleMoves: Direction.horizontal(),
    }),

    new Block({
      x: 2,
      y: 3,
      shape: horiCar,
      color: "#FA3800", // red
      possibleMoves: Direction.horizontal(),
      tag: "red",
    }),

    new Block({
      x: 2,
      y: 4,
      shape: vertCar,
      color: "#FD8D9D", // pink
      possibleMoves: Direction.vertical(),
    }),

    new Block({
      x: 5,
      y: 4,
      shape: horiCar,
      color: "#6551C0", // dark purple
      possibleMoves: Direction.horizontal(),
    }),

    new Block({
      x: 1,
      y: 5,
      shape: vertCar,
      color: "#1D831F", // dark green
      possibleMoves: Direction.vertical(),
    }),

    new Block({
      x: 3,
      y: 5,
      shape: horiCar,
      color: "#233444", // dark grey
      possibleMoves: Direction.horizontal(),
    }),

    new Block({
      x: 6,
      y: 5,
      shape: vertCar,
      color: "#D0B75D", // dark blue
      possibleMoves: Direction.vertical(),
    }),

    new Block({
      x: 2,
      y: 6,
      shape: horiTruck,
      color: "#2D69D9", // beige
      possibleMoves: Direction.horizontal(),
    }),
  ];

  const boundaries = new Block({
    x: 0,
    y: 0,
    shape: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    color: "DarkSlateGrey",
    selectable: false,
  });

  const board = new Board({
    cols: 9,
    rows: 8,
    color: "#131A1A",
  });

  board.addBlock(boundaries);
  cars.forEach((car) => board.addBlock(car));

  return board;
}

let board;
let display;
let moves = 0;

function preload() {
  const params = getURLParams();
  board = createCarsBoard();
}

function setup() {
  display = new CanvasDisplay(board, "canvas-container");

  noLoop();
  redraw();

  board.on("animation", (block) => redraw());
  board.on("continuousMove", (block) => {
    moves++;
    redraw();
  });
}

function draw() {
  display.show();

  const unit = display.unit;

  fill("#131A1A");
  stroke("#000000");
  rect(width / 2 - unit / 2, unit / 3, unit, unit / 3);

  textAlign(RIGHT, CENTER);
  textSize(display.unit * 0.3);
  textFont("monospace");
  fill("#3EA3E6");
  noStroke();
  text(moves, width / 2 + unit * 0.4, unit * 0.52);
}

function mousePressed() {
  board.mousePressed(mouseX / display.unit, mouseY / display.unit);
}

function mouseDragged() {
  board.mouseDragged(mouseX / display.unit, mouseY / display.unit);
}

function mouseReleased() {
  board.mouseReleased();
}

function rightAnswer() {
  if (localStorage.getItem("loggedIn")) {
    const userDataRaw = localStorage.getItem("user");
    let userData;
    try {
      userData = userDataRaw ? JSON.parse(userDataRaw) : null;
    } catch (e) {
      console.error("Fehler beim Parsen von LocalStorage-Daten:", e);
      return;
    }

    if (!userData) {
      console.error("Benutzerdaten nicht gefunden.");
      return;
    }

    showPopup(
      "Super du hast dieses Rätsel mit " + userData.tries +
        " Versuchen gelöst.",
      "successPopup",
    );

    //Daten aktualisieren
    userData.finishedRiddles = userData.currentRiddle;
    userData.allTries = userData.allTries + userData.tries;
    userData.tries = 1;

    // Speichere aktualisierte Daten
    localStorage.setItem("user", JSON.stringify(userData));
  } else {
    console.error("Benutzer ist nicht eingeloggt.");
  }

  // Weiterleitung zur Home-Seite
}

// Funktion, um das Popup zu zeigen
function showPopup(message, id) {
  const popup = document.getElementById(id);
  const popupMessage = document.getElementById("popupMessage");
  popupMessage.textContent = message; // Nachricht setzen
  popup.style.display = "flex"; // Popup sichtbar machen
}

// Funktion, um das Popup zu schließen
function closePopup() {
  const popup = document.getElementById("errorPopup");
  popup.style.display = "none"; // Popup verstecken
}

// Event-Listener für den Schließen-Button
document.getElementById("closePopup").addEventListener("click", closePopup);
