// Quadtree Point class
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Quadtree Rectangle class
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
        
        const ne = new Rectangle(x + w, y, w, h);
        this.northeast = new Quadtree(ne, this.capacity);
        
        const nw = new Rectangle(x, y, w, h);
        this.northwest = new Quadtree(nw, this.capacity);
        
        const se = new Rectangle(x + w, y + h, w, h);
        this.southeast = new Quadtree(se, this.capacity);
        
        const sw = new Rectangle(x, y + h, w, h);
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
}

// p5.js sketch
let quadtree;
const NUM_POINTS = 500;
const CAPACITY = 4;

function setup() {
    const canvasWidth = 800;
    const canvasHeight = 600;
    const container = document.getElementById('sketch-container');
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('sketch-container');
    
    // Initialize quadtree
    const boundary = new Rectangle(0, 0, canvasWidth, canvasHeight);
    quadtree = new Quadtree(boundary, CAPACITY);
    
    // Generate random points
    for (let i = 0; i < NUM_POINTS; i++) {
        const x = random(canvasWidth);
        const y = random(canvasHeight);
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
    rect(b.x, b.y, b.width, b.height);
    
    if (node.divided) {
        drawBoundaries(node.northeast);
        drawBoundaries(node.northwest);
        drawBoundaries(node.southeast);
        drawBoundaries(node.southwest);
    }
}
