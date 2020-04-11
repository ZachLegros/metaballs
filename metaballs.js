const width = 900;
const height = 800;
const minSpeed = 1;
const maxSpeed = 2;
const entities = 10;
const maxSize = 85;
const minSize = 25;
let blobs = [];
const res = 5;

// vector definition
class RandSpeedVec {
  constructor(r) {
    const coef = (r / (4 * maxSpeed));
    const xSign = Math.random() < 0.5 ? -1 : 1;
    const ySign = Math.random() < 0.5 ? -1 : 1;
    this.x = xSign * (Math.random() * (maxSpeed - minSpeed) + minSpeed) / coef;
    this.y = ySign * (Math.random() * (maxSpeed - minSpeed) + minSpeed) / coef;
  }
}

// blob definition
class Blob {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vel = new RandSpeedVec(r);
    this.show = () => {
      noFill();
      stroke('red');
      strokeWeight(2);
      ellipse(this.x, this.y, this.r * 2, this.r * 3);
    };
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
}

// grid definition
class Grid {
  constructor() {
    this.cells = [];
    this.nodes = [];
    this.update = () => {
      for (var k = 0; k < this.nodes.length; k++) {
        this.nodes[k].forEach(node => {
          node.update();
          //node.show();
        });
      }
      for (var l = 0; l < this.cells.length; l++) {
        this.cells[l].forEach(cell => {
          cell.update();
          //cell.show();
        });
      }
    };
  }
}

// helpers for Cell
function getDirection(cornerPos, cellOrigin) {
  let coeff = 0;
  if (cornerPos > cellOrigin) {
    coeff = -1;
  } else {
    coeff = 1;
  }
  return coeff;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// helper 
function findClosestPointFromMe(me, pointArray) {
  let dists = [];
  pointArray.forEach(point => {
    dists.push(dist(me.x, me.y, point.x, point.y));
  });
  return pointArray[dists.indexOf(Math.min(...dists))];
}

// cell definition
class Cell {
  constructor(x, y, corners) {
    this.x = x;
    this.y = y;
    this.corners = corners;
    this.show = () => {
      noFill();
      stroke('blue');
      strokeWeight(0.5);
      square(this.x, this.y, res);
    };
    this.getArcTask = () => {
      // arcToDo = [[[first link],[second link]]]
      let arcToDo = [
        []
      ];
      let tasks = 0;
      let activeCount = 0;
      this.corners.forEach(corner => {
        if (corner.active == false) {
          let horizNeighbourX = corner.x + (getDirection(corner.x, this.x) * res);
          let horizNeighbour = getNode(horizNeighbourX / res, corner.y / res);
          let vertNeighbourY = corner.y + (getDirection(corner.y, this.y) * res);
          let vertNeighbour = getNode(corner.x / res, vertNeighbourY / res);
          if (arcToDo.length != tasks + 1) {
            arcToDo.push([]);
          }
          if (horizNeighbour.active == true && vertNeighbour.active == true) {
            arcToDo[tasks].push([corner, horizNeighbour]);
            arcToDo[tasks].push([corner, vertNeighbour]);
            tasks += 1;
          }
          else {
            if (horizNeighbour.active == true) {
              arcToDo[tasks].push([corner, horizNeighbour]);
            }
            if (vertNeighbour.active == true) {
              arcToDo[tasks].push([corner, vertNeighbour]);
            }
          }
        }
        else {
          activeCount += 1;
        }
      });
      return arcToDo;
    };
    // returns a Point object 
    // link = [unactive cell, active cell]
    this.createPointFromLink = link => {
      let unactive = link[0];
      let active = link[1];
      let tempX = null;
      let tempY = null;
      if (link[0].x == link[1].x) {
        tempX = link[0].x;
      }
      else if (link[0].y == link[1].y) {
        tempY = link[0].y;
      }
      if (tempY == null) {
        tempY = unactive.y + ((active.y - unactive.y) * ((1 - unactive.sum) / (active.sum - unactive.sum)));
      }
      else if (tempX == null) {
        tempX = unactive.x + ((active.x - unactive.x) * ((1 - unactive.sum) / (active.sum - unactive.sum)));
      }
      return new Point(tempX, tempY);
    };
    // arcToDo = [[[first link],[second link]]]
    this.update = () => {
      let arcToDo = this.getArcTask();
      let activeCorners = [];
      this.corners.forEach(corner => {
        if (corner.active == true) {
          activeCorners.push(corner);
        }
      });
      if (arcToDo[0].length != 0) {
        for (let task = 0; task < arcToDo.length; task++) {
          let points = [];
          for (let link = 0; link < 2; link++) {
            let point = this.createPointFromLink(arcToDo[task][link]);
            points.push(point);
          }
          stroke('red');
          strokeWeight(1);
          line(points[0].x, points[0].y, points[1].x, points[1].y);
        }
      }
    };
  }
}

// node definition
class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.active = false;
    this.sum = 0;
    this.update = () => {
      this.sum = 0;
      blobs.forEach(blob => {
        this.sum = this.sum + (Math.pow(blob.r, 2) / (Math.pow(this.x - blob.x, 2) + Math.pow(this.y - blob.y, 2)));
      });
      if (this.sum >= 1) {
        this.active = true;
      }
      else {
        this.active = false;
      }
    };
    this.show = () => {
      noStroke();
      if (this.active === true) {
        fill('red');
      }
      else {
        fill('blue');
      }
      circle(this.x, this.y, 3);
    };
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
      // get corners [topLeft, topRight, bottomLeft, bottomRight]
      let corners = [newGrid.nodes[cellX][cellY], newGrid.nodes[cellX + 1][cellY], newGrid.nodes[cellX][cellY + 1], newGrid.nodes[cellX + 1][cellY + 1]];
      // create cell
      newGrid.cells[cellX].push(new Cell((cellX * res), (cellY * res), corners));
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
let grid;

// grid helper 
function getNode(x, y) {
  return grid.nodes[x][y];
}


function setup() {
  createCanvas(width, height);
  createBlobs();
  grid = createGrid(res);
}

function draw() {
  clear();
  background(51);

  blobs.map(blob => {
    blob.update();
  });

  grid.update();
}