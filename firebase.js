// CONFIGURAÇÃO
firebase.initializeApp({
  apiKey: "AIzaSyA-VlrQcVxkoiAjOAIEFXrX_RYjN2Bf-WE",
  authDomain: "financasequilibrium-7c2b4.firebaseapp.com",
  projectId: "financasequilibrium-7c2b4"
});

const auth = firebase.auth();
const db = firebase.firestore();

let userId = null;

// LOGIN ANÔNIMO AUTOMÁTICO
auth.signInAnonymously()
  .then(cred => {
    userId = cred.user.uid;
    carregarDados();
  })
  .catch(err => {
    console.error("Erro no login Firebase", err);
  });
