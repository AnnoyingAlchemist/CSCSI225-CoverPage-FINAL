
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAb9zglNHMpwfHoQaL8v-jxd_dNN-A7_u4",
    authDomain: "game-site-d97cf.firebaseapp.com",
    projectId: "game-site-d97cf",
    storageBucket: "game-site-d97cf.appspot.com",
    messagingSenderId: "1058182439081",
    appId: "1:1058182439081:web:ccc1d2944102c2db9089b8",
    measurementId: "G-F04G3G3QTW"
};

// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//Logic for the game

//array of coins
var coinsArray = [];
var turnCounter;
//function for new game
function newNIMGame() {
    turnCounter = 1;
    displayTurn();
    console.log("Turn: " + turnCounter);

    coinsArray = [];
    for (var i = 0; i < 12; i++) {
        coinsArray.push('<img src="../img/nim/coin.png" width="150">');
    }
    document.getElementById('coins_box').innerHTML = '';
    for (var i = 0; i < 12; i++) {
        document.getElementById('coins_box').innerHTML += coinsArray[i];
    }
}
document.getElementById('reloadNIM').addEventListener('click', newNIMGame, false);
window.onload = newNIMGame;

//function for take 1
function takeOne() {
    if (coinsArray.length) {
        document.getElementById('coins_box').innerHTML = '';
        coinsArray.pop();
        turnCounter++;
        displayTurn();
        console.log("Turn: " + turnCounter);
        for (var i = 0; i < coinsArray.length; i++) {
            document.getElementById('coins_box').innerHTML += coinsArray[i];
        }
    } else {
        alert('No coins remaining. Please select new game!');
    }
}
document.getElementById('takeOne').addEventListener('click', takeOne, false);

//function for take 2
function takeTwo() {
    if (coinsArray.length > 1) {
        document.getElementById('coins_box').innerHTML = '';
        coinsArray.pop();
        coinsArray.pop();
        turnCounter++;
        displayTurn();
        console.log("Turn: " + turnCounter);
        for (var i = 0; i < coinsArray.length; i++) {
            document.getElementById('coins_box').innerHTML += coinsArray[i];
        }
    } else if (coinsArray.length) {
        alert('Not enough coins!');
    } else {
        alert('No coins remaining. Please select new game!');
    }
}
document.getElementById('takeTwo').addEventListener('click', takeTwo, false);

//function for take 3
function takeThree() {
    if (coinsArray.length > 2) {
        document.getElementById('coins_box').innerHTML = '';
        coinsArray.pop();
        coinsArray.pop();
        coinsArray.pop();
        turnCounter++;
        displayTurn();
        console.log("Turn: " + turnCounter);

        for (var i = 0; i < coinsArray.length; i++) {
            document.getElementById('coins_box').innerHTML += coinsArray[i];
        }
    } else if (coinsArray.length) {
        alert('Not enough coins!');
    } else {
        alert('No coins remaining. Please select new game!');
    }
}
document.getElementById('takeThree').addEventListener('click', takeThree, false);

function displayTurn() {
    if (turnCounter % 2 == 0) {
        document.getElementById("playerTurn").textContent = "Player 2's turn";
    }
    else {
        document.getElementById("playerTurn").textContent = "Player 1's turn";
    }
}




