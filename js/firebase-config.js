// Configuración y conexión centralizada a Firebase Realtime Database
const firebaseConfig = {
    apiKey: "AIzaSyA6jvnsXZwF2anOJo3VadfNvn7Fl6Z5efY",
    authDomain: "sistema-mac-reportes.firebaseapp.com",
    databaseURL: "https://sistema-mac-reportes-default-rtdb.firebaseio.com",
    projectId: "sistema-mac-reportes",
    storageBucket: "sistema-mac-reportes.firebasestorage.app",
    messagingSenderId: "776250701305",
    appId: "1:776250701305:web:ac542564b7f7a136cef928"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();