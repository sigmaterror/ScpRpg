
document.addEventListener('DOMContentLoaded', function() {

//audio botoes menu
    var buttons = document.querySelectorAll('.menu button'); 
    var audio = document.getElementById('click_button');
    audio.volume = 0.1; // Define o volume

    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            audio.currentTime = 0; // Isso garante que o som possa ser reproduzido novamente mesmo se ainda estiver tocando
            audio.play();
        }); 
});


// variável user do jogador
var user = firebase.auth().currentUser;


//menu inferior  
document.getElementById('main-to-inicio').style.display = 'block';

    let menuButtons = document.querySelectorAll('.menu button');
    menuButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            let section = button.getAttribute('data-section');
            let gameSections = document.querySelectorAll('.game-section');
            gameSections.forEach(function(section) {
                section.style.display = 'none';
            });
            document.getElementById(section).style.display = 'block';
        });
    });
 //botoes lista de scps da pagina ClassD com acesso liberado
    document.querySelectorAll('.classDAcess').forEach(button => {
        button.addEventListener('click', function() {
            var scpId = this.getAttribute('data-scp-id');
            challengeSCP(scpId); //inicia o mini game classe D skill checks
        });
    });
});


// Função auxiliar para mudar a seção
function changeSection(sectionId) {
    // Esconder todas as seções
    let sections = document.querySelectorAll('.game-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Exibir a seção desejada
    document.getElementById(sectionId).style.display = 'block';
}
