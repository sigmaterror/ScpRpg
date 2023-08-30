// Variável para armazenar o usuário autenticado
let user;
let scpData = {};
// Listener para detectar mudanças no estado de autenticação
firebase.auth().onAuthStateChanged(function(currentUser) {
    if (currentUser) {
        // Usuário está autenticado
        user = currentUser;
    } else {
        // Usuário não está autenticado
        console.warn("Nenhum usuário autenticado encontrado!");
    }
});



//jogo skil check
let enchimento = false;
let EncherInterval;
let calcDificuldade = 0.01; // ajuste de dificuldade
const EncherBar = document.querySelector('.Encher');
const button = document.getElementById('startStopBtn');
const targetMarker = document.getElementById('targetMarker');
const minTargetMarker = document.getElementById('minTargetMarker');
const scoreDisplay = document.getElementById('score');
let score = 0;
let targetWidth = Math.random() * 70 + 15; // entre 15% e 85%
let minTargetWidth = targetWidth - 15; // ajuste tamanho primeira skill check 
targetMarker.style.left = targetWidth + '%';
minTargetMarker.style.left = minTargetWidth + '%';
let countdownInterval;
let countdown;
let firstStart = true;
let consecutiveHits = 0;

let challengeData = {};
let jogadorData = {};
let scpemclassDTest;
let regressiva;

const metaEnchendo = document.getElementById('metaEnchendo');
let metaPercentage = 0; // Inicialmente, a barra estará vazia

let gameOverTriggered = false; // Variável para rastrear se já estamos em um estado de gameOver

function startCountdown() {
    const db = firebase.firestore();
    const jogadorRef = db.collection('players').doc(user.uid); 
    jogadorRef.get().then((doc) => {
        const jogadorData = doc.data();
        scpemclassDTest = jogadorData.classDTest;

        const scpChallengeRef = db.collection('scpDblist').doc(user.uid + "_" + scpemclassDTest);
        scpChallengeRef.get().then((doc) => {
            if (doc.exists) {
                const challengeData = doc.data();
                regressiva = challengeData.time;

                countdown = regressiva;
                countdownInterval = setInterval(() => {
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);

                    }
                }, 1000);

            } else {
                console.error("Documento não encontrado555!");
            }
        }).catch((error) => {
            console.error("Erro ao obter o documento:", error);
        });

    })
 
   
}

function toggleEncher() {
    if (firstStart) {
        startCountdown();
        firstStart = false;
    }
    if (enchimento) {
        stopEncher();
    } else {
        startEncher();
        
    }
}

function startEncher() {
	
    enchimento = true;
    button.innerText = 'Parar';
    
    // Mostrar os marcadores de limite
    targetMarker.style.display = 'block';
    minTargetMarker.style.display = 'block';

    EncherInterval = setInterval(() => {
        const currentWidth = parseFloat(getComputedStyle(EncherBar).width);
        const barWidth = parseFloat(getComputedStyle(document.querySelector('.bar')).width);
        
        if (currentWidth / barWidth * 100 >= targetWidth) {
            gameOver();
            return;
        }
        
        EncherBar.style.width = currentWidth + (barWidth * calcDificuldade) + 'px';
    }, 30); // enche a barra da skill check a cada 30 milisegundos /ajuste de dificuldade
}

function stopEncher() {
    enchimento = false;
    clearInterval(EncherInterval);
    button.innerText = 'Iniciar';
    
    const currentWidth = parseFloat(getComputedStyle(EncherBar).width);
    const barWidth = parseFloat(getComputedStyle(document.querySelector('.bar')).width);
    
    const db = firebase.firestore();

    const jogadorRef = db.collection('players').doc(user.uid); 
    jogadorRef.get().then((doc) => {
        const jogadorData = doc.data();
        scpemclassDTest = jogadorData.classDTest;
    });
    const scpChallengeRef = db.collection('scpDblist').doc(user.uid + "_" + scpemclassDTest);
    
    scpChallengeRef.get().then((doc) => {
        if (doc.exists) {
            scpData = doc.data();
            
            if (currentWidth / barWidth * 100 >= minTargetWidth && currentWidth / barWidth * 100 <= targetWidth && gameOverTriggered == false) {


                // Atualizar a barra laranja
                metaPercentage += 100 / scpData.difficulty;
                metaEnchendo.style.width = metaPercentage + '%'; // Atualiza o preenchimento da barra laranja

                if (metaPercentage >= 100) {
                    metaPercentage = 100; // Garante que não ultrapasse 100%
                    clearInterval(EncherInterval);
                    resetGame();
                    changeSection('main-to-class-d-test-vitoria');
                } else {
                    resetGame();
                    startEncher(); // Inicia automaticamente uma nova skill check
                }
            } else {
                // Chama gameOver apenas se não estivermos já em um estado de gameOver
                if (!gameOverTriggered) {
                    gameOverTriggered = true;
                    gameOver();
                }
            }
        } else {
            console.error("Documento SCP não encontrado!");
        }
    }).catch((error) => {
        console.error("Erro ao obter o documento SCP:", error);
    });
}

function gameOver() {

    resetGame();
    stopEncher();
    gameOverTriggered = false; 
    changeSection('main-to-class-d-test-gameover');
	
}

function resetGame() {
    EncherBar.style.width = '0%';
    targetWidth = Math.random() * 70 + 15;
    minTargetWidth = targetWidth - 5;
    targetMarker.style.left = targetWidth + '%';
    minTargetMarker.style.left = minTargetWidth + '%';
    
    // Ocultar os marcadores de limite
    targetMarker.style.display = 'none';
    minTargetMarker.style.display = 'none';
}

function startSCPChallenge(scpId, userId) {
    // Obter referências para os documentos
    var playerSCPRef = db.collection('player_scp').doc(userId + "_" + scpId);
    var scpRef = db.collection('scpDblist').doc(userId + "_scp-" + scpId);

    return scpRef.get().then((doc) => {
        if (doc.exists) {
            var scpData = doc.data();

            // Verificar se o jogador já enfrentou esse SCP antes
            return playerSCPRef.get().then((playerDoc) => {
                if (!playerDoc.exists) {
                    // Se o jogador nunca enfrentou esse SCP, crie um novo registro
                    return playerSCPRef.set({
                        playerId: userId,
                        scpId: scpId,
                        lvl: 1,
                        difficulty: scpData.dificuldade
                    });
                }
            });
        } else {
            changeSection('main-to-classe-d-test');
            return null;
        }
    }).catch((error) => {
        console.log("Erro ao iniciar o desafio SCP:", error);
    });
}

function challengeSCP(scpId) {
    
    if (user) {
        var jogador = db.collection('players').doc(user.uid);

        // Verificar o status do jogador ao clicar no botão
        document.querySelector("[data-section='main-to-scp-select']").addEventListener("click", function() {
            jogador.get().then((doc) => {
                if (doc.exists) {
                    var playerData = doc.data();
                    if (playerData.status === "classe-D-test") {
                        changeSection('main-to-classe-d-test');
                    } else {
                        changeSection('main-to-scp-select');
                    }
                }
            });
        });

        jogador.get().then((doc) => {
            if (doc.exists) {
                var playerData = doc.data();

                if (playerData.sanidade > 5) {

 
                    var scpChallengeRef = db.collection('scpDblist').doc(user.uid + "_" + scpId);

                    scpChallengeRef.get().then((doc) => {
                        if (!doc.exists) {
                            // Se o desafio não existir, obtemos os dados padrão do SCP da coleção scpPresets
                            var scpPresetRef = db.collection('scpPresets').doc(scpId);
                            scpPresetRef.get().then((presetDoc) => {
                                if (presetDoc.exists) {
                                    var presetData = presetDoc.data();
                                    scpChallengeRef.set({
                                        playerId: user.uid,
                                        scpId: scpId,
                                        level: presetData.level,
                                        difficulty: presetData.difficulty,
										name: presetData.name,
										time: presetData.time,
										maxExp: presetData.maxExp
								 // Adicione outros campos conforme necessário
										}).then(() => {
                                            challengeSCP(scpId)
                                            changeSection('main-to-classe-d-test');
											
										});
									} else {
										console.error("Dados padrão do SCP não encontrados!");
                                }
                            });

                        } else {
                            var scpData = doc.data();
                            displaySCPChallenge(scpData);

                            var scpName = scpData.scpId;
                            if (scpName) {
                                var formattedName = scpName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                                var bannerDiv = document.querySelector('.banner-scp-class-d-test');
                                bannerDiv.style.backgroundImage = "url('img/class-d-test/banner-scp/" + formattedName + ".png')";
                               //update exemplo 
                                jogador.update({
                                    classDTest: scpId,
                                    status: "classe-D-test"
                                });
								// Após definir os valores, exiba a tela do game skill check
											changeSection('main-to-classe-d-test');
                            } else {
                                console.error("Nome do SCP não encontrado! #2");
                            }
                        }
                    }).catch((error) => {
                        console.error("Erro ao desafiar SCP:", error);
                    });
                } else {
                    document.getElementById('main-to-classe-d-test').style.display = 'none';
                    alert("Sanidade insuficiente para desafiar o SCP!");
                }
            } else {
                console.error("Dados do jogador não encontrados!");
            }
        }).catch((error) => {
            console.error("Erro ao obter dados do jogador:", error);
        });
    }
}

function displaySCPChallenge(scpData) {
    document.getElementById('scp-name').textContent = scpData.scpId;
    document.getElementById('scp-difficulty').textContent = scpData.difficulty;
}

function getSCPDetails(scpId) {
    var scpRef = db.collection('scps').doc(scpId);
    
    scpRef.get().then((doc) => {
        if (doc.exists) {
            var scpDetails = doc.data();
            document.getElementById('scp-description').textContent = scpDetails.description;
        } else {
            console.error("SCP não encontrado! #1");
        }
    }).catch((error) => {
        console.error("Erro ao obter detalhes do SCP:", error);
    });
}