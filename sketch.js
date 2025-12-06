// Quadtree Point class
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Quadtree Rectangle class
class Rectangle {
    constructor(x, y, width, height, color = [255, 255, 255]) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color; // RGB array, default is white [255, 255, 255]
    }
    
    contains(point) {
        return (point.x >= this.x &&
                point.x <= this.x + this.width &&
                point.y >= this.y &&
                point.y <= this.y + this.height);
    }
    
    intersects(range) {
        return !(range.x > this.x + this.width ||
                 range.x + range.width < this.x ||
                 range.y > this.y + this.height ||
                 range.y + range.height < this.y);
    }
}

// Quadtree class
class Quadtree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }
    
    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.width / 2;
        const h = this.boundary.height / 2;
        
        // Generate random color for each subdivided rectangle
        const randomColor = () => random() > 0.5 ? [255, 255, 255] : [0, 0, 0];
        
        const ne = new Rectangle(x + w, y, w, h, randomColor());
        this.northeast = new Quadtree(ne, this.capacity);
        
        const nw = new Rectangle(x, y, w, h, randomColor());
        this.northwest = new Quadtree(nw, this.capacity);
        
        const se = new Rectangle(x + w, y + h, w, h, randomColor());
        this.southeast = new Quadtree(se, this.capacity);
        
        const sw = new Rectangle(x, y + h, w, h, randomColor());
        this.southwest = new Quadtree(sw, this.capacity);
        
        this.divided = true;
    }
    
    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }
        
        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }
        
        if (!this.divided) {
            this.subdivide();
        }
        
        return (this.northeast.insert(point) ||
                this.northwest.insert(point) ||
                this.southeast.insert(point) ||
                this.southwest.insert(point));
    }
    
    query(range, found) {
        if (!found) {
            found = [];
        }
        
        if (!this.boundary.intersects(range)) {
            return found;
        }
        
        for (let p of this.points) {
            if (range.contains(p)) {
                found.push(p);
            }
        }
        
        if (this.divided) {
            this.northwest.query(range, found);
            this.northeast.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }
        
        return found;
    }

    flip() {
        // Flip boundary y coordinate
        const canvasHeight = 600;
        this.boundary.y = canvasHeight - this.boundary.y - this.boundary.height;
        
        // Flip points' y coordinates
        for (let p of this.points) {
            p.y = canvasHeight - p.y;
        }
        
        // Recursively flip child quadrants if they exist
        if (this.divided) {
            this.northeast.flip();
            this.northwest.flip();
            this.southeast.flip();
            this.southwest.flip();
        }
    }
}

// p5.js sketch
let quadtree;
const NUM_POINTS = 31;
const CAPACITY = 4;

function setup() {
    const canvasWidth = 800;
    const canvasHeight = 600;
    const container = document.getElementById('sketch-container');
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('sketch-container');
    
    // Initialize quadtree with random color (white or black)
    const randomColor = random() > 0.5 ? [255, 255, 255] : [0, 0, 0]; // Random white or black
    const boundary = new Rectangle(0, 0, canvasWidth, canvasHeight, randomColor);
    quadtree = new Quadtree(boundary, CAPACITY);
    
    // Generate random points
    for (let i = 0; i < NUM_POINTS; i++) {
        const x = random(canvasWidth);
        const y = random(canvasHeight);
        console.log(`Generated point: (${x.toFixed(2)}, ${y.toFixed(2)})`);
        const point = new Point(x, y);
        quadtree.insert(point);
    }
}

function draw() {
    background(240);
    
    // Draw quadtree boundaries
    stroke(150);
    strokeWeight(1);
    noFill();
    drawBoundaries(quadtree);
    
    // Draw all points from quadtree
    fill(100);
    stroke(100);
    strokeWeight(2);
    
    drawPoints(quadtree);
    
    // Draw query range when mouse is moved
    if (mouseIsPressed) {
        const queryRange = new Rectangle(mouseX - 50, mouseY - 50, 100, 100);
        const found = quadtree.query(queryRange);
        
        // Highlight query range
        stroke(255, 0, 0);
        strokeWeight(2);
        noFill();
        rect(queryRange.x, queryRange.y, queryRange.width, queryRange.height);
        
        // Highlight found points
        fill(255, 0, 0);
        for (let p of found) {
            circle(p.x, p.y, 6);
        }
        
        // Display count
        fill(0);
        textSize(16);
        text(`Found: ${found.length}`, 10, height - 10);
    } else {
        // Display instructions
        fill(0);
        textSize(14);
        text('Click and drag to query points', 10, height - 10);
    }
    
    // Display mouse coordinates
    fill(0);
    textSize(14);
    text(`Mouse: (${Math.floor(mouseX)}, ${Math.floor(mouseY)})`, 10, 20);
}

function drawPoints(node) {
    for (let p of node.points) {
        circle(p.x, p.y, 4);
    }
    
    if (node.divided) {
        drawPoints(node.northeast);
        drawPoints(node.northwest);
        drawPoints(node.southeast);
        drawPoints(node.southwest);
    }
}

function drawBoundaries(node) {
    const b = node.boundary;
    
    // Fill with rectangle color
    fill(b.color[0], b.color[1], b.color[2]);
    stroke(150);
    strokeWeight(1);
    rect(b.x, b.y, b.width, b.height);
    
    if (node.divided) {
        drawBoundaries(node.northeast);
        drawBoundaries(node.northwest);
        drawBoundaries(node.southeast);
        drawBoundaries(node.southwest);
    }
}

function flipQuadtree() {
    console.log("Flip button clicked!");
    console.log("Before flip - NE color:", quadtree.northeast.boundary.color);
    console.log("Before flip - SE color:", quadtree.southeast.boundary.color);
    quadtree.flip();
    console.log("After flip - NE color:", quadtree.northeast.boundary.color);
    console.log("After flip - SE color:", quadtree.southeast.boundary.color);
}
