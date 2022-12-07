const firebaseConfig = {
  apiKey: "AIzaSyAb9zglNHMpwfHoQaL8v-jxd_dNN-A7_u4",
  authDomain: "game-site-d97cf.firebaseapp.com",
  projectId: "game-site-d97cf",
  storageBucket: "game-site-d97cf.appspot.com",
  messagingSenderId: "1058182439081",
  appId: "1:1058182439081:web:ccc1d2944102c2db9089b8",
  measurementId: "G-F04G3G3QTW"
};

firebase.initializeApp(firebaseConfig);

const newBoard = ["", "", "", "", "", "", "", "", ""];
var pos = ["", "", "", "", "", "", "", "", ""];
var turn = false;
var winner = '';

function setBoard(pos) {
  for (var i = 0; i < 9; i++) {
    document.getElementById(i).textContent = newBoard[i];
  }
}

function resetBoard(pos) {
  for (var i = 0; i < 9; i++) {
    document.getElementById(i).textContent = newBoard[i];
  }
  turn = false;
  document.getElementById("turn").textContent = "X's   Turn";
  pos = newBoard;
}

function rotate(pos) {
  var rot = [pos, [], [], []];
  for (var i = 1; i < 4; i++) {
    for (var j = 0; j < 8; j++) rot[i][(j + 2) % 8] = rot[i - 1][j % 8];
    rot[i][8] = rot[i - 1][8];
  }
  return rot;
}

function invert(pos) {
  var inv = [pos, []];
  for (var i = 0, j = 8; i < 8; i++, j -= 2) inv[1][(i + j) % 8] = inv[0][i];
  inv[1][8] = inv[0][8];
  return inv;
}

function transform(pos) {
  return [rotate(pos), rotate(invert(pos)[1])];
}

var POS = transform(pos);

function equality(pos0, pos1) {
  for (var i = 0; i < 9; i++) if (pos0[i] != pos1[i]) return false;
  return true;
}

function equivalence(pos0, pos1) {
  var POS = transform(pos1);
  for (var i = 0; i < 2; i++) for (var j = 0; j < 4; j++) if (equality(pos0, POS[i][j])) return true;
  return false;
}

function click() {
  if (this.textContent != "") return;
  if (turn) this.textContent = 'O';
  else this.textContent = 'X';
  turn = !turn;
  document.getElementById("turn").textContent = (turn ? "O's Turn" : "X's   Turn");
  checkWin();
}

for (var i = 0; i < 9; i++) document.getElementById(i).addEventListener('click', click);

setBoard(POS[0][0]);

function checkWin() {

  for (var i = 0; i < 9; i++) {
    pos[i] = document.getElementById(i).textContent;
  }

  if (
    pos[0] == 'X' && pos[1] == 'X' && pos[2] == 'X' ||
    pos[0] == 'X' && pos[7] == 'X' && pos[6] == 'X' ||
    pos[0] == 'X' && pos[8] == 'X' && pos[4] == 'X' ||
    pos[1] == 'X' && pos[8] == 'X' && pos[5] == 'X' ||
    pos[2] == 'X' && pos[3] == 'X' && pos[4] == 'X' ||
    pos[2] == 'X' && pos[8] == 'X' && pos[6] == 'X' ||
    pos[7] == 'X' && pos[8] == 'X' && pos[3] == 'X' ||
    pos[6] == 'X' && pos[5] == 'X' && pos[4] == 'X') {
    alert('Winner X!');
    resetBoard();
    winner = 'X'
    firebase
      .firestore()
      .collection('ttt')
      .add({'winner ' : winner});
  } else if (
    pos[0] == 'O' && pos[1] == 'O' && pos[2] == 'O' ||
    pos[0] == 'O' && pos[7] == 'O' && pos[6] == 'O' ||
    pos[0] == 'O' && pos[8] == 'O' && pos[4] == 'O' ||
    pos[1] == 'O' && pos[8] == 'O' && pos[5] == 'O' ||
    pos[2] == 'O' && pos[3] == 'O' && pos[4] == 'O' ||
    pos[2] == 'O' && pos[8] == 'O' && pos[6] == 'O' ||
    pos[7] == 'O' && pos[8] == 'O' && pos[3] == 'O' ||
    pos[6] == 'O' && pos[5] == 'O' && pos[4] == 'O') {
    alert('Winner O!');
    resetBoard();
    winner = 'O';
    firebase
      .firestore()
      .collection('ttt')
      .add({'winner ' : winner});
  }
}