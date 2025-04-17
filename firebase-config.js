// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCy0Fq5S3Tg5B8EfZymZ1CLLTU_vHZSDCg",
  authDomain: "sakhasampark-ddrm.firebaseapp.com",
  databaseURL: "https://sakhasampark-ddrm-default-rtdb.firebaseio.com",
  projectId: "sakhasampark-ddrm",
  storageBucket: "sakhasampark-ddrm.appspot.com",
  messagingSenderId: "936102964745",
  appId: "1:936102964745:web:9108449d3a3f3482b092d8",
  measurementId: "G-NLBKKF58Q0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Enable persistence to work offline
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(function(error) {
    console.error("Error setting persistence:", error);
  });