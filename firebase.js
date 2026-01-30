// CONFIGURAÇÃO FIREBASE
firebase.initializeApp({
  apiKey: "AIzaSyA-VlrQcVxkoiAjOAIEFXrX_RYjN2Bf-WE",
  authDomain: "financasequilibrium-7c2b4.firebaseapp.com",
  projectId: "financasequilibrium-7c2b4"
});

const auth = firebase.auth();
const db = firebase.firestore();

// login anônimo
auth.signInAnonymously().catch(err => {
  console.error("Erro no login Firebase", err);
});
