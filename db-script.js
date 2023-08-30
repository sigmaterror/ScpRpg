// Configuração do Firebase
var firebaseConfig = {
    apiKey: "AIzaSyCuR2Xni3U8YWrAswwY9rSVChJh7aiW07Y",
    authDomain: "db-scprpg.firebaseapp.com",
    databaseURL: "https://db-scprpg.firebaseio.com",
    projectId: "db-scprpg",
    storageBucket: "db-scprpg.appspot.com",
    messagingSenderId: "1013740643174",
    appId: "1:1013740643174:web:ecd729431146f355f61ea7"
};
let DbJogador;
let jogador;
let scpClassD;
// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
var db = firebase.firestore();

// Função para ouvir alterações nos dados do jogador em tempo real
function listenToPlayerDataChanges(user) {
    var jogador = db.collection('players').doc(user.uid);

    jogador.onSnapshot((doc) => {
        if (doc.exists) {
            var playerData = doc.data();
            document.getElementById('player-name').textContent = playerData.name;
            document.getElementById('player-level').textContent = playerData.lvl;
            document.getElementById('player-xp').textContent = playerData.xp;
            document.getElementById('player-sanidade').textContent = playerData.sanidade;
        } else {
            console.log("Nenhum documento encontrado!");
        }
    }, (error) => {
        console.log("Erro ao obter documento:", error);
    });
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Se o usuário estiver autenticado, ouça as alterações nos dados
        listenToPlayerDataChanges(user);
        var jogador = db.collection('players').doc(user.uid);

    } else {
        // Se o usuário não estiver autenticado, autentique-o anonimamente
        firebase.auth().signInAnonymously()
        .then((userCredential) => {
            var user = userCredential.user;
            var jogador = db.collection('players').doc(user.uid);
            
            // Verifique se o jogador já existe
            return jogador.get().then((doc) => {
                if (!doc.exists) {
                    var randomID = "classe-D-" + Math.floor(1000 + Math.random() * 9000);
                    return jogador.set({
                        name: randomID,
                        xp: 0,
                        maxexp: 50,
                        lvl: 1,
                        status: 'livre',
                        classDTest: 'scp-000',
                        inteligencia: 0,
                        furtividade: 0,
                        agilidade: 0,
                        força: 0,
                        atributospontos: 5,
                        sanidade: 100
                    });
                }
            });
        })
        .then(() => {
            // Após verificar/criar o jogador, ouça as alterações nos dados
            listenToPlayerDataChanges(user);
        })
        .catch((error) => {
            console.error("Erro:", error);
        });
    }
});


function getSCPData(scpId) {
    var scpRef = db.collection('scps').doc(scpId);

    return scpRef.get().then((doc) => {
        if (doc.exists) {
            return doc.data();
        } else {
            console.log("SCP não encontrado!");
            return null;
        }
    }).catch((error) => {
        console.log("Erro ao obter SCP:", error);
    });
}



