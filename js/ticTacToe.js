//var pos = ["c0", "s0", "c1", "s1", "c2", "s2", "c3", "s3", "c"];
var pos = ["", "", "", "", "", "", "", "", ""];
var turn = false;

function setBoard(pos) {
  for(var i = 0; i < 9; i++) {
    document.getElementById(i).textContent = pos[i];
  }
}

function rotate(pos) {
  var rot = [pos, [], [], []];
  for(var i = 1; i < 4; i++) {
    for(var j = 0; j < 8; j++) rot[i][(j+2)%8] = rot[i-1][j%8];
    rot[i][8] = rot[i-1][8];
  }
  return rot;
}

function invert(pos) {
  var inv = [pos, []];
  for(var i = 0, j = 8; i < 8; i++, j-=2) inv[1][(i+j)%8] = inv[0][i];
  inv[1][8] = inv[0][8];
  return inv;
}

function transform(pos) {
  return [rotate(pos), rotate(invert(pos)[1])];
}

var POS = transform(pos);

function equality(pos0, pos1) {
  for(var i = 0; i < 9; i++) if(pos0[i] != pos1[i]) return false;
  return true;
}

function equivalence(pos0, pos1) {
  var POS = transform(pos1);
  for(var i = 0; i < 2; i++) for(var j = 0; j < 4; j++) if(equality(pos0,POS[i][j])) return true;
  return false;
}

function click() {
  if(this.textContent != "") return;
  if(turn) this.textContent = 'O';
  else this.textContent = 'X';
  turn = !turn;
  document.getElementById("turn").textContent = (turn ? "O's Turn" : "X's   Turn");
}

for(var i = 0; i < 9; i++) document.getElementById(i).addEventListener('click', click);

setBoard(POS[0][0]);


/*
0:+8
1:+6
2:+4
3:+2
4:+0
5:-2
6:-4
7:-6

2:+8
3:+6
4:+4
5:+2
6:+0
7:-2
0:-4
1:-6
*/