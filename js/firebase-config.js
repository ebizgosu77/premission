/**
 * Firebase 초기화
 */
const firebaseConfig = {
  apiKey: "AIzaSyB7jPYq48Bo34FIVuovbyRpvjxtHnNtnJc",
  authDomain: "ai-camp-8abed.firebaseapp.com",
  databaseURL: "https://ai-camp-8abed-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ai-camp-8abed",
  storageBucket: "ai-camp-8abed.firebasestorage.app",
  messagingSenderId: "584549876513",
  appId: "1:584549876513:web:b56488be2214fd88c1f460",
  measurementId: "G-VF64VNFDKE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
