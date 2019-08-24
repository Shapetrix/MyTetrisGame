// access the canvas
const canvas = document.getElementById('tetris');
// get the context out because we can't draw on the dom element
const context = canvas.getContext('2d');

// scaleing the canvas
context.scale(20, 20);

// create game peaces
const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

function collide(arena, player){
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y){
    for (let x = 0; x < m[y].length; ++x){
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
        return true;
      }
    }
  }
  return false;
}

// stores all the matrixes
function createMatrix(w, h){
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}
function draw(){
  // checking to see if we can draw on the canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(player.matrix,player.pos);
}

// draw the matrix
function drawMatrix(matrix, offset){
  matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 ) {
            context.fillStyle = 'blue';
            context.fillRect(x + offset.x,
                             y + offset.y,
                             1, 1);
          }
      });
  });
}
function merge(arena, player){
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) =>{
      if (value !== 0 ){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}
// drops player by one
function playerDrop(){
  player.pos.y++;
  if (collide(arena, player)){
    player.pos.y--;
    merge(arena, player);
    player.pos.y = 0;
  }
  dropCounter = 0;
}
// dropCounter
let dropCounter = 0;
let dropInterval = 1000;
// store last time
let lastTime = 0;
// updates every frame
function update(time = 0){
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval){
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

const arena = createMatrix(12,20);

// player position and matrix
const player = {
  pos: {x: 5, y: 5},
  matrix: matrix,
}

// player controls
document.addEventListener('keydown', event =>{
  if (event.key === 'ArrowLeft'){
      player.pos.x--;
  }else if (event.key === 'ArrowRight'){
      player.pos.x++;
  }else if (event.key === 'ArrowDown'){
      playerDrop();
  }
});

update();
