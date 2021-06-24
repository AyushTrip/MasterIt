let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
// TODO: I think this should be a property, actually.
let nodesMoving = 0;
let mouseX = 0;
let mouseY = 0;
let goingUp = false;

const NUM_EDGES = 8;
const DISTANCE = 200;
const DECAY_RATE = 10;

let nodes = {
	center: null,
	edges: [],
	parent: null
};
let objectives = {
    info: {
      name: "AP CS Principles",
      type: "Course",
      number: "1",
      id: "1"
    },
    children: [
      {
        info: {
          name: "Programming",
          type: "Unit",
          number: "1",
          id: "1.1"
        },
        children: [
          {
            info: {
              name: "Organizing Data",
              type: "Enduring Understanding",
              number: "A1",
              id: "1.1.1"
            },
            children: [
              {
                info: {
                  name: "Variables and Assignments",
                  type: "Topic",
                  number: "3.1",
                  id: "1.1.1.1"
                },
                children: []
              },
              {
                info: {
                  name: "Data Abstraction",
                  type: "Topic",
                  number: "3.2",
                  id: "1.1.1.2"
                },
                children: []
              }
            ]
          },
          {
            info: {
              name: "Combining Statements",
              type: "Enduring Understanding",
              number: "A2",
              id: "1.1.2"
            },
            children: [
              {
                info: {
                  name: "Mathematical Expressions",
                  type: "Topic",
                  number: "3.3",
                  id: "1.1.2.1"
                },
                children: []
              },
              {
                info: {
                  name: "Strings",
                  type: "Topic",
                  number: "3.4",
                  id: "1.1.2.2"
                },
                children: []
              },
              {
                info: {
                  name: "Boolean Expressions",
                  type: "Topic",
                  number: "3.5",
                  id: "1.1.2.3"
                },
                children: []
              },
              {
                info: {
                  name: "Conditionals",
                  type: "Topic",
                  number: "3.6",
                  id: "1.1.2.4"
                },
                children: []
              },
              {
                info: {
                  name: "Nested Conditionals",
                  type: "Topic",
                  number: "3.7",
                  id: "1.1.2.5"
                },
                children: []
              },
              {
                info: {
                  name: "Iteration",
                  type: "Topic",
                  number: "3.8",
                  id: "1.1.2.6"
                },
                children: []
              },
              {
                info: {
                  name: "Developing Algorithms",
                  type: "Topic",
                  number: "3.9",
                  id: "1.1.2.7"
                },
                children: []
              },
              {
                info: {
                  name: "Lists",
                  type: "Topic",
                  number: "3.10",
                  id: "1.1.2.8"
                },
                children: []
              },
              {
                info: {
                  name: "Binary Search",
                  type: "Topic",
                  number: "3.11",
                  id: "1.1.2.9"
                },
                children: []
              }
            ]
          },
          {
            info: {
              name: "Procedures",
              type: "Enduring Understanding",
              number: "A3",
              id: "1.1.3"
            },
            children: []
          },
          {
            info: {
              name: "Undecidable Problems",
              type: "Enduring Understanding",
              number: "A4",
              id: "1.1.4"
            },
            children: []
          },
          {
            info: {
              name: "Solution Design",
              type: "Skill",
              number: "1",
              id: "1.1.5"
            },
            children: []
          },
          {
            info: {
              name: "Algorithms",
              type: "Skill",
              number: "2",
              id: "1.1.6"
            },
            children: []
          },
          {
            info: {
              name: "Abstraction",
              type: "Skill",
              number: "3",
              id: "1.1.7"
            },
            children: []
          },
          {
            info: {
              name: "Code Analysis",
              type: "Skill",
              number: "4",
              id: "1.1.8"
            },
            children: []
          }
        ]
      },
      {
        info: {
          name: "Data",
          type: "Unit",
          number: 2,
          id: "1.2"
        }
      }
    ]
  };

let currentCenter = objectives; // TODO: move these to the top? Can currentCenter be null by default?
let contextMenu = { // TODO: should I make this an object literal or a class? There's only going to be one...
	x: 0,
	y: 0,
	size: 100,
	showing: false,
	draw: () => {
		ctx.fillStyle = 'red';
		ctx.fillRect(contextMenu.x, contextMenu.y, contextMenu.size, contextMenu.size);
	},
	update: () => {return;}
}



class Node {
	constructor(info, color, size, x, y) {
		this.info = info;
		this.color = color;
		this.size = size;
		this.x = x;
		this.y = y;
		this.state = "returning";
		if (this.info.type === "Skill") {
			this.shape = "square";
		} else {
			this.shape = "circle";
		}
	}

	drawNode() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		if (this.shape === 'circle') {
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
		} else {
			ctx.fillRect(this.x - this.size,
				     this.y - this.size,
				     this.size * 2, this.size * 2);
		}
		ctx.closePath();
		ctx.fill();
	}

	drawInfo() {
		ctx.fillStyle = 'black';
		ctx.font = '15px arial';
		ctx.textAlign = 'center';

		if (this.info.name.indexOf(' ') === -1) { // one-word titles
			ctx.textBaseline = 'middle';
			ctx.fillText(this.info.name, this.x, this.y);
		} else { // two-word titles
			const first = this.info.name.substring(0, this.info.name.indexOf(' '));
			const second = this.info.name.substring(this.info.name.indexOf(' ') + 1, this.info.name.length);
			ctx.textBaseline = 'bottom';
			ctx.fillText(first, this.x, this.y);
			ctx.textBaseline = 'top';
			ctx.fillText(second, this.x, this.y);
		}

		// write code
		// TODO: This doesn't work right for Parent since x and y are offset
		let code = this.info.type.match(/[A-Z]/g).join(''); // All uppercase letters in type
		if(code.length > 1) {
			code += " ";
		}
		code += this.info.number;
		ctx.textBaseline = 'top';
		ctx.font = '10px arial';
		ctx.fillText(code, this.x, this.y - (this.size * 0.9));
	}
}

class Edge extends Node {
	constructor(info, color, size, angle, x, y) {
		super(info, color, size, x, y);
		this.angle = angle;
	}

	draw() {
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(nodes.center.x, nodes.center.y); // TODO: Generalize this for next layer of mind map
		ctx.closePath();
		ctx.fillStyle = 'black';
		ctx.stroke();

		super.drawNode();
		super.drawInfo();
	}

	update() {
		if (this.state === "dragging") {
			this.y = mouseY;
			this.x = mouseX;
		} else if (this.state === "returning") {
			let finalX = DISTANCE * (Math.cos(this.angle));
			let finalY = DISTANCE * (Math.sin(this.angle));
			this.x += (finalX - this.x) / DECAY_RATE;
			this.y += (finalY - this.y) / DECAY_RATE;
			if ((this.x - finalX)**2 < 1 && (this.y - finalY)**2 < 1) { // close enough
				nodesMoving -= 1;
				this.state = "still";
				this.x = finalX;
				this.y = finalY;
			}
		}
	}
}

// TODO: maybe make Center the default behavior for Node? Think about how update would work in Parent...
class Center extends Node {
	constructor(info, color, size, x, y) {
		super(info, color, size, x, y);
	}

	draw() {
		super.drawNode();
		super.drawInfo();
	}

	update() { // TODO: if the center is going to be stuck, it doesn't need all this
		if (this.state === "dragging") {
			this.y = mouseY;
			this.x = mouseX;
		} else if (this.state === "returning") {
			this.x -= this.x / DECAY_RATE; // go back to the middle
			this.y -= this.y / DECAY_RATE;
			if (this.x**2 < 1 && this.y**2 < 1) {
				nodesMoving -= 1;
				this.state = "stuck";
				this.x = 0;
				this.y = 0;
			}
		}
	}
}

class Parent extends Node {
	constructor(info, color, size, x, y) {
		super(info, color, size, x, y);
	}

	draw() {
		super.drawNode();

		// new drawInfo
		this.y += 17;
		this.x += 2;
		ctx.fillStyle = 'black';
		ctx.font = '15px arial';
		ctx.textAlign = 'left';

		if (this.info.name.indexOf(' ') === -1) { // one-word titles
			ctx.textBaseline = 'middle';
			ctx.fillText(this.info.name, this.x, this.y);
		} else { // two-word titles
			const first = this.info.name.substring(0, this.info.name.indexOf(' '));
			const second = this.info.name.substring(this.info.name.indexOf(' ') + 1, this.info.name.length);
			ctx.textBaseline = 'bottom';
			ctx.fillText(first, this.x, this.y);
			ctx.textBaseline = 'top';
			ctx.fillText(second, this.x, this.y);
		}

		this.y -= 17;
		this.x -= 2;
	}

	// TODO: isn't stuck the same as still at this point?
	update() {
		if (this.state === "stuck") {
			return;
		} else if (this.state === "returning") {
			let finalX = -canvas.width / 2;
			let finalY = -canvas.height / 2; // top-right
			this.x += (finalX - this.x) / DECAY_RATE;
			this.y += (finalY - this.y) / DECAY_RATE;
			if ((this.x - finalX)**2 < 1 && (this.y - finalY)**2 < 1) { // close enough
				nodesMoving -= 1;
				this.state = "stuck";
				this.x = finalX;
				this.y = finalY;
			}
		}
	}
}




// TODO: change init and loop to match Node inheritance structure
function init() {
	ctx.translate(canvas.width / 2, canvas.height / 2); // sets (0,0) to the center
	newPage("1.1"); // start with Programming for now
}

function newPage(centerId) {
	// find new Parent and new Center nodes in tree
	let idSegments = centerId.split('.');
	let newParent = objectives;
	for (let i = 1; i < idSegments.length - 1; i++) {	// TODO: Currently, we ignore the course and start at i=1
		newParent = newParent.children[idSegments[i] - 1]; // -1 b/c the ids are 1-indexed
	}
	let newCenter = newParent.children[idSegments[idSegments.length - 1] - 1];

	// reset globals
	nodesMoving = 2;  // 1 parent and 1 center
	nodes.edges = [];

	// set new nodes for this page
	for (let i = 0; i < newCenter.children.length; i++) {
		nodesMoving++;
		nodes.edges.push(new Edge(newCenter.children[i].info, '#03fce8', 50,  //info, color, size,
			(Math.PI * 2) * (i / newCenter.children.length), mouseX, mouseY)); // angle - evenly spreads edges around
	}
	nodes.center = new Center(newCenter.info, '#03fce8', 75, mouseX, mouseY);
	if (goingUp) {
		nodes.parent = new Parent(newParent.info, "#03fce8", 100, -(canvas.width * 0.8), -(canvas.width * 0.8));
	} else {
		nodes.parent = new Parent(newParent.info, "#03fce8", 100, 0, 0);
	}
	goingUp = false;
}


function loop() {
	//if (nodesMoving !== 0) {
		let topNodes = [nodes.center];
		ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);

		for (const node of nodes.edges.concat(nodes.center, nodes.parent)) {
			node.update();
			node.draw();
			if (node.state === "dragging") {
				topNodes.splice(topNodes.length - 1, 0, node); // insert 2nd to last
			} else if (node.state === "returning") {
				topNodes.splice(0, 0, node); // insert to the beginning
			}
		}

		for (const node of topNodes) {
			node.draw();
		}
	//}
	if (contextMenu.showing) {
		contextMenu.draw();
	}
	window.requestAnimationFrame(loop);
}


canvas.addEventListener('mousedown', (event) => {
	contextMenu.showing = false; // TODO: put this inside a position checker
	mouseX = event.layerX - (canvas.width / 2);
	mouseY = event.layerY - (canvas.height / 2); // translate to new coord system

	for (let node of nodes.edges.concat(nodes.parent)) {
		if (Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2) <= node.size) {
			node.color = '#2ac9c7';
			if (node.state === "still") {
				nodesMoving++;
				node.state = "dragging";
			} else if (node.state === "returning" && node instanceof Edge) {
				node.state = "dragging";
			}
			break;
		}
	}
});


canvas.addEventListener('mouseup', (event) => {
	//if (nodesMoving === 0) { return; }
	for (node of nodes.edges.concat(nodes.parent)) {
		node.color = '#03fce8';
		if(node.state === "dragging") {
			node.state = "returning";
			//break;
		}
	}
});

canvas.addEventListener('mouseleave', (event) => {
	//if (nodesMoving === 0) { return; }
	for (node of nodes.edges.concat(nodes.parent)) {
		node.color = '#03fce8';
		if(node.state === "dragging") {
			node.state = "returning";
			//break;
		}
	}
});

canvas.addEventListener('mousemove', (event) => {
	//if (nodesMoving === 0) { return; }
	mouseX = event.layerX - (canvas.width / 2);
	mouseY = event.layerY - (canvas.height / 2); // translate to new coord system
});

canvas.addEventListener('dblclick', (event) => {
	mouseX = event.layerX - (canvas.width / 2);
	mouseY = event.layerY - (canvas.height / 2); // translate to new coord system

	for (let node of nodes.edges.concat(nodes.parent)) {
		if (Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2) <= node.size) {
			if (node.info.id.length !== 1) { // don't do this if you're at the top of the tree
				goingUp = (node.info.id.length < nodes.center.info.id.length) // clicked on parent
				newPage(node.info.id);
				break;
			}
		}
	}
});

canvas.addEventListener('contextmenu', (event) => {
	mouseX = event.layerX - (canvas.width / 2);
	mouseY = event.layerY - (canvas.height / 2); // translate to new coord system

	if (Math.sqrt((nodes.center.x - mouseX) ** 2 + (nodes.center.y - mouseY) ** 2) <= nodes.center.size) {
		event.preventDefault();
		contextMenu.x = mouseX;
		contextMenu.y = mouseY;
		contextMenu.showing = true;
	}
});
