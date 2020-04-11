/* p5.js import not present because I am using the online environment for p5 at the moment. */

const width = 700;
const height = 500;
const minSpeed = 1;
const maxSpeed = 3;
const entities = 8;
const maxSize = 80;
const minSize = 15;
let blobs = [];

// vector definition
const RandSpeedVec = function(r) {
  const coef = (r / (6 * maxSpeed));
  this.x = (Math.random() * (maxSpeed - minSpeed) + minSpeed) / coef;
  this.y = (Math.random() * (maxSpeed - minSpeed) + minSpeed) / coef;
}

// blob definition
const Blob = function(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.vel = new RandSpeedVec(r);

  this.show = () => {
    noFill();
    stroke('red');
    strokeWeight(2);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }

  this.update = () => {
    this.x = this.x + this.vel.x;
    this.y = this.y + this.vel.y;

    if (this.x + this.r > width || this.x - this.r < 0) {
      this.vel.x = this.vel.x * (-1);
    }
    if (this.y + this.r > height || this.y - this.r < 0) {
      this.vel.y = this.vel.y * (-1);
    }
  };
}

// grid definition
const Grid = function() {
  this.cells = [];
  this.nodes = [];

  this.show = () => {
    for (var i = 0; i < this.cells.length; i++) {
      this.cells[i].forEach(cell => {
        cell.show();
      });
    }
    for (var j = 0; j < this.nodes.length; j++) {
      this.nodes[j].forEach(node => {
        node.show();
      });
    }
  }

  this.update = () => {
    for (var k = 0; k < this.nodes.length; k++) {
      this.nodes[k].forEach(node => {
        node.update();
      });
    }
  }
}

// cell deninition
const Cell = function(x, y, res, corners) {
  this.x = x;
  this.y = y;
  this.res = res;
  this.corners = corners;
  
  this.show = () => {
    noFill();
    stroke('blue');
    strokeWeight(1);
    square(this.x - (this.res / 2), this.y - (this.res / 2), this.res);
  }
}

// node definition
const Node = function(x, y) {
  this.x = x;
  this.y = y;
  this.active = false;
  this.sum = 0;

  this.update = () => {
   this.sum = 0;
    blobs.forEach(blob => {
      this.sum = this.sum + (Math.pow(blob.r, 2) / (Math.pow(this.x - blob.x, 2) + Math.pow(this.y - blob.y, 2)))
    });
    if (this.sum >= 1) {
      this.active = true;
    } else {
      this.active = false;
    }
  }

  this.show = () => {
    noStroke();
    if (this.active === true) {
      fill('red');
    } else {
      fill('lime');
    }
    circle(this.x, this.y, 5);
  }
}

// initializer
function createGrid(res) {
  let newGrid = new Grid();

  // numbers of cells X and Y
  const nX = Math.ceil(width / res);
  const nY = Math.ceil(height / res);

  // generate the nodes
  for (var x = 0; x < nX + 1; x++) {
    newGrid.nodes.push([]);
    for (var y = 0; y < nY + 1; y++) {
      newGrid.nodes[x].push(new Node(x * res, y * res));
    }
  }

  // generate the cells and associate the nodes
  for (var cellX = 0; cellX < nX; cellX++) {
    newGrid.cells.push([]);
    for (var cellY = 0; cellY < nY; cellY++) {
      // get corners
      let corners = [newGrid.nodes[cellX][cellY], newGrid.nodes[cellX + 1][cellY], newGrid.nodes[cellX][cellY + 1], newGrid.nodes[cellX + 1][cellY + 1]];
      newGrid.cells[cellX].push(new Cell((cellX * res) + res / 2, (cellY * res) + res / 2, res, corners));
    }
  }

  return newGrid;
}

// initializer
function createBlobs() {
  for (var i = 0; i < entities; i++) {
    var randR = Math.random() * (maxSize - minSize) + minSize;
    var randX = Math.random() * ((width - randR) - randR) + randR;
    var randY = Math.random() * ((height - randR) - randR) + randR;
    blobs.push(new Blob(randX, randY, randR));
  }
}

// global grid
let grid = createGrid(25);

function setup() {
  createCanvas(width, height);
  createBlobs();
  grid.update();
  test = grid.nodes[3][3].active;
}

function draw() {
  clear();
  background(51);

  // debuging grid showing only
  grid.show();
  grid.update();

  blobs.map(blob => {
    blob.show();
    blob.update();
  });

}