//load firebase
const firebaseConfig = {
    apiKey: "AIzaSyAb9zglNHMpwfHoQaL8v-jxd_dNN-A7_u4",
    authDomain: "game-site-d97cf.firebaseapp.com",
    projectId: "game-site-d97cf",
    storageBucket: "game-site-d97cf.appspot.com",
    messagingSenderId: "1058182439081",
    appId: "1:1058182439081:web:ccc1d2944102c2db9089b8",
    measurementId: "G-F04G3G3QTW"
};
//initialize firebase
firebase.initializeApp(firebaseConfig);

//establish constants
const lettersArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const piecesArray = ['WP', 'WR', 'WN', 'WB', 'WQ', 'WK', 'BP', 'BR', 'BN', 'BB', 'BQ', 'BK', 'empty'];
const startFormation = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
const scoreBoard = document.getElementById('moves');
const turnColor = document.getElementById('turnColor');
const unselectedPiece = document.getElementsByClassName('chessPiece')
const selectedPiece = document.getElementsByClassName('chessPiece-selected');

//establish "global" variables to be used later in functions
var pieceIndex = null;
var pieceColor = '';
var pieceID = '';
var pieceName = '';
var origin = '';
var destination = '';
var lastMove = '';
var removePiece = '';
var enPessant = false;
var castles = false;

//this creates the board for the game and contains all the rules for the game in separate funtions
function newGame() {

    //for castles in "doMove()"
    var wKingMoved = false;
    var wLRookMoved = false;
    var wRRookMoved = false;
    var bKingMoved = false;
    var bLRookMoved = false;
    var bRRookMoved = false;

    var originArray = [];
    var scoreBoardObject = new Object;
    var scoreBoardArray = [];
    var chessDoc = new Object;

    //reset to default color
    document.getElementById('lightColor').value = '#deb887';
    document.getElementById('darkColor').value = '#8b4513';

    //reset scoreboard
    scoreBoard.innerHTML = '<thead><tr><th>Move</th><th>Origin</th><th>Destination</th></tr></thead>';

    //reset turn indicator
    turnColor.textContent = "White's Turn"

    //establish turn counter / reset to 1
    var turnCounter = 1;

    //set the variable "make board" to table content
    var makeBoard = "";
    for (var i = 0; i < 8; i++) {
        //create the rows
        makeBoard += '<tr id="rank' + (8 - i) + '" class="rank' + (i + 1) + '">';
        for (var j = 0; j < 8; j++) {
            //create the files(columns)
            makeBoard += '<td class="file' + lettersArray[j] + '" id="' + lettersArray[j] + (8 - i) + '" name=""><button class="chessPiece"  id="' + lettersArray[j] + (8 - i) + 'button"></button></td>';
        }
        makeBoard += '</tr>'
    }
    //fill table with variable "make board"
    document.getElementById('chessBoard').innerHTML = makeBoard;

    //White pieces
    for (var i = 0; i < startFormation.length; i++) {
        document.getElementById(lettersArray[i] + 1 + 'button').setAttribute('name', 'W' + startFormation[i]);
    }

    //White pawns
    for (var i = 0; i < 8; i++) {
        document.getElementById(lettersArray[i] + '2button').setAttribute('name', 'WP');
    }

    //empty spaces
    for (var i = 2; i < 6; i++) {
        for (var j = 0; j < 8; j++) {
            document.getElementById(lettersArray[j] + (i + 1) + 'button').setAttribute('name', 'empty');
        }
    }

    //Black pawns
    for (var i = 0; i < 8; i++) {
        document.getElementById(lettersArray[i] + '7button').setAttribute('name', 'BP');
    }

    //Black pieces
    for (var i = 0; i < startFormation.length; i++) {
        document.getElementById(lettersArray[i] + 8 + 'button').setAttribute('name', 'B' + startFormation[i]);
    }

    //checkerboard pattern
    for (var i = 0; i < 8; i++) {
        var rank = document.getElementsByClassName('rank' + (i + 1));
        for (var j = 0; j < 8; j++) {
            var square = document.getElementById(lettersArray[j] + (i + 1));
            if ((i + j + 2) % 2 == 0) {
                square.setAttribute('name', 'dark');
            } else {
                square.setAttribute('name', 'light')
            }
        }
    }

    //function to select a piece
    function highlightPiece() {

        var classname = this.getAttribute('class');
        for (var i = 0; i < selectedPiece.length; i++) {
            selectedPiece[i].setAttribute('class', 'chessPiece')
        }

        if (classname == 'chessPiece') {
            this.setAttribute('class', 'chessPiece-selected');
        } else {
            this.setAttribute('class', 'chessPiece');
        }
    }

    //event for selecting a piece
    for (var i = 0; i < unselectedPiece.length; i++) {
        document.getElementsByClassName('chessPiece')[i].addEventListener('click', highlightPiece, false);
    }

    //function to show where a piece can move
    function pieceMoves() {

        //reset movable squares
        var movableSquares = document.querySelectorAll('.chessPiece-move');

        //remove highlights on lost focus
        if (movableSquares.length) {
            for (var i = 0; i < movableSquares.length; i++) {
                movableSquares[i].setAttribute('class', 'chessPiece');
            }
        }

        if (document.getElementsByClassName('chessPiece-selected').length) {

            //define last move for en pessant
            if (turnCounter > 1) {
                lastMove = scoreBoardArray[scoreBoardArray.length - 1].origin + scoreBoardArray[scoreBoardArray.length - 1].destination;
            }

            //find selected piece
            pieceColor = document.getElementsByClassName('chessPiece-selected')[0].getAttribute('name').charAt(0);
            pieceID = document.getElementsByClassName('chessPiece-selected')[0].getAttribute('id');
            pieceName = document.getElementsByClassName('chessPiece-selected')[0].getAttribute('name');
            enPessant = false;

            for (var i = 0; i < piecesArray.length; i++) {
                if (pieceName == piecesArray[i]) {
                    pieceIndex = i;
                }
            }

            //document coordinates
            var y = parseInt((selectedPiece[0].getAttribute('id')).charAt(1));
            var x = lettersArray.indexOf((selectedPiece[0].getAttribute('id')).charAt(0));

            //shows where pieces can move by selected piece
            switch (pieceIndex) {

                //white pawns
                case 0:

                    var oneSpace = document.getElementById(lettersArray[x] + (y + 1) + 'button');
                    var twoSpace = document.getElementById(lettersArray[x] + (y + 2) + 'button');
                    var diagRight = document.getElementById(lettersArray[x + 1] + (y + 1) + 'button');
                    var diagLeft = document.getElementById(lettersArray[x - 1] + (y + 1) + 'button');
                    var directLeft = document.getElementById(lettersArray[x - 1] + y + 'button');
                    var directRight = document.getElementById(lettersArray[x + 1] + y + 'button');

                    //functions for diagonals
                    if (x != 7 && diagRight.getAttribute('name') != piecesArray[12] && diagRight.getAttribute('name').charAt(0) != 'W') {
                        diagRight.setAttribute('class', 'chessPiece-move');
                    }
                    if (x != 0 && diagLeft.getAttribute('name') != piecesArray[12] && diagLeft.getAttribute('name').charAt(0) != 'W') {
                        diagLeft.setAttribute('class', 'chessPiece-move');
                    }

                    //function for en pessant
                    if (x != 7 && y == 5 && diagRight.getAttribute('name') == piecesArray[12] && directRight.getAttribute('name') == 'BP' && lastMove == 'P' + lettersArray[x + 1] + 7 + 'P' + lettersArray[x + 1] + 5) {
                        diagRight.setAttribute('class', 'chessPiece-move');
                        removePiece = directRight;
                        enPessant = true;
                    }
                    if (x != 0 && y == 5 && diagLeft.getAttribute('name') == piecesArray[12] && directLeft.getAttribute('name') == 'BP' && lastMove == 'P' + lettersArray[x - 1] + 7 + 'P' + lettersArray[x - 1] + 5) {
                        diagLeft.setAttribute('class', 'chessPiece-move');
                        removePiece = directLeft;
                        enPessant = true;
                    }

                    //function for first move
                    if (document.getElementById('rank2').contains(selectedPiece[0])) {
                        if (twoSpace.getAttribute('name') == piecesArray[12] && oneSpace.getAttribute('name') == piecesArray[12]) {
                            oneSpace.setAttribute('class', 'chessPiece-move');
                            twoSpace.setAttribute('class', 'chessPiece-move');
                        } else if (oneSpace.getAttribute('name') == piecesArray[12]) {
                            oneSpace.setAttribute('class', 'chessPiece-move');
                        }
                    }

                    //Normal Move
                    else if (oneSpace.getAttribute('name') == piecesArray[12]) {
                        oneSpace.setAttribute('class', 'chessPiece-move');
                    }
                    break;

                //white rooks
                case 1:

                    //move right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7) { break; }
                        var right = x;
                        right += i;
                        if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (right == 7) { break; }
                    }

                    //move left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0) { break; }
                        var left = x;
                        left -= i;
                        if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (left == 0) { break; }
                    }

                    //move down 
                    for (var i = 1; i < 8; i++) {
                        if (y == 1) { break; }
                        var down = y;
                        down -= i;
                        if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (down == 1) { break; }
                    }

                    //move up 
                    for (var i = 1; i < 8; i++) {
                        if (y == 8) { break; }
                        var up = y;
                        up += i;
                        if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (up == 8) { break; }
                    }

                    break;

                //white knights
                case 2:

                    //jump angles number is degrees
                    var jump30 = document.getElementById(lettersArray[x + 1] + (y - 2) + 'button');
                    var jump60 = document.getElementById(lettersArray[x + 2] + (y - 1) + 'button');
                    var jump120 = document.getElementById(lettersArray[x + 2] + (y + 1) + 'button');
                    var jump150 = document.getElementById(lettersArray[x + 1] + (y + 2) + 'button');
                    var jump210 = document.getElementById(lettersArray[x - 1] + (y + 2) + 'button');
                    var jump240 = document.getElementById(lettersArray[x - 2] + (y + 1) + 'button');
                    var jump300 = document.getElementById(lettersArray[x - 2] + (y - 1) + 'button');
                    var jump330 = document.getElementById(lettersArray[x - 1] + (y - 2) + 'button');
                    var jumpArray = [jump30, jump60, jump120, jump150, jump210, jump240, jump300, jump330];

                    for (var i = 0; i < jumpArray.length; i++) {
                        if (jumpArray[i] != null) {
                            if (jumpArray[i].getAttribute('name') == piecesArray[12]) {
                                jumpArray[i].setAttribute('class', 'chessPiece-move');
                            } else if (jumpArray[i].getAttribute('name').charAt(0) == 'B') {
                                jumpArray[i].setAttribute('class', 'chessPiece-move');
                            }
                        }
                    }
                    break;

                //white bishops
                case 3:

                    //up right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if ((bishopMove.getAttribute('name').charAt(0) == 'B')) {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 8) { break; }

                    }

                    //down right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 1) { break; }
                    }

                    //down left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 1) { break; }
                    }

                    //up left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 8) { break; }
                    }

                    break;

                //white queen
                case 4:

                    //copied from rook
                    //move right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7) { break; }
                        var right = x;
                        right += i;
                        if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (right == 7) { break; }
                    }

                    //move left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0) { break; }
                        var left = x;
                        left -= i;
                        if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (left == 0) { break; }
                    }

                    //move down 
                    for (var i = 1; i < 8; i++) {
                        if (y == 1) { break; }
                        var down = y;
                        down -= i;
                        if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (down == 1) { break; }
                    }

                    //move up 
                    for (var i = 1; i < 8; i++) {
                        if (y == 8) { break; }
                        var up = y;
                        up += i;
                        if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'W')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'B')) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (up == 8) { break; }
                    }

                    //copied from bishop
                    //up right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if ((bishopMove.getAttribute('name').charAt(0) == 'B')) {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 8) { break; }

                    }

                    //down right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 1) { break; }
                    }

                    //down left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 1) { break; }
                    }

                    //up left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 8) { break; }
                    }
                    break;

                //white king
                case 5:

                    //set vars
                    var up = document.getElementById(lettersArray[x] + (y + 1) + 'button');
                    var upLeft = document.getElementById(lettersArray[x - 1] + (y + 1) + 'button');
                    var left = document.getElementById(lettersArray[x - 1] + y + 'button');
                    var downLeft = document.getElementById(lettersArray[x - 1] + (y - 1) + 'button');
                    var down = document.getElementById(lettersArray[x] + (y - 1) + 'button');
                    var downRight = document.getElementById(lettersArray[x + 1] + (y - 1) + 'button');
                    var right = document.getElementById(lettersArray[x + 1] + y + 'button');
                    var upRight = document.getElementById(lettersArray[x + 1] + (y + 1) + 'button');
                    var kingMoveArray = [up, upLeft, left, downLeft, down, downRight, right, upRight]

                    //Normal Movement
                    for (var i = 0; i < kingMoveArray.length; i++) {
                        if (kingMoveArray[i] != null) {
                            if (kingMoveArray[i].getAttribute('name') == piecesArray[12]) {
                                kingMoveArray[i].setAttribute('class', 'chessPiece-move');
                            } else if (kingMoveArray[i].getAttribute('name').charAt(0) == 'B') {
                                kingMoveArray[i].setAttribute('class', 'chessPiece-move');
                            }
                        }
                    }

                    //Castles
                    var twoRight = document.getElementById('G1button');
                    var threeRight = document.getElementById('H1button');
                    var twoLeft = document.getElementById('C1button');
                    var threeLeft = document.getElementById('B1button');
                    var fourLeft = document.getElementById('A1button');

                    //Castles Right
                    if (x == 4 && y == 1 && right.getAttribute('name') == piecesArray[12] && twoRight.getAttribute('name') == piecesArray[12] && threeRight.getAttribute('name') == piecesArray[1]) {
                        for (i = 0; i < turnCounter; i++) {
                            if (i % 2 == 0 || i == 0) {
                                if (originArray[i] == 'RH1') {
                                    wRRookMoved = true;
                                }
                                if (originArray[i] == 'KE1') {
                                    wKingMoved = true;
                                }
                            }
                        }
                        if (wLRookMoved == false && wKingMoved == false) {
                            twoRight.setAttribute('class', 'chessPiece-move');
                            castles == 'wRCastle';
                        }
                    }

                    //Castles Left
                    if (x == 4 && y == 1 && left.getAttribute('name') == piecesArray[12] && twoLeft.getAttribute('name') == piecesArray[12] && threeLeft.getAttribute('name') == piecesArray[12] && fourLeft.getAttribute('name') == piecesArray[1]) {
                        for (i = 0; i < turnCounter; i++) {
                            if (i % 2 == 0 || i == 0) {
                                if (originArray[i] == 'RH1') {
                                    wLRookMoved = true;
                                }
                                if (originArray[i] == 'KE1') {
                                    wKingMoved = true;
                                }
                            }
                        }
                        if (wRRookMoved == false && wKingMoved == false) {
                            twoLeft.setAttribute('class', 'chessPiece-move');
                            castles == 'wLCastle';
                        }
                    }

                    break;

                //black pawns
                case 6:

                    //copy from white(reverse capture target & direction)
                    var oneSpace = document.getElementById(lettersArray[x] + (y - 1) + 'button');
                    var twoSpace = document.getElementById(lettersArray[x] + (y - 2) + 'button');
                    var diagRight = document.getElementById(lettersArray[x + 1] + (y - 1) + 'button');
                    var diagLeft = document.getElementById(lettersArray[x - 1] + (y - 1) + 'button');
                    var directLeft = document.getElementById(lettersArray[x - 1] + y + 'button');
                    var directRight = document.getElementById(lettersArray[x + 1] + y + 'button');

                    //function for diagonals
                    if (x != 7 && diagRight.getAttribute('name') != piecesArray[12] && diagRight.getAttribute('name').charAt(0) == 'W') {
                        diagRight.setAttribute('class', 'chessPiece-move');
                    }
                    if (x != 0 && diagLeft.getAttribute('name') != piecesArray[12] && diagLeft.getAttribute('name').charAt(0) == 'W') {
                        diagLeft.setAttribute('class', 'chessPiece-move');
                    }

                    //function for en pessant
                    if (x != 7 && y == 4 && diagRight.getAttribute('name') == piecesArray[12] && directRight.getAttribute('name') == 'WP' && lastMove == 'P' + lettersArray[x + 1] + 2 + 'P' + lettersArray[x + 1] + 4) {
                        diagRight.setAttribute('class', 'chessPiece-move');
                        removePiece = directRight;
                        enPessant = true;
                    }
                    if (x != 0 && y == 4 && diagLeft.getAttribute('name') == piecesArray[12] && directLeft.getAttribute('name') == 'WP' && lastMove == 'P' + lettersArray[x - 1] + 2 + 'P' + lettersArray[x - 1] + 4) {
                        diagLeft.setAttribute('class', 'chessPiece-move');
                        removePiece = directLeft;
                        enPessant = true;
                    }

                    //First Move
                    if (document.getElementById('rank7').contains(selectedPiece[0])) {
                        if (twoSpace.getAttribute('name') == piecesArray[12] && oneSpace.getAttribute('name') == piecesArray[12]) {
                            oneSpace.setAttribute('class', 'chessPiece-move');
                            twoSpace.setAttribute('class', 'chessPiece-move');
                        } else if (oneSpace.getAttribute('name') == piecesArray[12]) {
                            oneSpace.setAttribute('class', 'chessPiece-move');
                        }
                    }

                    //Normal Move
                    else if (oneSpace.getAttribute('name') == piecesArray[12]) {
                        oneSpace.setAttribute('class', 'chessPiece-move');
                    }
                    break;

                //black rooks
                case 7:

                    //copy from white
                    //move right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7) { break; }
                        var right = x;
                        right += i;
                        if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (right == 7) { break; }
                    }

                    //move left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0) { break; }
                        var left = x;
                        left -= i;
                        if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (left == 0) { break; }
                    }

                    //move down 
                    for (var i = 1; i < 8; i++) {
                        if (y == 1) { break; }
                        var down = y;
                        down -= i;
                        if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (down == 1) { break; }
                    }

                    //move up 
                    for (var i = 1; i < 8; i++) {
                        if (y == 8) { break; }
                        var up = y;
                        up += i;
                        if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (up == 8) { break; }
                    }

                    break;

                //black knights
                case 8:

                    //copy from white 
                    //jump angles number is degrees
                    var jump30 = document.getElementById(lettersArray[x + 1] + (y - 2) + 'button');
                    var jump60 = document.getElementById(lettersArray[x + 2] + (y - 1) + 'button');
                    var jump120 = document.getElementById(lettersArray[x + 2] + (y + 1) + 'button');
                    var jump150 = document.getElementById(lettersArray[x + 1] + (y + 2) + 'button');
                    var jump210 = document.getElementById(lettersArray[x - 1] + (y + 2) + 'button');
                    var jump240 = document.getElementById(lettersArray[x - 2] + (y + 1) + 'button');
                    var jump300 = document.getElementById(lettersArray[x - 2] + (y - 1) + 'button');
                    var jump330 = document.getElementById(lettersArray[x - 1] + (y - 2) + 'button');
                    var jumpArray = [jump30, jump60, jump120, jump150, jump210, jump240, jump300, jump330];

                    for (var i = 0; i < jumpArray.length; i++) {
                        if (jumpArray[i] != null) {
                            if (jumpArray[i].getAttribute('name') == piecesArray[12]) {
                                jumpArray[i].setAttribute('class', 'chessPiece-move');
                            } else if (jumpArray[i].getAttribute('name').charAt(0) == 'W') {
                                jumpArray[i].setAttribute('class', 'chessPiece-move');
                            }
                        }
                    }
                    break;

                //black bishops
                case 9:

                    //copy from white
                    //up right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if ((bishopMove.getAttribute('name').charAt(0) == 'W')) {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 8) { break; }

                    }

                    //down right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 1) { break; }
                    }

                    //down left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 1) { break; }
                    }

                    //up left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 8) { break; }
                    }

                    break;

                //black queen
                case 10:

                    //move right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7) { break; }
                        var right = x;
                        right += i;
                        if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[right] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[right] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (right == 7) { break; }
                    }

                    //move left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0) { break; }
                        var left = x;
                        left -= i;
                        if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[left] + y + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[left] + y + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (left == 0) { break; }
                    }

                    //move down 
                    for (var i = 1; i < 8; i++) {
                        if (y == 1) { break; }
                        var down = y;
                        down -= i;
                        if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + down + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + down + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (down == 1) { break; }
                    }

                    //move up 
                    for (var i = 1; i < 8; i++) {
                        if (y == 8) { break; }
                        var up = y;
                        up += i;
                        if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'B')) {
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name').charAt(0) == 'W')) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move');
                            break;
                        } else if ((document.getElementById(lettersArray[x] + up + 'button').getAttribute('name') == piecesArray[12])) {
                            document.getElementById(lettersArray[x] + up + 'button').setAttribute('class', 'chessPiece-move')
                        }
                        if (up == 8) { break; }
                    }

                    //up right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if ((bishopMove.getAttribute('name').charAt(0) == 'W')) {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 8) { break; }

                    }

                    //down right
                    for (var i = 1; i < 8; i++) {
                        if (x == 7 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal += i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 7 || vertical == 1) { break; }
                    }

                    //down left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 1) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical -= i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 1) { break; }
                    }

                    //up left
                    for (var i = 1; i < 8; i++) {
                        if (x == 0 || y == 8) { break; }
                        var horizontal = x;
                        var vertical = y;
                        horizontal -= i;
                        vertical += i;
                        var bishopMove = document.getElementById(lettersArray[horizontal] + (vertical) + 'button');
                        if (bishopMove.getAttribute('name').charAt(0) == 'B') {
                            break;
                        } else if (bishopMove.getAttribute('name').charAt(0) == 'W') {
                            bishopMove.setAttribute('class', 'chessPiece-move');
                            break;
                        } else if (bishopMove.getAttribute('name') == piecesArray[12]) {
                            bishopMove.setAttribute('class', 'chessPiece-move')
                        }
                        if (horizontal == 0 || vertical == 8) { break; }
                    }

                    break;

                //black king
                case 11:

                    //copy from white king
                    //set vars
                    var up = document.getElementById(lettersArray[x] + (y + 1) + 'button');
                    var upLeft = document.getElementById(lettersArray[x - 1] + (y + 1) + 'button');
                    var left = document.getElementById(lettersArray[x - 1] + y + 'button');
                    var downLeft = document.getElementById(lettersArray[x - 1] + (y - 1) + 'button');
                    var down = document.getElementById(lettersArray[x] + (y - 1) + 'button');
                    var downRight = document.getElementById(lettersArray[x + 1] + (y - 1) + 'button');
                    var right = document.getElementById(lettersArray[x + 1] + y + 'button');
                    var upRight = document.getElementById(lettersArray[x + 1] + (y + 1) + 'button');
                    var kingMoveArray = [up, upLeft, left, downLeft, down, downRight, right, upRight]

                    for (var i = 0; i < kingMoveArray.length; i++) {
                        if (kingMoveArray[i] != null) {
                            if (kingMoveArray[i].getAttribute('name') == piecesArray[12]) {
                                kingMoveArray[i].setAttribute('class', 'chessPiece-move');
                            } else if (kingMoveArray[i].getAttribute('name').charAt(0) == 'W') {
                                kingMoveArray[i].setAttribute('class', 'chessPiece-move');
                            }
                        }
                    }

                    //Castles
                    var twoRight = document.getElementById('G8button');
                    var threeRight = document.getElementById('H8button');
                    var twoLeft = document.getElementById('C8button');
                    var threeLeft = document.getElementById('B8button');
                    var fourLeft = document.getElementById('A8button');

                    //Castles Right
                    if (x == 4 && y == 8 && right.getAttribute('name') == piecesArray[12] && twoRight.getAttribute('name') == piecesArray[12] && threeRight.getAttribute('name') == piecesArray[7]) {
                        for (i = 0; i < turnCounter; i++) {
                            if (i % 2 == 0 || i == 0) {
                                if (originArray[i] == 'RH8') {
                                    bRRookMoved = true;
                                }
                                if (originArray[i] == 'KE8') {
                                    bKingMoved = true;
                                }
                            }
                        }
                        if (bRRookMoved == false && bKingMoved == false) {
                            twoRight.setAttribute('class', 'chessPiece-move');
                            castles == 'bRCastle';
                        }
                    }

                    //Castles Left
                    if (x == 4 && y == 8 && left.getAttribute('name') == piecesArray[12] && twoLeft.getAttribute('name') == piecesArray[12] && threeLeft.getAttribute('name') == piecesArray[12] && fourLeft.getAttribute('name') == piecesArray[7]) {
                        for (i = 0; i < turnCounter; i++) {
                            if (i % 2 == 0 || i == 0) {
                                if (originArray[i] == 'RH8') {
                                    bLRookMoved = true;
                                }
                                if (originArray[i] == 'KE8') {
                                    bKingMoved = true;
                                }
                            }
                        }
                        if (bLRookMoved == false && bKingMoved == false) {
                            twoLeft.setAttribute('class', 'chessPiece-move');
                            castles == 'bLCastle';
                        }
                    }

                    break;

                //case 12: (empty) does not move

                default: //see case 12
                    break;
            }

            //doMove event
            for (var i = 0; i < document.querySelectorAll('.chessPiece-move').length; i++) {
                document.querySelectorAll('.chessPiece-move')[i].addEventListener('click', doMove, false);
            }
            //remove old listeners
            for (var i = 0; i < document.getElementsByClassName('chessPiece').length; i++) {
                document.getElementsByClassName('chessPiece')[i].removeEventListener('click', doMove);
            }
        }
    }

    //event to show movable squares
    for (var i = 0; i < unselectedPiece.length; i++) {
        document.getElementsByClassName('chessPiece')[i].addEventListener('click', pieceMoves, false);
    }

    //funtion to move a piece
    function doMove() {
        origin = pieceName.charAt(1) + pieceID.charAt(0) + pieceID.charAt(1);
        destination = pieceName.charAt(1) + this.getAttribute('id').charAt(0) + this.getAttribute('id').charAt(1);
        var takenPiece = this.getAttribute('name');
        castles = false;
        var promotionPiece;

        //White's Turn
        if ((turnCounter + 2) % 2 != 0 && pieceColor == 'W') {

            //special case for Castles
            if (origin == 'KE1' && destination == 'KC1') {
                castles = true;
                document.getElementById('A1button').setAttribute('name', 'empty');
                document.getElementById('D1button').setAttribute('name', 'WR');
            }
            if (origin == 'KE1' && destination == 'KG1') {
                castles = true;
                document.getElementById('H1button').setAttribute('name', 'empty');
                document.getElementById('F1button').setAttribute('name', 'WR');
            }

            //special case for En Pessant
            if (enPessant == true) {
                takenPiece = removePiece.getAttribute('name');
                removePiece.setAttribute('name', 'empty');
            }

            //special case for Queen Promotion
            if (pieceName.charAt(1) == 'P' && destination.charAt(2) == 8) {
                promotionPiece = prompt('Please select the piece you would like to promote to (Q , R , B , N)', 'Q');
                this.setAttribute('name', 'W' + promotionPiece);
                destination = promotionPiece + this.getAttribute('id').charAt(0) + this.getAttribute('id').charAt(1);
                document.getElementById(pieceID).setAttribute('name', 'empty');
                for (var i = 0; i <= 12; i++) {
                    var addImg = document.querySelectorAll('[name="' + piecesArray[i] + '"');
                    for (var j = 0; j < addImg.length; j++) {
                        if (i != 12) {
                            addImg[j].innerHTML = '<img src="../img/' + piecesArray[i] + '.png">';
                        } else {
                            addImg[j].innerHTML = "";
                        }
                    }
                }
            }

            //all other cases as normal
            else {
                this.setAttribute('name', pieceName);
                document.getElementById(pieceID).setAttribute('name', 'empty');
                for (var i = 0; i <= 12; i++) {
                    var addImg = document.querySelectorAll('[name="' + piecesArray[i] + '"');
                    for (var j = 0; j < addImg.length; j++) {
                        if (i != 12) {
                            addImg[j].innerHTML = '<img src="../img/' + piecesArray[i] + '.png">';
                        } else {
                            addImg[j].innerHTML = "";
                        }
                    }
                }
            }
            scoreBoardObject = {
                'turn': turnCounter,
                'origin': origin,
                'destination': destination,
                'taken': takenPiece,
                'enPessant': enPessant,
                'castles': castles,
            };
            scoreBoardArray.push(scoreBoardObject);
            console.log(scoreBoardArray);
            scoreBoard.innerHTML += '<tr><td>(' + turnCounter + ') White: ' + Math.round(turnCounter / 2) + '</td><td>' + origin + '</td><td>' + destination + '</td></tr>';
            turnCounter++;
            originArray.push(origin);
            document.getElementById('turnColor').textContent = "Black's Turn";
        }

        //Black's Turn
        else if ((turnCounter + 2) % 2 == 0 && pieceColor == 'B') {

            //special case for Castles
            if (origin == 'KE8' && destination == 'KC8') {
                castles = true;
                document.getElementById('A8button').setAttribute('name', 'empty');
                document.getElementById('D8button').setAttribute('name', 'BR');
            }
            if (origin == 'KE8' && destination == 'KG8') {
                castles = true;
                document.getElementById('H8button').setAttribute('name', 'empty');
                document.getElementById('F8button').setAttribute('name', 'BR');
            }

            //special case for En Pessant
            if (enPessant == true) {
                takenPiece = removePiece.getAttribute('name');
                removePiece.setAttribute('name', 'empty');
            }

            //special case for Queen Promotion
            if (pieceName.charAt(1) == 'P' && destination.charAt(2) == 1) {
                promotionPiece = prompt('Please select the piece you would like to promote to (Q , R , B , N)', 'Q');
                this.setAttribute('name', 'B' + promotionPiece);
                destination = 'Q' + this.getAttribute('id').charAt(0) + this.getAttribute('id').charAt(1);
                document.getElementById(pieceID).setAttribute('name', 'empty');
                for (var i = 0; i <= 12; i++) {
                    var addImg = document.querySelectorAll('[name="' + piecesArray[i] + '"');
                    for (var j = 0; j < addImg.length; j++) {
                        if (i != 12) {
                            addImg[j].innerHTML = '<img src="../img/' + piecesArray[i] + '.png">';
                        } else {
                            addImg[j].innerHTML = "";
                        }
                    }
                }
            }

            //all other cases as normal
            else {
                this.setAttribute('name', pieceName);
                document.getElementById(pieceID).setAttribute('name', 'empty');
                for (var i = 0; i <= 12; i++) {
                    var addImg = document.querySelectorAll('[name="' + piecesArray[i] + '"');
                    for (var j = 0; j < addImg.length; j++) {
                        if (i != 12) {
                            addImg[j].innerHTML = '<img src="../img/' + piecesArray[i] + '.png">';
                        } else {
                            addImg[j].innerHTML = "";
                        }
                    }
                }
            }
            scoreBoardObject = {
                'turn': turnCounter,
                'origin': origin,
                'destination': destination,
                'taken': takenPiece,
                'enPessant': enPessant,
                'castles': castles,
            }
            scoreBoardArray.push(scoreBoardObject);
            console.log(scoreBoardArray);
            scoreBoard.innerHTML += '<tr><td>(' + turnCounter + ') Black: ' + Math.round(turnCounter / 2) + '</td><td>' + origin + '</td><td>' + destination + '</td></tr>';
            turnCounter++;
            originArray.push(origin);
            document.getElementById('turnColor').textContent = "White's Turn";
        }

        //remove old event listeners
        this.removeEventListener('click', doMove);
        for (var i = 0; i < document.getElementsByClassName('chessPiece').length; i++) {
            document.getElementsByClassName('chessPiece')[i].removeEventListener('click', doMove);
        }
    }

    //add images to named pieces
    for (var i = 0; i < 12; i++) {
        var addImg = document.querySelectorAll('[name="' + piecesArray[i] + '"');
        for (var j = 0; j < addImg.length; j++) {
            addImg[j].innerHTML = '<img src="../img/' + piecesArray[i] + '.png">';
        }
    }

    //function to undo last move
    function undoMove() {
        if (turnCounter > 1) {
            var turnHeader = document.getElementById('turnColor');
            var table = document.getElementById('moves');
            var rowCount = table.rows.length;
            turnCounter--;
            var colorOfPiece = '';
            if ((turnCounter + 1) % 2 == 0) {
                colorOfPiece = 'W';
            } else if ((turnCounter + 1) % 2 != 0) {
                colorOfPiece = 'B';
            }
            var piecename = colorOfPiece + scoreBoardArray[turnCounter - 1].origin.charAt(0);
            var returnTo = document.getElementById(scoreBoardArray[turnCounter - 1].origin.charAt(1) + scoreBoardArray[turnCounter - 1].origin.charAt(2) + 'button');
            var returnFrom = document.getElementById(scoreBoardArray[turnCounter - 1].destination.charAt(1) + scoreBoardArray[turnCounter - 1].destination.charAt(2) + 'button');
            var takenPiece = scoreBoardArray[turnCounter - 1].taken;

            //return the pieces to the last position
            returnTo.setAttribute('name', piecename);

            //special case for en Pessant
            if (scoreBoardArray[turnCounter - 1].enPessant == true && colorOfPiece == 'W') {
                returnFrom.setAttribute('name', 'empty');
                returnFrom = document.getElementById(scoreBoardArray[turnCounter - 1].destination.charAt(1) + 5 + 'button');
            } else if (scoreBoardArray[turnCounter - 1].enPessant == true && colorOfPiece == 'B') {
                returnFrom.setAttribute('name', 'empty');
                returnFrom = document.getElementById(scoreBoardArray[turnCounter - 1].destination.charAt(1) + 4 + 'button');
            }

            //special case for castles
            if (scoreBoardArray[turnCounter - 1].castles == true) {
                var c = scoreBoardArray[turnCounter - 1].destination.charAt(1) + scoreBoardArray[turnCounter - 1].destination.charAt(2);
                switch (c) {

                    case 'G1':
                        document.getElementById('F1button').setAttribute('name', 'empty');
                        document.getElementById('H1button').setAttribute('name', 'WR');
                        wKingMoved = false;
                        wRRookMoved = false;
                        break;
                    case 'C1':
                        document.getElementById('D1button').setAttribute('name', 'empty');
                        document.getElementById('A1button').setAttribute('name', 'WR');
                        wKingMoved = false;
                        wLRookMoved = false;
                        break;
                    case 'G8':
                        document.getElementById('F8button').setAttribute('name', 'empty');
                        document.getElementById('H8button').setAttribute('name', 'BR');
                        bKingMoved = false;
                        bRRookMoved = false;
                        break;
                    case 'C8':
                        document.getElementById('D8button').setAttribute('name', 'empty');
                        document.getElementById('A8button').setAttribute('name', 'BR');
                        bKingMoved = false;
                        bLRookMoved = false;
                        break;
                    default:
                        break;
                }
            }

            returnFrom.setAttribute('name', takenPiece);


            //add images
            for (var i = 0; i <= 12; i++) {
                var addImg = document.querySelectorAll('[name="' + piecesArray[i] + '"');
                for (var j = 0; j < addImg.length; j++) {
                    if (i != 12) {
                        addImg[j].innerHTML = '<img src="../img/' + piecesArray[i] + '.png">';
                    } else {
                        addImg[j].innerHTML = "";
                    }
                }
            }
            table.deleteRow(rowCount - 1);
            scoreBoardArray.pop();
            originArray.pop();
            if (turnCounter % 2 == 0) {
                turnHeader.textContent = "Black's Turn";
            } else if (turnCounter % 2 != 0) {
                turnHeader.textContent = "White's Turn";
            }
        }
    }

    //event trigger for undoMove
    document.getElementById('undo').addEventListener('click', undoMove, false);

    function submitGame() {


        if (scoreBoardArray.length) {
            if (confirm('Are you sure you would like to submit your game? This will start a new game.')) {

                let addProperty = (obj, propertyName, propertyValue) => {
                    obj[propertyName] = propertyValue;
                }

                for (var i = 0; i < scoreBoardArray.length; i++) {
                    var turn = 'turn ' + scoreBoardArray[i].turn;
                    var moved = scoreBoardArray[i].origin + ' to ' + scoreBoardArray[i].destination;
                    addProperty(chessDoc, turn, moved);
                }

                firebase
                    .firestore()
                    .collection('Chess')
                    .add(chessDoc);
                console.log(chessDoc);

                alert('Thank you for submitting your game!');
                newGame();
            }
        }
    }
    document.getElementById('submitGame').addEventListener('click', submitGame, false);

}

//events to create a new game
document.getElementById('resetBoard').addEventListener('click', newGame, false);
window.onload = newGame;

//function to hide scoreboard
function toggleScoreBoard() {

    //var for scoreboard
    var score = document.getElementById('moves');
    //if showing hide
    if (score.getAttribute('class') == 'show') {
        score.setAttribute('class', 'hide');
    }

    //if hiding show
    else if (score.getAttribute('class') == 'hide') {
        score.setAttribute('class', 'show');
    }
}

//event to hide scoreboard
document.getElementById('scoreToggle').addEventListener('click', toggleScoreBoard, false);

//function to change the board color
var lightColor = document.getElementById('lightColor');
var darkColor = document.getElementById('darkColor');
var lightSquares = document.getElementsByName('light');
var darkSquares = document.getElementsByName('dark');

function darkColorChanger() {
    for (var i = 0; i < darkSquares.length; i++) {
        darkSquares[i].style.backgroundColor = darkColor.value;
    }
}
function lightColorChanger() {
    for (var i = 0; i < lightSquares.length; i++) {
        lightSquares[i].style.backgroundColor = lightColor.value;
    }

}
lightColor.addEventListener('change', lightColorChanger, false);
darkColor.addEventListener('change', darkColorChanger, false);