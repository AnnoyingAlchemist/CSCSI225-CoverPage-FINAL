const firebaseConfig = {
    apiKey: "AIzaSyAb9zglNHMpwfHoQaL8v-jxd_dNN-A7_u4",
    authDomain: "game-site-d97cf.firebaseapp.com",
    projectId: "game-site-d97cf",
    storageBucket: "game-site-d97cf.appspot.com",
    messagingSenderId: "1058182439081",
    appId: "1:1058182439081:web:ccc1d2944102c2db9089b8",
    measurementId: "G-F04G3G3QTW"
};
var bugReport = "";

window.onload = function() {
    firebase.initializeApp(firebaseConfig);
}



function sendReport() {
    bugReport = document.getElementById('report').value;
    //console.log("Report: "+bugReport);
    
    firebase.firestore().collection('bugs').add({
    report: bugReport
  });
  document.getElementById('submitReport').value = "Thank you!";
}

document.getElementById('submitReport').addEventListener('click', sendReport, false);