const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 10;
const GRID_WIDTH = canvas.width / CELL_SIZE;
const GRID_HEIGHT = canvas.height / CELL_SIZE;

let play = false;

let grid = new Set();
grid.add(("5,5"));

let isDrawing = false;
let markingCells = false;
let lastCell = null;

let currMarkedCells = new Set();

//let intervalID = window.setInterval(autoNextGeneration, 100);
let intervalID = null;

function draw(){
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    for(let key of grid){
        let [x,y] = key.split(',').map(Number);
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 0.5;
    for(let x = 0; x<= GRID_WIDTH; x++){
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    for(let y = 0; y<=GRID_HEIGHT; y++){
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(canvas.width, y * CELL_SIZE);
        ctx.stroke();
    }
}
/*
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX-rect.left;
    const y = e.clientY-rect.top;
    const cellX = Math.floor(x/CELL_SIZE);
    const cellY = Math.floor(y/CELL_SIZE);

    if(cellX >= 0 && cellX < GRID_WIDTH && cellY >= 0 && cellY < GRID_HEIGHT){
        const key = `${cellX},${cellY}`;
        if(grid.has(key)) grid.delete(key);
        else grid.add(key);
        draw();
    }
});
*/

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    currMarkedCells = new Set();
;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX-rect.left;
    const y = e.clientY-rect.top;
    const cellX = Math.floor(x/CELL_SIZE);
    const cellY = Math.floor(y/CELL_SIZE);
    const key = `${cellX},${cellY}`;
    
    markingCells = !grid.has(key);

    toggleCell(e);
});
canvas.addEventListener('mousemove', (e) => {
    if(isDrawing) toggleCell(e);
});
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    lastCell = null;
    currMarkedCells.clear();
});


function toggleCell(event){
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX-rect.left;
    const y = event.clientY-rect.top;
    const cellX = Math.floor(x/CELL_SIZE);
    const cellY = Math.floor(y/CELL_SIZE);

    if(cellX >= 0 && cellX < GRID_WIDTH && cellY >= 0 && cellY < GRID_HEIGHT){
        const key = `${cellX},${cellY}`;
        /*
        if(!currMarkedCells.has(key)){
            currMarkedCells.add(key);
            grid.add(key);
            draw();
        }
        */
        if(!currMarkedCells.has(key)){
            currMarkedCells.add(key);
            if(markingCells){
                if(!grid.has(key)) grid.add(key);
            }
            else{
                if(grid.has(key)) grid.delete(key);
            }
        }
        draw();
    }
}

async function nextGeneration(){
    try{
        const cellsArray = Array.from(grid).map(key => {
        const [x, y] = key.split(',').map(Number);
        return [x,y];
        });
        
        const response = await fetch('http://127.0.0.1:8000/next_generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cells: cellsArray,
                grid_width: GRID_WIDTH,
                grid_height: GRID_HEIGHT
            })
        });
        const result = await response.json();
        //console.log('next generation:', result);
        grid = new Set(result.cells.map(cell => `${cell[0]},${cell[1]}`));
        draw();
    } catch(err) { 
        console.error("Error in nextGeneration:", err);
    }
}
/*
function setPlay(){
    play = !play;
    let el = document.querySelector('#button_play');
    if(!play) el.innerText = '►';
    else el.innerText = '⏸';
}
*/
function setPlay(){
    play = !play;
    let el = document.querySelector('#button_play');
    if(play){
        el.innerText = '⏸';
        intervalID = window.setInterval(nextGeneration, 100);
    }
    else{
        el.innerText = '►';
        clearInterval(intervalID);
    }
}

function clearGrid(){
    grid.clear();
    draw();
}
/*
function autoNextGeneration(){
    if(play) nextGeneration();
}
*/
draw();