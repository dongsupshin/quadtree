// Example usage:
const Point = require('./quadtree');
const p1 = new Point(3, 4);
const p2 = new Point(0, 0);
console.log(p1.distanceTo(p2)); // Outputs: 5
console.log(p1.toString()); // Outputs: (3, 4)