// access the canvas
const canvas = document.getElementById('tetris');
// get the context out because we can't draw on the dom element
const context = canvas.getContext('2d');

// scaleing the canvas
context.scale(20, 20);

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length -1; y > 0; --y){
    for (let x = 0; x < arena[y].length; ++x){
      if (arena[y][x] === 0){
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

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

// create game peaces
function createPiece(type) {
  if (type === 'T'){
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  }else if (type === 'O'){
    return [
      [2, 2],
      [2, 2],
    ];
  }else if (type === 'L'){
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  }else if (type === 'J'){
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  }else if (type === 'I'){
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ];
  }else if (type === 'S'){
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  }else if (type === 'Z'){
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

function draw(){
  // checking to see if we can draw on the canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena,{x: 0, y: 0});
  drawMatrix(player.matrix,player.pos);
}

// draw the matrix
function drawMatrix(matrix, offset){
  matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 ) {
            context.fillStyle = colors[value];
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
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)){
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)){
    arena.forEach(row => row.fill(0));
    player.score = 0;
    dropInterval = 1000;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)){
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length){
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y){
    for (let x = 0; x < y; ++x){
      [
          matrix[x][y],
          matrix[y][x],
      ] = [
          matrix[y][x],
          matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  }else{
    matrix.reverse();
  }

}

// dropCounter
let dropCounter = 0;
let dropInterval = 1000;
let difficultyTime = 30000;
let counter = 0;
// store last time
let lastTime = 0;
// updates every frame
function update(time = 0){

  // caulating time
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval){
    playerDrop();
  }
  counter += deltaTime;

  if(counter > difficultyTime){
    if(dropInterval > 0){
      dropInterval = dropInterval -(dropInterval * .25);
    }
    counter = 0;
  }

  // draw function
  draw();
  // draws every frame
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const arena = createMatrix(12,20);

// player position and matrix
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
}

// player keyboard Controls
document.addEventListener('keydown', event =>{
  if (event.key === 'ArrowLeft'){
      playerMove(-1);
  }else if (event.key === 'ArrowRight'){
      playerMove(1);
  }else if (event.key === 'ArrowDown'){
      playerDrop();
  }else if (event.key === 'q'){
      playerRotate(-1);
  }else if (event.key === 'w'){
      playerRotate(1);
  }
});

// player moblie controls
/* link to git hub https://gist.github.com/SleepWalker/da5636b1abcbaff48c4d*/

let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

const gestureZone = document.getElementById('gestureZone');

gestureZone.addEventListener('touchstart', function(event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
}, false);

gestureZone.addEventListener('touchend', function(event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
}, false);

function handleGesture() {
    if (touchendX <= touchstartX) {
        playerMove(-1);
        console.log('Swiped left');
    }

    if (touchendX >= touchstartX) {
        playerMove(1);
        console.log('Swiped right');
    }

    if (touchendY <= touchstartY) {
        console.log('Swiped up');
    }

    if (touchendY >= touchstartY) {
        playerDrop();
        console.log('Swiped down');
    }

    if (touchendY === touchstartY) {
        playerRotate(1);
        console.log('Tap');
    }
}

playerReset();
updateScore();
update();
