function Process(size, time) {
	this.size = size;
	this.timeLeft = time;
	this.allocatedBlock = null;
	this.id = processID;

	processID += 1;

	this.isAllocated = function() {
		return this.allocatedBlock != null;
	};

	this.tick = function() {
		this.timeLeft -=1;
	};
};

function MemControlBlock(size) {
	this.size = size;
	this.process = null;
	this.available = true;
	this.next = null;
	this.prev = null;

	this.setProcess = function(process) {
		if (process == null) {
			this.process = null;
			this.available = true;
		} else {
			this.process = process;
			this.available = false;
		};
	};
};

function LinkedList() {
	this.head = null;
	this.size = 0;
	this.lastAllocated = null;

	this.requestAllocationFirstFit = function(process) {
		blockFirstFit = this.head;

		while ((blockFirstFit.size < process.size) || (!blockFirstFit.available)) {
			blockFirstFit = blockFirstFit.next;
			if (blockFirstFit == null) {return false};
		};

		spaceLeftover = blockFirstFit.size - process.size; 

		if (spaceLeftover > 0) {
			newBlock = new MemControlBlock(spaceLeftover);

			nextBlock = blockFirstFit.next;
			if (nextBlock != null) {
				nextBlock.prev = newBlock;
				newBlock.next = nextBlock;
			};

			blockFirstFit.next = newBlock;
			newBlock.prev = blockFirstFit;

			blockFirstFit.size = process.size;
		};

		blockFirstFit.setProcess(process);
		process.allocatedBlock = blockFirstFit;
		this.lastAllocated = blockFirstFit;
		return true;
	};

	this.requestAllocationBestFit = function(process) {
		blockBestFit = this.head;

		while ((blockBestFit.size < process.size) || (!blockBestFit.available)) {
			blockBestFit = blockBestFit.next;
			if (blockBestFit == null) {return false};
		};

		block = blockBestFit.next;
		while (block != null) {
			if ((block.size >= process.size) && (block.available) && (block.size < blockBestFit.size)) {
				blockBestFit = block;
			};
			block = block.next;
		};

		spaceLeftover = blockBestFit.size - process.size;

		if (spaceLeftover > 0) {
			newBlock = new MemControlBlock(spaceLeftover);

			nextBlock = blockBestFit.next;
			if (nextBlock != null) {
				nextBlock.prev = newBlock;
				newBlock.next = nextBlock;
			};

			blockBestFit.next = newBlock;
			newBlock.prev = blockBestFit;

			blockBestFit.size = process.size;
		};

		blockBestFit.setProcess(process);
		process.allocatedBlock = blockBestFit;
		this.lastAllocated = blockBestFit;
		return true;
	};

	this.requestAllocationWorstFit = function(process) {
		blockWorstFit = this.head;

		while ((blockWorstFit.size < process.size) || (!blockWorstFit.available)) {
			blockWorstFit = blockWorstFit.next;
			if (blockWorstFit == null) {return false};
		};

		block = blockWorstFit;
		while (block != null) {
			if ((block.size >= process.size) && (block.available) && (block.size > blockWorstFit.size)) {
				blockWorstFit = block;
			};
			block = block.next;
		};

		spaceLeftover = blockWorstFit.size - process.size;

		if (spaceLeftover > 0) {
			newBlock = new MemControlBlock(spaceLeftover);

			nextBlock = blockWorstFit.next;
			if (nextBlock != null) {
				nextBlock.prev = newBlock;
				newBlock.next = nextBlock;
			};

			blockWorstFit.next = newBlock;
			newBlock.prev = blockWorstFit;

			blockWorstFit.size = process.size;
		};

		blockWorstFit.setProcess(process);
		process.allocatedBlock = blockWorstFit;
		this.lastAllocated = blockWorstFit;
		return true;
	};

	this.requestAllocationNextFit = function(process) {
		
		if (this.lastAllocated == null) {
			this.lastAllocated = this.head;
		}

		blockNextFit = this.lastAllocated;

		while ((blockNextFit.size < process.size) || (!blockNextFit.available)) {
			blockNextFit = blockNextFit.next;
			if (blockNextFit == null) {
				blockNextFit = this.head;
			} else if (blockNextFit == this.lastAllocated) {
				return false;
			}; 
		};

		spaceLeftover = blockNextFit.size - process.size;

		if (spaceLeftover > 0) {
			newBlock = new MemControlBlock(spaceLeftover);

			nextBlock = blockNextFit.next;
			if (nextBlock != null) {
				nextBlock.prev = newBlock;
				newBlock.next = nextBlock;
			};

			blockNextFit.next = newBlock;
			newBlock.prev = blockNextFit;

			blockNextFit.size = process.size;
		};

		blockNextFit.setProcess(process);
		process.allocatedBlock = blockNextFit;
		this.lastAllocated = blockNextFit;
		return true;
	};

	this.deallocateProcess = function(process) {
		process.allocatedBlock.setProcess(null);
		process.allocatedBlock = null;
	};

	this.add = function(block) {
		if (this.head == null) {
			this.head = block;
		} else {
			block.next = this.head;
			this.head.prev = block;
			this.head = block;
		};

		this.size += block.size;
	}

	this.repaint = function() {
		block = this.head;
		memoryDiv.innerHTML = "";

		while (block != null) {
			height = ((block.size/linkedList.size)*100);

			divBlock = document.createElement("div");
			divBlock.style.height = (height + "%");
			divBlock.setAttribute("id", "block");
			if (block.available) {divBlock.className = "available"} else {divBlock.className = "unavailable"};
			memoryDiv.appendChild(divBlock);

			blockLabel = document.createElement("div");
			blockLabel.setAttribute("id", "blockLabel");
			blockLabel.style.height = (height + "%");
			blockLabel.innerHTML = block.size + "K";
			if (height <= 2) {
				blockLabel.style.display = "none";
			};
			divBlock.appendChild(blockLabel);

			block = block.next;
		};
	};
};

document.getElementById("processForm").onsubmit = function () {
	elements = this.elements;

	inProcessSize = elements.namedItem("processSize");
	inProcessTime = elements.namedItem("processTime");

	process = new Process(parseInt(inProcessSize.value), parseInt(inProcessTime.value));

	processes.push(process);
	addProcessToTable(process);

	inProcessSize.value = "";
	inProcessTime.value = "";

	return false;
};

function addProcessToTable(process) {
	row = document.createElement("tr");
	row.setAttribute("id", "process" + process.id);

	colName = document.createElement("td");
	colName.innerHTML = process.id;

	colSize = document.createElement("td");
	colSize.innerHTML = process.size;

	colTime = document.createElement("td");
	colTime.setAttribute("id", "process" + process.id + "timeLeft");
	colTime.innerHTML = process.timeLeft;

	row.appendChild(colName);
	row.appendChild(colSize);
	row.appendChild(colTime);

	processTable.appendChild(row);
};

function removeProcessFromTable(process) {
	processTable.removeChild(document.getElementById("process" + process.id));
};

function refreshTable() {
	for (i=0; i<processes.length; i++) {
		process = processes[i];
		document.getElementById("process" + process.id + "timeLeft").innerHTML = process.timeLeft;
	};
};

var memoryDiv = document.getElementById("memory");
var processTable = document.getElementById("processTable");

var processID = 0;
var processes = [];

linkedList = new LinkedList();
blockSizes = [100, 500, 200, 300, 600];

for (i=blockSizes.length-1; i>=0; i--) {
	linkedList.add(new MemControlBlock(blockSizes[i]));
};

linkedList.repaint();

var clock = setInterval(function() {
	for (i=0; i<processes.length; i++) {
		process = processes[i];

		if (!process.isAllocated()) {
			if (document.getElementById('algo_ff').checked) {
				linkedList.requestAllocationFirstFit(process);
			}
			else if (document.getElementById('algo_bf').checked) {
				linkedList.requestAllocationBestFit(process);
			}
			else if (document.getElementById('algo_wf').checked) {
				linkedList.requestAllocationWorstFit(process);
			}
			else if (document.getElementById('algo_nf').checked) {
				linkedList.requestAllocationNextFit(process);
			}
		} else {
			process.tick();
			if (process.timeLeft < 1) {
				linkedList.deallocateProcess(process);

				index = processes.indexOf(process);
				if (index > -1) {
					processes.splice(index, 1);
				};

				removeProcessFromTable(process);
			};
		};
	};

	refreshTable();
	linkedList.repaint();
}, 1000);