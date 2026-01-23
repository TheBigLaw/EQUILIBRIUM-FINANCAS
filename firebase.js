// CONFIGURAÇÃO
firebase.initializeApp({
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID"
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
