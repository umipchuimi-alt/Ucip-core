/* ==========================================
   UCIP CORE
   CONTROL DE PANTALLAS
========================================== */

// Pantallas
const homeScreen = document.getElementById("home-screen");
const monitorScreen = document.getElementById("monitor-screen");

// Botones
const startBtn = document.getElementById("start-btn");
const continueBtn = document.querySelector(".continue-monitor");
const blackScreen = document.getElementById("black-screen");
const dosScreen = document.getElementById("dos-screen");
const dosText = document.getElementById("dos-text");
const dosActions = document.getElementById("dos-actions");
const continueDos = document.getElementById("continue-dos");
const recoveryScreen = document.getElementById("recovery-screen");
const restoreModal = document.getElementById("restoreModal");

const restoreConsole = document.getElementById("restoreConsole");
const restoreButtons = document.getElementById("restoreButtons");

const btnInforme = document.getElementById("btnInforme");
if(btnInforme){

    btnInforme.addEventListener("click",generarInformePDF);

}
const recoveryContent = document.getElementById("recovery-content");
const startRecovery = document.getElementById("start-recovery");

// Sonido monitor
const monitorSound = new Audio("monitor-beep.mp3");

monitorSound.loop = true;
monitorSound.volume = 0.3;

// Sonido de alarma
const alarmSound = new Audio("soundsgoodmusic-alarm-2-375697.mp3");
alarmSound.loop = true;
alarmSound.volume = 0.5;
/* ==========================
   SONIDOS RECOVERY
========================== */

const recoveryBeep = new Audio("beep.mp3");
recoveryBeep.volume = 0.35;

const recoverySuccess = new Audio("success.mp3");
recoverySuccess.volume = 0.45;
// Sonido inicio simulación
const startSound = new Audio("start.sound.mp3");
startSound.volume = 0.6;

/* ==========================
   SONIDO ERROR
========================== */

const errorSound = new Audio("error.mp3");
errorSound.volume = 0.45;

/* ==========================================
   SONIDO DESCONEXIÓN
========================================== */

const disconnectSound = new Audio("disconnect.mp3");
disconnectSound.volume = 0.45;


/* ==========================================
   MOTOR DE SIMULACIÓN
========================================== */

const simulacion = {

    tiempoRestante: 45 * 60,

    tiempoAgotado: false, // 45 minutos

    tiempoEmpleado: 0,

    errores: 0,

    tiempos:{

    respirador:0,

    bedside:0,

    monitor:0,

    bombas:0

},

    paciente: {

        nombre: "Mateo G.",
        edad: 6,
        peso: 22,
        diagnostico: "Bronquiolitis grave",
        box: "BOX-09",

        estado:{

    texto:"🔴 CRÍTICO",

    clase:"critical",

    porcentaje:28

},

        constantes: {

            fc: 162,
            spo2: 72,
            taSis: 62,
            taDia: 34,
            fr: null,
            etco2: null

        }

    },

   sistemas:{

    respirador:{
        estado:"DISPONIBLE",
        recuperado:false
    },

    monitor:{
        estado:"BLOQUEADO",
        recuperado:false
    },

    bombas:{
        estado:"BLOQUEADO",
        recuperado:false
    },

    bedside:{
        estado:"BLOQUEADO",
        recuperado:false
    }

}

};
/* ==========================================
   TEMPORIZADOR GLOBAL
========================================== */

let intervaloTiempo = null;

/* ==========================================
   RELOJ DE LA SIMULACIÓN
========================================== */

function iniciarTemporizador(){

    if(intervaloTiempo) return;

    actualizarTemporizador();

    intervaloTiempo = setInterval(()=>{

        simulacion.tiempoRestante--;

        actualizarTemporizador();

    if(simulacion.tiempoRestante <= 0){

    clearInterval(intervaloTiempo);

    intervaloTiempo = null;

    simulacion.tiempoRestante = 0;

    // El tiempo máximo empleado son 45 minutos
    simulacion.tiempoEmpleado = 45 * 60;

    // Marcar que la misión terminó por tiempo
    simulacion.tiempoAgotado = true;

    mostrarFinTiempo();

}

    },1000);

}

function actualizarTemporizador(){

    const minutos = Math.floor(simulacion.tiempoRestante/60);

    const segundos = simulacion.tiempoRestante%60;

    const tiempo =
        String(minutos).padStart(2,"0")
        + ":"
        + String(segundos).padStart(2,"0");

    document.querySelectorAll(".timer-global").forEach(el=>{

        el.textContent = tiempo;

    });
}
function mostrarFinTiempo(){

    // Registrar el tiempo máximo empleado
    simulacion.tiempoEmpleado = 45 * 60;

    // Detener cualquier sonido que pueda estar activo
    if(typeof alarmSound !== "undefined"){
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }

    // Crear pantalla final
    const gameOver = document.createElement("div");

    gameOver.id = "game-over-screen";

    gameOver.innerHTML = `

        <div class="game-over-box">

            <div class="game-over-alert">
                ⚠
            </div>

            <div class="game-over-title">
                TIEMPO AGOTADO
            </div>

            <div class="game-over-subtitle">
                UCIP CORE · EMERGENCY PROTOCOL
            </div>

            <div class="game-over-divider"></div>

            <div class="game-over-critical">
                🔴 ESTADO DEL PACIENTE: CRÍTICO
            </div>

            <div class="game-over-message">

                La ventana de recuperación
                ha finalizado.

            </div>

            <div class="game-over-patient">

                <strong>PACIENTE NO RECUPERADO</strong>

                <br><br>

                FIN DE LA MISIÓN

            </div>

            <div class="game-over-stats">

                <div>
                    <span>MÓDULOS RECUPERADOS</span>
                    <strong>${contarModulosRecuperados()}/4</strong>
                </div>

                <div>
                    <span>TIEMPO EMPLEADO</span>
                    <strong>45:00</strong>
                </div>

                <div>
                    <span>ERRORES</span>
                    <strong>${simulacion.errores}</strong>
                </div>

            </div>

            <button
                id="btnInformeGameOver"
                class="game-over-btn">

                📄 GENERAR INFORME DE MISIÓN

            </button>

        </div>

    `;

    document.body.appendChild(gameOver);

    // Conectar botón con el mismo generador PDF
    document
        .getElementById("btnInformeGameOver")
        .addEventListener(
            "click",
            generarInformePDF
        );

}
function contarModulosRecuperados(){

    let total = 0;

    if(simulacion.sistemas.respirador.recuperado)
        total++;

    if(simulacion.sistemas.bedside.recuperado)
        total++;

    if(simulacion.sistemas.monitor.recuperado)
        total++;

    if(simulacion.sistemas.bombas.recuperado)
        total++;

    return total;

}

/* ==========================================
   FINALIZAR SIMULACIÓN
========================================== */

function finalizarSimulacion(){

    clearInterval(intervaloTiempo);

    intervaloTiempo = null;

    simulacion.tiempoEmpleado =
        (45*60) - simulacion.tiempoRestante;

}

/* ==========================================
   TRANSICIÓN ENTRE PISTAS
========================================== */

function transicionPista(callback){

    const panel = document.getElementById("transicion-pista");

    panel.style.display = "flex";

    recoveryBeep.currentTime = 0;
    recoveryBeep.play().catch(()=>{});

  setTimeout(()=>{

    panel.style.display = "none";

    callback();

    setTimeout(()=>{

        document.querySelector(".recovery-panel").scrollTop = 0;

    },50);

},900);

}

console.log("Botón encontrado:", continueBtn);
console.log("Pantalla negra:", blackScreen);
/*==========================================
  INICIAR SIMULACIÓN
==========================================*/

const briefingScreen = document.getElementById("briefing-screen");
const btnBriefing = document.getElementById("btnBriefing");
const numParticipantes = document.getElementById("numParticipantes");
const listaParticipantes =
document.getElementById("listaParticipantes");

if(startBtn){

    startBtn.addEventListener("click",()=>{

        homeScreen.style.display="none";
        briefingScreen.style.display="flex";
        numParticipantes.value = "";
listaParticipantes.innerHTML = "";

    });

}

btnBriefing.addEventListener("click",()=>{

    if(numParticipantes.value===""){

        alert("Indica el número de participantes.");

        return;

    }

    const participantes=[];

    const inputs=document.querySelectorAll(".participante-input");

    for(const input of inputs){

        if(input.value.trim()===""){

            alert("Debes rellenar todos los participantes.");

            input.focus();

            return;

        }

        participantes.push(input.value.trim());

    }

simulacion.participantes = participantes;
simulacion.numParticipantes = participantes.length;

mostrarValidacionEquipo();

});
numParticipantes.addEventListener("input",()=>{

    listaParticipantes.innerHTML="";

    const total = Math.min(Number(numParticipantes.value),10);
    if(total > 10){

    numParticipantes.value = 10;

}

    if(total<1) return;

    for(let i=1;i<=total;i++){

      listaParticipantes.innerHTML += `

<input
    type="text"
    class="participante-input"
    placeholder="Nombre y apellidos del participante ${i}"
    autocomplete="off"
    required>

`;

    }

});
/*==========================================
  VALIDACIÓN DEL EQUIPO
==========================================*/

function mostrarValidacionEquipo(){

    briefingScreen.innerHTML = `

        <div class="briefing-card">

            <div class="briefing-icon">✔</div>

            <h1>EQUIPO REGISTRADO</h1>

            <h2>VALIDANDO CREDENCIALES...</h2>

            <div class="briefing-text">

                <p>Participantes registrados correctamente.</p>

                <p><strong>${simulacion.numParticipantes} participantes identificados.</strong></p>

                <p>Asignando permisos de acceso...</p>

                <p>Preparando entorno de simulación...</p>

            </div>

        </div>

    `;

    setTimeout(()=>{

        briefingScreen.style.display = "none";

        monitorScreen.style.display = "flex";

        monitorSound.play().catch(()=>{});

    },1800);

}
/*==========================================
  CONTINUAR
==========================================*/

let cyberAttack = false;
let attackStarted = false;

if (continueBtn) {

    continueBtn.addEventListener("click", () => {

        if (attackStarted) return;

        attackStarted = true;

        cyberAttack = true;

        // Oculta el botón inmediatamente
        continueBtn.style.display = "none";

        console.log("Ciberataque iniciado");

        setTimeout(() => {

            flashBlackScreen();

        }, 2500);

    });

}

function flashBlackScreen() {

    // Primer apagón
   blackScreen.style.opacity = "1";

disconnectSound.currentTime = 0;
disconnectSound.play().catch(()=>{});

    setTimeout(() => {

        // Vuelve la imagen
        blackScreen.style.opacity = "0";

        setTimeout(() => {

            // Segundo apagón
            blackScreen.style.opacity = "1";
            disconnectSound.currentTime = 0;
disconnectSound.play().catch(()=>{});

            setTimeout(() => {

                // Vuelve otra vez
                blackScreen.style.opacity = "0";

                setTimeout(() => {

                    // Tercer apagón
                    blackScreen.style.opacity = "1";
                    disconnectSound.currentTime = 0;
disconnectSound.play().catch(()=>{});

                    setTimeout(() => {

                        // Último intento
                        blackScreen.style.opacity = "0";

                        setTimeout(() => {

                            // Apagón definitivo
                            blackScreen.style.opacity = "1";
                            disconnectSound.currentTime = 0;
disconnectSound.play().catch(()=>{});

                            // Detiene el sonido del monitor
monitorSound.pause();
monitorSound.currentTime = 0;

                            // Inicia la alarma
alarmSound.play().catch(err => console.log(err));

                            // Aquí aparecerá el terminal MS-DOS
                            typeDOS([


"Microsoft Windows Recovery Console",
"",
"Boot sequence interrupted...",
"",
"Checking system files...",
"OK",
"",
"Checking patient database...",
"FAILED",
"",
"Checking ventilator network...",
"FAILED",
"",
"Unauthorized access detected...",
"",
"Decrypting network...",
"",
"████ ENCRYPTION COMPLETE ████",
"",
"YOUR HOSPITAL HAS BEEN COMPROMISED",
"",
">"

]);

                        }, 120);

                    }, 150);

                }, 180);

            }, 120);

        }, 350);

    }, 120);

}


function typeDOS(lines) {

    blackScreen.style.opacity = "0";
    dosScreen.style.display = "block";
    dosText.textContent = "";

    let line = 0;

    function nextLine() {

  if (line >= lines.length) {

    startCursor();

  setTimeout(() => {

    // Se detiene la alarma
    alarmSound.pause();
    alarmSound.currentTime = 0;

    // Detener el cursor
    clearInterval(cursorInterval);

    // Quitar el bloque █ si está al final
    dosText.textContent = dosText.textContent.replace(/█$/, "");

    // Escribir la última línea
    escribirLineaTerminal("\n\n> PRESS ENTER TO CONTINUE...", () => {

        setTimeout(() => {

            dosActions.style.display = "block";

        }, 500);

    });

}, 3000);

    return;

}
        let text = lines[line];
        let i = 0;

        function writeChar() {

            if (i < text.length) {

               dosText.textContent += text.charAt(i);


i++;

setTimeout(writeChar, 25);

            } else {

                dosText.textContent += "\n";

                line++;

                setTimeout(nextLine, 500);

            }

        }

        writeChar();

    }

    nextLine();

}
function escribirLineaTerminal(texto, callback){
    disconnectSound.pause();
    disconnectSound.currentTime = 0;

    let i = 0;

    function escribir(){

        if(i < texto.length){

            dosText.textContent += texto.charAt(i);
            i++;

            setTimeout(escribir, 25);

        }else{

            if(callback) callback();

        }

    }

    escribir();

}
let cursorInterval;

function startCursor(){

    cursorInterval = setInterval(()=>{

        if(dosText.textContent.endsWith("█")){

            dosText.textContent =
                dosText.textContent.slice(0,-1);

        }else{

            dosText.textContent += "█";

        }

    },500);

}

const canvas = document.getElementById("ecgCanvas");

const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 90;

let offset = 0;

function drawECG(){

   if(cyberAttack){
        requestAnimationFrame(drawECG);
        return;
    }

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="#00ff55";
    ctx.lineWidth=3;

    ctx.beginPath();

    for(let x=-offset;x<canvas.width+200;x+=160){

        ctx.moveTo(x,45);

        ctx.lineTo(x+40,45);

        ctx.lineTo(x+55,35);

        ctx.lineTo(x+65,45);

        ctx.lineTo(x+75,45);

        ctx.lineTo(x+82,70);

        ctx.lineTo(x+90,10);

        ctx.lineTo(x+98,80);

        ctx.lineTo(x+108,45);

        ctx.lineTo(x+160,45);

    }

    ctx.stroke();

    offset+=2;

    if(offset>=160){

        offset=0;

    }

    requestAnimationFrame(drawECG);

}
function mostrarPantallaEmergencia() {

    recoveryScreen.style.display = "flex";
    startRecovery.style.display = "none";

    recoveryContent.innerHTML = `

        <div class="recovery-title">
            UCIP CORE RECOVERY ENVIRONMENT
        </div>

        <div class="recovery-subtitle">
            Analizando integridad del sistema...
        </div>

        <div id="progress-container">

            <div id="progress-bar"></div>

        </div>

        <div id="progress-percent">0%</div>

        <div id="diagnostic-log"></div>

    `;

    iniciarDiagnostico();

}
function iniciarDiagnostico(){

    const log = document.getElementById("diagnostic-log");
    const bar = document.getElementById("progress-bar");
    const percent = document.getElementById("progress-percent");

 const diagnosticos = [

    {
        nombre:"Ventilador mecánico",
        estado:"OFFLINE",
        detalle:"MODO MANUAL"
    },

    {
        nombre:"Historia clínica electrónica",
        estado:"OFFLINE",
        detalle:"SIN ACCESO"
    },

    {
        nombre:"Monitorización",
        estado:"OFFLINE",
        detalle:"MODO MANUAL"
    },

    {
        nombre:"Unidad de control de bombas",
        estado:"OFFLINE",
        detalle:"MODO MANUAL"
    }

];

    let progreso = 0;
    let indice = 0;

    avanzar();

    function avanzar(){

        if(indice >= diagnosticos.length){

            finalizar();

            return;

        }

        analizarModulo(diagnosticos[indice]);

    }

    function analizarModulo(modulo){

        escribirLinea("► Analizando " + modulo.nombre + "...", ()=>{

            esperar(400, ()=>{

                escribirLinea("   Conectando...", ()=>{

                    incrementar();

                    esperar(250, ()=>{

                        escribirLinea("   Verificando integridad...", ()=>{

                            incrementar();

                            esperar(250, ()=>{

                                escribirLinea("   Sincronizando...", ()=>{

                                    incrementar();

                                    esperar(350, ()=>{

                                        mostrarResultado(modulo);

                                    });

                                });

                            });

                        });

                    });

                });

            });

        });

    }

    function mostrarResultado(modulo){

       let color = "";

if(modulo.estado==="OFFLINE") color="#ff4d4d";
if(modulo.estado==="FAIL") color="#ff4d4d";
if(modulo.estado==="WARN") color="#ffd84d";
if(modulo.estado==="ONLINE") color="#33ff66";

     let texto = "[" + modulo.estado + "] " + modulo.nombre;

if(modulo.detalle){

    texto += "  (" + modulo.detalle + ")";

}
recoveryBeep.currentTime = 0;
recoveryBeep.play().catch(()=>{});

        escribirLineaHTML(
            `<span style="color:${color};font-weight:bold">${texto}</span>`,
            ()=>{

                escribirLinea("", ()=>{

                    indice++;

                    incrementar();

                    esperar(500,avanzar);

                });

            }

        );

    }

    function finalizar(){

        escribirLinea("------------------------------------",()=>{

            escribirLineaHTML(
                `<span style="color:#43ff8a;font-weight:bold">[READY] Sistema preparado para iniciar la recuperación.</span>`,
                ()=>{

                    bar.style.width="100%";
                    percent.textContent="100%";

recoverySuccess.currentTime = 0;
recoverySuccess.play().catch(()=>{});

                    startRecovery.style.display="block";

                }

            );

        });

    }

    function incrementar(){

        progreso += 8;

        if(progreso>100) progreso=100;

        bar.style.width=progreso+"%";

        percent.textContent=progreso+"%";

    }

}
function escribirLinea(texto, callback){

    const log = document.getElementById("diagnostic-log");

    const linea = document.createElement("div");

    linea.className="log-line";

    log.appendChild(linea);

    let i=0;

    escribir();

    function escribir(){

        if(i<texto.length){

            linea.textContent+=texto.charAt(i);

            i++;

            log.scrollTop=log.scrollHeight;

            setTimeout(escribir,18);

        }else{

            if(callback) callback();

        }

    }

}
function escribirLineaHTML(html,callback){

    const log=document.getElementById("diagnostic-log");

    const linea=document.createElement("div");

    linea.className="log-line";

    linea.innerHTML=html;

    log.appendChild(linea);

    log.scrollTop=log.scrollHeight;

    setTimeout(()=>{

        if(callback) callback();

    },300);

}
function esperar(ms,callback){

    setTimeout(callback,ms);

}
drawECG();
const spoCanvas = document.getElementById("spoCanvas");

const spoCtx = spoCanvas.getContext("2d");

spoCanvas.width = 1200;
spoCanvas.height = 90;

let spoOffset = 0;

function drawSpo(){
    if(cyberAttack){
        requestAnimationFrame(drawSpo);
        return;
    }
    spoCtx.clearRect(0,0,spoCanvas.width,spoCanvas.height);

    spoCtx.strokeStyle="#3aa8ff";
    spoCtx.lineWidth=3;

    spoCtx.beginPath();

    for(let x=-spoOffset;x<spoCanvas.width+180;x+=180){

        spoCtx.moveTo(x,45);

        spoCtx.bezierCurveTo(
            x+15,45,
            x+25,15,
            x+40,15
        );

        spoCtx.bezierCurveTo(
            x+55,15,
            x+60,65,
            x+95,55
        );

        spoCtx.bezierCurveTo(
            x+120,50,
            x+145,45,
            x+180,45
        );

    }

    spoCtx.stroke();

    spoOffset += 2;

    if(spoOffset>=180){

        spoOffset=0;

    }

    requestAnimationFrame(drawSpo);

}

drawSpo();
const artCanvas = document.getElementById("artCanvas");

const artCtx = artCanvas.getContext("2d");

artCanvas.width = 1200;
artCanvas.height = 90;

let artOffset = 0;

function drawArt(){

    
    if(cyberAttack){
        requestAnimationFrame(drawArt);
        return;
    }

    artCtx.clearRect(0,0,artCanvas.width,artCanvas.height);

    artCtx.strokeStyle="#ff4040";
    artCtx.lineWidth=3;

    artCtx.beginPath();

    for(let x=-artOffset;x<artCanvas.width+200;x+=180){

        artCtx.moveTo(x,70);

        // Ascenso sistólico
        artCtx.lineTo(x+18,15);

        // Pico
        artCtx.lineTo(x+35,10);

        // Descenso inicial
        artCtx.lineTo(x+55,35);

        // Incisura dicrótica
        artCtx.lineTo(x+65,45);

        artCtx.lineTo(x+75,38);

        // Descenso diastólico
        artCtx.quadraticCurveTo(
            x+120,
            65,
            x+180,
            70
        );

    }

    artCtx.stroke();

    artOffset += 2;

    if(artOffset>=180){

        artOffset=0;

    }

    requestAnimationFrame(drawArt);

}

drawArt();
const respCanvas = document.getElementById("respCanvas");

const respCtx = respCanvas.getContext("2d");

respCanvas.width = 1200;
respCanvas.height = 90;

let respOffset = 0;

function drawResp(){
    
    if(cyberAttack){
        requestAnimationFrame(drawResp);
        return;
    }

    respCtx.clearRect(0,0,respCanvas.width,respCanvas.height);

    respCtx.strokeStyle = "#ffff00";
    respCtx.lineWidth = 3;

    respCtx.beginPath();

    for(let x=0;x<respCanvas.width;x++){

        const y = 45 + Math.sin((x + respOffset) * 0.025) * 15;

        if(x===0){

            respCtx.moveTo(x,y);

        }else{

            respCtx.lineTo(x,y);

        }

    }

    respCtx.stroke();

    respOffset += 1;

    requestAnimationFrame(drawResp);

}

drawResp();

continueDos.addEventListener("click", () => {

    clearInterval(cursorInterval);

    alarmSound.pause();
    alarmSound.currentTime = 0;

    dosScreen.style.display = "none";

    mostrarPantallaEmergencia();

});
/* ==========================================
   INICIAR RECUPERACIÓN
========================================== */
startRecovery.addEventListener("click", () => {

    mostrarAvisoInicio();

});
function mostrarAvisoInicio(){

    const panel = document.querySelector(".recovery-panel");

    panel.innerHTML = `

        <div class="startup-warning">

            <h2>⚠️ AVISO OPERATIVO</h2>

            <p>
                Se ha recuperado el acceso parcial al sistema.
            </p>

            <p>
                Dispone de <strong>45 minutos</strong> para restaurar
                completamente la unidad antes del fallo total
                del soporte vital.
            </p>

            <p>
                El tiempo comenzará en cuanto pulse
                <strong>ACEPTAR</strong>.
            </p>

            <button id="btnAceptarInicio">

                ACEPTAR

            </button>

        </div>

    `;

    document
        .getElementById("btnAceptarInicio")
        .addEventListener("click",()=>{

            startSound.currentTime = 0;
            startSound.play().catch(()=>{});

            iniciarTemporizador();

            mostrarCentroRecuperacion();

        });

}
function mostrarCentroRecuperacion(){
    actualizarEstadoPaciente();

    // Mostrar pantalla Recovery
homeScreen.style.display = "none";
monitorScreen.style.display = "none";
dosScreen.style.display = "none";
blackScreen.style.display = "none";

recoveryScreen.style.display = "block";
    const panel = document.querySelector(".recovery-panel");

    panel.innerHTML = `

        <div class="ucip-panel">

            <div class="ucip-header">

                <div class="ucip-title">
                    UCIP CORE
                </div>

                <div class="ucip-timer">
                    ⏱ <span class="timer-global"></span>
                </div>

            </div>

            <div class="ucip-paciente">

                <strong>Paciente:</strong> ${simulacion.paciente.nombre}
                &nbsp;&nbsp;&nbsp;
                <strong>Edad:</strong> ${simulacion.paciente.edad} años
                &nbsp;&nbsp;&nbsp;
                <strong>Peso:</strong> ${simulacion.paciente.peso} kg

                <br><br>

                <strong>Diagnóstico:</strong> ${simulacion.paciente.diagnostico}

                <span style="float:right;">
                    ${simulacion.paciente.box}
                </span>

            </div>
           <div class="patient-status">

    <div class="status-title">

        ESTADO DEL PACIENTE

    </div>

    <div class="status-bar">

        <div
            id="statusFill"
            class="status-fill ${simulacion.paciente.estado.clase}"
            style="width:${simulacion.paciente.estado.porcentaje}%">
        </div>

    </div>

    <div
        id="statusText"
        class="status-text">

        ${simulacion.paciente.estado.texto}

    </div>

</div>

           <div class="ucip-constantes">

    <h3>MONITORIZACIÓN DEL PACIENTE</h3>

    <div class="monitor-grid">

        <div class="vital-card ${
    simulacion.paciente.constantes.fc <= 120
        ? "verde"
        : simulacion.paciente.constantes.fc <= 150
            ? "amarillo"
            : "rojo"
}">
            <span class="vital-title">FC</span>
           <strong id="fcValue">${simulacion.paciente.constantes.fc}</strong>
            <small>lpm</small>
        </div>

        <div class="vital-card ${
    simulacion.paciente.constantes.spo2 >= 95
        ? "verde"
        : simulacion.paciente.constantes.spo2 >= 85
            ? "amarillo"
            : "rojo"
}">
            <span class="vital-title">SpO₂</span>
            <strong id="spo2Value">${simulacion.paciente.constantes.spo2}</strong>
            <small>%</small>
        </div>

       <div class="vital-card ${
    simulacion.paciente.constantes.taSis >= 90
        ? "verde"
        : simulacion.paciente.constantes.taSis >= 75
            ? "amarillo"
            : "rojo"
}">
    <span class="vital-title">TA</span>

    <strong id="taValue">${simulacion.paciente.constantes.taSis}/${simulacion.paciente.constantes.taDia}
    </strong>

    <small>mmHg</small>
</div>
    
        <div class="vital-card gris">
            <span class="vital-title">FR</span>
            <strong id="frValue">

${simulacion.paciente.constantes.fr ?? "--"}

</strong>
            <small>rpm</small>
        </div>

        <div class="vital-card gris">
            <span class="vital-title">EtCO₂</span>
            <strong id="etco2Value">

${simulacion.paciente.constantes.etco2 ?? "--"}

</strong>
            <small>mmHg</small>
        </div>

    </div>

</div>

          <div class="ucip-sistemas">

    <h3>PRIORIDAD DE RECUPERACIÓN</h3>

  ${
simulacion.sistemas.respirador.recuperado ?

`

<div class="alert-success">

✔ RESPIRADOR RESTAURADO

<br><br>

El paciente presenta mejoría clínica.

Se detecta una nueva intrusión en el módulo

<strong>BEDSIDE</strong>.

`

:

`

<div class="alert-warning">

Recupere el RESPIRADOR para estabilizar al paciente.

`

}

</div>

<div class="respirador-card ${
    simulacion.sistemas.respirador.recuperado
        ? "resp-ok"
        : simulacion.sistemas.respirador.estado==="DISPONIBLE"
            ? "resp-ready"
            : "resp-lock"
}">

    <div class="resp-header">

        🫁 RESPIRADOR

    </div>

    <div class="resp-status ${
        simulacion.sistemas.respirador.recuperado
            ? "status-ok"
            : simulacion.sistemas.respirador.estado==="DISPONIBLE"
                ? "status-ready"
                : "status-lock"
    }">

        <span class="${
            simulacion.sistemas.respirador.recuperado
                ? "pulse-dot green-dot"
                : simulacion.sistemas.respirador.estado==="DISPONIBLE"
                    ? "pulse-dot"
                    : "pulse-dot red-dot"
        }"></span>

        ${
            simulacion.sistemas.respirador.recuperado
                ? "OPERATIVO"
                : simulacion.sistemas.respirador.estado==="DISPONIBLE"
                    ? "DISPONIBLE"
                    : "BLOQUEADO"
        }

    </div>

    ${
        simulacion.sistemas.respirador.recuperado

        ?

        `

        <button class="btn-operativo" disabled>

            ✔ OPERATIVO

        </button>

        `

        :

        simulacion.sistemas.respirador.estado==="DISPONIBLE"

        ?

        `

        <button id="btnRespirador">

            ACCEDER AL RESPIRADOR

        </button>

        `

        :

        `

        <button class="btn-bloqueado" disabled>

            🔒 BLOQUEADO

        </button>

        `

    }

</div>

<div class="respirador-card ${
    simulacion.sistemas.bedside.recuperado
        ? "resp-ok"
        : simulacion.sistemas.bedside.estado==="DISPONIBLE"
            ? "resp-ready"
            : "resp-lock"
}">

    <div class="resp-header">

        💻 BEDSIDE

    </div>

   <div class="resp-status ${
    simulacion.sistemas.bedside.recuperado
        ? "status-ok"
        : simulacion.sistemas.bedside.estado==="DISPONIBLE"
            ? "status-ready"
            : "status-lock"
}">

        <span class="${
            simulacion.sistemas.bedside.recuperado
                ? "pulse-dot green-dot"
                : simulacion.sistemas.bedside.estado==="DISPONIBLE"
                    ? "pulse-dot"
                    : "pulse-dot red-dot"
        }"></span>

        ${
            simulacion.sistemas.bedside.recuperado
                ? "OPERATIVO"
                : simulacion.sistemas.bedside.estado==="DISPONIBLE"
                    ? "DISPONIBLE"
                    : "BLOQUEADO"
        }

    </div>

    ${
        simulacion.sistemas.bedside.recuperado

        ?

        `<button class="btn-operativo" disabled>

            ✔ OPERATIVO

        </button>`

        :

        simulacion.sistemas.bedside.estado==="DISPONIBLE"

        ?

        `<button id="btnBedside">

            ACCEDER AL BEDSIDE

        </button>`

        :

        `<button class="btn-bloqueado" disabled>

            🔒 BLOQUEADO

        </button>`

    }

</div>
<div class="respirador-card ${
    simulacion.sistemas.monitor.recuperado
        ? "resp-ok"
        : simulacion.sistemas.monitor.estado==="DISPONIBLE"
            ? "resp-ready"
            : "resp-lock"
}">

    <div class="resp-header">

        📈 MONITOR

    </div>

    <div class="resp-status ${
        simulacion.sistemas.monitor.recuperado
            ? "status-ok"
            : simulacion.sistemas.monitor.estado==="DISPONIBLE"
                ? "status-ready"
                : "status-lock"
    }">

        <span class="${
            simulacion.sistemas.monitor.recuperado
                ? "pulse-dot green-dot"
                : simulacion.sistemas.monitor.estado==="DISPONIBLE"
                    ? "pulse-dot"
                    : "pulse-dot red-dot"
        }"></span>

        ${
            simulacion.sistemas.monitor.recuperado
                ? "OPERATIVO"
                : simulacion.sistemas.monitor.estado==="DISPONIBLE"
                    ? "DISPONIBLE"
                    : "BLOQUEADO"
        }

    </div>

    ${
        simulacion.sistemas.monitor.recuperado

        ?

        `

        <button class="btn-operativo" disabled>

            ✔ OPERATIVO

        </button>

        `

        :

        simulacion.sistemas.monitor.estado==="DISPONIBLE"

        ?

        `

        <button id="btnMonitor">

            ACCEDER AL MONITOR

        </button>

        `

        :

        `

        <button class="btn-bloqueado" disabled>

            🔒 BLOQUEADO

        </button>

        `

    }

</div>

 <div class="respirador-card ${
    simulacion.sistemas.bombas.recuperado
        ? "resp-ok"
        : simulacion.sistemas.bombas.estado==="DISPONIBLE"
            ? "resp-ready"
            : "resp-lock"
}">

    <div class="resp-header">

        💉 BOMBAS DE INFUSIÓN

    </div>

    <div class="resp-status ${
        simulacion.sistemas.bombas.recuperado
            ? "status-ok"
            : simulacion.sistemas.bombas.estado==="DISPONIBLE"
                ? "status-ready"
                : "status-lock"
    }">

        <span class="${
            simulacion.sistemas.bombas.recuperado
                ? "pulse-dot green-dot"
                : simulacion.sistemas.bombas.estado==="DISPONIBLE"
                    ? "pulse-dot"
                    : "pulse-dot red-dot"
        }"></span>

        ${
            simulacion.sistemas.bombas.recuperado
                ? "OPERATIVO"
                : simulacion.sistemas.bombas.estado==="DISPONIBLE"
                    ? "DISPONIBLE"
                    : "BLOQUEADO"
        }

    </div>

    ${
        simulacion.sistemas.bombas.recuperado

        ?

        `

        <button class="btn-operativo" disabled>

            ✔ OPERATIVO

        </button>

        `

        :

        simulacion.sistemas.bombas.estado==="DISPONIBLE"

        ?

        `

        <button id="btnBombas">

            ACCEDER A BOMBAS

        </button>

        `

        :

        `

        <button class="btn-bloqueado" disabled>

            🔒 BLOQUEADO

        </button>

        `

    }

</div>


        </div>

    `;

    actualizarTemporizador();
   

    const btnResp=document.getElementById("btnRespirador");

if(btnResp){

    btnResp.addEventListener("click",()=>{

        mostrarPruebaRespirador();

    });

}

const btnBed=document.getElementById("btnBedside");

if(btnBed){

    btnBed.addEventListener("click",()=>{

        mostrarPruebaBedside();

    });

}
const btnMonitor = document.getElementById("btnMonitor");

if(btnMonitor){

    btnMonitor.addEventListener("click",()=>{

        mostrarPruebaMonitor();

    });

}
const btnBombas = document.getElementById("btnBombas");

if(btnBombas){

    btnBombas.addEventListener("click",()=>{

        mostrarPruebaBombas();

    });

}

}
function actualizarEstadoPaciente(){

    const recuperados = Object.values(simulacion.sistemas)
        .filter(s => s.recuperado).length;

    if(recuperados===0){

        simulacion.paciente.estado={
            texto:"🔴 CRÍTICO",
            clase:"critical",
            porcentaje:28
        };

    }

    else if(recuperados===1){

        simulacion.paciente.estado={
            texto:"🟠 INESTABLE",
            clase:"severe",
            porcentaje:50
        };

    }

    else if(recuperados===2){

        simulacion.paciente.estado={
            texto:"🟡 GRAVE",
            clase:"stable",
            porcentaje:70
        };

    }

    else if(recuperados===3){

        simulacion.paciente.estado={
            texto:"🟢 ESTABLE",
            clase:"safe",
            porcentaje:90
        };

    }

    else{


        simulacion.paciente.estado={
            texto:"💚 ESTABILIZADO",
            clase:"safe",
            porcentaje:100
        };

    }

    const barra=document.getElementById("statusFill");
    const texto=document.getElementById("statusText");
    const colores = {

    critical:"#ff3b30",
    severe:"#ff9800",
    stable:"#ffd54f",
    safe:"#00e676"

};

    if(barra){

        barra.className="status-fill "+simulacion.paciente.estado.clase;
        barra.style.width=simulacion.paciente.estado.porcentaje+"%";

    }

    if(texto){

        texto.textContent = simulacion.paciente.estado.texto;
texto.style.color = colores[simulacion.paciente.estado.clase];

    }

}
function moduloRecuperado(nombre){

    simulacion.sistemas[nombre].estado = "OPERATIVO";

    simulacion.sistemas[nombre].recuperado = true;

    actualizarJuego();

}
function actualizarJuego(){

    mostrarCentroRecuperacion();

}
function mejorarPacienteRespirador(){

    simulacion.paciente.constantes.fc = 145;
    simulacion.paciente.constantes.spo2 = 88;
    simulacion.paciente.constantes.taSis = 78;
    simulacion.paciente.constantes.taDia = 45;
    simulacion.paciente.constantes.fr = 24;
    simulacion.paciente.constantes.etco2 = 39;

}
function mejorarPacienteBedside(){

    simulacion.paciente.constantes.fc = 125;
    simulacion.paciente.constantes.spo2 = 94;
    simulacion.paciente.constantes.taSis = 90;
    simulacion.paciente.constantes.taDia = 55;
    simulacion.paciente.constantes.fr = 22;
    simulacion.paciente.constantes.etco2 = 38;

}
function mejorarPacienteMonitor(){

    simulacion.paciente.constantes.fc = 108;
    simulacion.paciente.constantes.spo2 = 97;
    simulacion.paciente.constantes.taSis = 98;
    simulacion.paciente.constantes.taDia = 60;
    simulacion.paciente.constantes.fr = 20;
    simulacion.paciente.constantes.etco2 = 37;

}
function mejorarPacienteBombas(){

    simulacion.paciente.constantes.fc = 92;
    simulacion.paciente.constantes.spo2 = 99;
    simulacion.paciente.constantes.taSis = 108;
    simulacion.paciente.constantes.taDia = 66;
    simulacion.paciente.constantes.fr = 18;
    simulacion.paciente.constantes.etco2 = 36;

}

/* ==========================================
   RESPIRADOR - PRUEBAS
========================================== */

const pruebasRespirador = [

    {
        alerta:"Intercepción de datos detectada.",
        mensaje:"Error en el bloque de inicio. La clave principal reside en el primer módulo del dispensador de flujo respiratorio.",
        pista:"Accede a la interfaz física del inyector de aerosol. La primera posición del registro te dará el primer carácter del protocolo de desbloqueo.",
        respuesta:"A"
    },

{
    alerta:"Primer carácter validado.",

    mensaje:"El acceso al primer bloque ha sido restaurado.\nAnalizando registros cifrados...\nSe ha localizado un nuevo fragmento del protocolo en el módulo de diagnóstico cardíaco avanzado.",

    pista:"Interferencia detectada en el módulo de acceso avanzado.\nLos protocolos de diagnóstico cardíaco avanzado han sido aislados del sistema principal.\n\nBusca el punto donde se inicia la exploración del corazón desde una perspectiva diferente.\nEl agente anestésico utilizado para abolir el reflejo faríngeo antes de introducir la sonda conserva el siguiente carácter del protocolo de desbloqueo.",

    respuesta:"R"
},

  {
    alerta:"Segundo carácter validado.",

    mensaje:"El bloque de diagnóstico cardíaco ha sido restaurado.\nReconstruyendo la secuencia de ventilación...\nSe ha detectado una anomalía en las conexiones del circuito respiratorio.",

    pista:"La secuencia de restauración requiere reconstruir las conexiones del circuito respiratorio.\n\nEn la reserva de aparataje encontrarás las plataformas de ventilación.\nNo necesitas encender ninguna.\nBusca el único enlace que permite al aerosol entrar en comunicación con el respirador.\nLa siguiente pieza de la clave espera allí.",

    respuesta:"I"
},

    {
    alerta:"Tercer carácter validado.",

    mensaje:"Las conexiones del circuito respiratorio han sido restauradas.\nReiniciando el subsistema de visualización...\nSe ha detectado un único terminal de control aún operativo.",

    pista:"El módulo de visualización permanece fuera de línea.\nLa interfaz óptica del sistema ha dejado de transmitir imágenes.\n\nCuando la vía aérea necesita ser observada desde el interior, todos los componentes convergen en una misma estación.\nLocaliza la plataforma que gobierna esa exploración.\nSobre ella permanece almacenado el siguiente fragmento del protocolo de desbloqueo.",

    respuesta:"M"
},

   {
    alerta:"Cuarto carácter validado.",

    mensaje:"El subsistema de visualización ha sido restaurado.\nIniciando recuperación del módulo HIGH FLOW...\nLa secuencia de desbloqueo ha sido fragmentada y distribuida entre los elementos de mantenimiento preventivo.",

    pista:"Cuando el sistema finaliza su trabajo, aún necesita un último guardián antes de devolver el aire al entorno.\nEse componente permanece separado del equipo hasta que es necesario.\nEn su compartimento se conserva el siguiente carácter del protocolo de desbloqueo.",

    respuesta:"P"
},

    {
    alerta:"Quinto carácter validado.",

    mensaje:"El módulo HIGH FLOW ha sido restaurado.\nSincronizando inventario respiratorio...\nSe ha detectado un conflicto en la ubicación del sistema de drenaje torácico.",

    pista:"El algoritmo no puede resolver una ubicación única para el módulo de drenaje.\nSe han detectado múltiples puntos de almacenamiento.\n\nLa presión debe liberarse antes de que el sistema colapse.\nBusca los dispositivos destinados a evacuar aquello que no debería permanecer dentro del tórax.\nSolo uno de los compartimentos conserva la siguiente pieza del protocolo de desbloqueo.",

    respuesta:"X"
},

   {
    alerta:"Sexto carácter validado.",

    mensaje:"El sistema de drenaje ha sido sincronizado.\nElevando nivel de emergencia...\nLos protocolos convencionales han dejado de ser suficientes.\nSe ha autorizado el acceso al procedimiento de rescate definitivo.",

    pista:"Cuando la vía aérea ya no puede recuperarse por los métodos habituales, solo queda una alternativa.\n\nDirígete al lugar donde se conserva ese recurso excepcional.\nEl siguiente fragmento del protocolo de desbloqueo permanece junto al equipo destinado a abrir un nuevo camino para el aire.",

    respuesta:"S"
},

    {
    alerta:"Séptimo carácter validado.",

    mensaje:"El procedimiento de rescate ha sido incorporado al sistema.\nInicializando el módulo de soporte metabólico...\nSe ha detectado una fragmentación del protocolo entre dos nodos logísticos.",

    pista:"Error NUTRI-04.\nEl módulo de soporte metabólico permanece operativo, pero el protocolo ha sido fragmentado entre dos nodos logísticos.\n\nNo toda la nutrición atraviesa el aparato digestivo.\nEn ocasiones, el suministro debe incorporarse directamente al sistema circulatorio.\nBusca el compartimento donde se conservan esas reservas.\nSolo una de las dos ubicaciones registradas guarda la contraseña completa del protocolo de desbloqueo.",

    respuesta:"CENSO"
},
{
    alerta:"Reconstrucción del protocolo completada.",

    mensaje:"Los caracteres recuperados han sido descifrados correctamente.\nEl sistema ha identificado el nombre del siguiente módulo comprometido.\nSe requiere una última validación para continuar con la restauración.",

    pista:"Reorganiza todos los caracteres obtenidos durante la búsqueda.\nCuando identifiques el equipo al que hacen referencia, localízalo físicamente en la unidad.\n\nLa siguiente fase requerirá introducir el identificador único asignado por el Servicio de Electromedicina.\nEse número permitirá autenticar el equipo y desbloquear el siguiente módulo del sistema.",

    respuesta:"10369186"
},

];

let pruebaActualResp = 0;


/* ==========================================
   MOSTRAR PRUEBA
========================================== */

function mostrarPruebaRespirador(){

    const prueba = pruebasRespirador[pruebaActualResp];

    const panel = document.querySelector(".recovery-panel");

panel.innerHTML = `

    <div class="matrix-screen">

        <div class="matrix-header">

            <div>RESPIRADOR · PROTOCOLO DE RECUPERACIÓN</div>

            <div>⏱ <span class="timer-global"></span></div>

        </div>

        <div class="matrix-text">

            <p>[SYSTEM_ALERT]: ${prueba.alerta}</p>

            <p>${prueba.mensaje}</p>

            <br>

            <p><strong>[PISTA]</strong></p>

            <p>${prueba.pista}</p>

        </div>

        <input
            id="respuestaResp"
            class="matrix-input"
            autocomplete="off">

        <br>

        <button
            class="matrix-btn"
            onclick="validarRespirador()">

            VALIDAR

        </button>

        <div id="mensajeError"></div>

    </div>

    `;

    actualizarTemporizador();

    document.getElementById("respuestaResp").focus();

}
/* ==========================================
   VALIDAR RESPUESTA
========================================== */
function validarRespirador(){

    const respuesta = document
        .getElementById("respuestaResp")
        .value
        .trim()
        .toUpperCase();

    const correcta = pruebasRespirador[pruebaActualResp]
        .respuesta
        .toUpperCase();

    const mensaje = document.getElementById("mensajeError");

    // RESPUESTA INCORRECTA
    if(respuesta !== correcta){
        simulacion.errores++;

        mensaje.innerHTML = "✖ ERROR: Carácter incorrecto.";

        mensaje.style.color = "#ff4040";
        errorSound.currentTime = 0;
errorSound.play().catch(()=>{});

        return;

    }

    // RESPUESTA CORRECTA

    mensaje.innerHTML = "✔ CARÁCTER VALIDADO";

    mensaje.style.color = "#00ff66";

    transicionPista(()=>{

        pruebaActualResp++;

        if(pruebaActualResp < pruebasRespirador.length){

            mostrarPruebaRespirador();

        }else{

            alert(`✔ IDENTIFICADOR VALIDADO

Sincronizando parámetros ventilatorios...
Restaurando algoritmo respiratorio...
Verificando ventilación mecánica...

MÓDULO RESPIRADOR RESTAURADO
ESTADO: OPERATIVO

---------------------------------------
NUEVA ALERTA DEL SISTEMA
---------------------------------------

Se ha detectado actividad maliciosa en el
módulo BEDSIDE.

Iniciando protocolo de recuperación...`);

simulacion.tiempos.respirador =
    (45*60) - simulacion.tiempoRestante;

            mejorarPacienteRespirador();

            simulacion.sistemas.bedside.estado = "DISPONIBLE";

            moduloRecuperado("respirador");

        }

    });

}
/* ==========================================
   BEDSIDE - PRUEBAS
========================================== */

const pruebasBedside = [

{
    alerta:"CONEXIÓN PERDIDA.",

    mensaje:"La unidad continúa operativa, pero la memoria central del sistema BEDSIDE ha quedado inaccesible.\n\nLos protocolos no han desaparecido...\nHan sido trasladados al último nivel de seguridad.\n\nPROTOCOLO DE CONTINGENCIA ACTIVADO.",

    pista:"Antes de que un procedimiento pediátrico comience, existe un lugar donde cada elemento debe estar ordenado, preparado y listo para su utilización.\n\nBusca en las carpetas de rescate el documento que describe cómo organizar la superficie de trabajo y disponer el material necesario antes de una intervención.\n\nUna vez localizado, utiliza la coordenada de recuperación:\n\n▣ 03\n━━━━ 11\n● 10\n\n⚠ ARCHIVE_INDEX.DAT\n\nEl archivo adjunto en la barra superior contiene la información necesaria para interpretar los símbolos de la coordenada.\n\nConsulta ARCHIVE_INDEX.DAT, identifica qué representa cada símbolo y aplica la equivalencia a los valores indicados.\n\nRecupera el carácter oculto.",

    respuesta:"A"
},
{
    alerta:"NODO DOCUMENTAL RESTAURADO.",

    mensaje:"La información recuperada pertenece al protocolo previo a la llegada del paciente.\n\nEl sistema ha identificado un nuevo bloque de configuración inicial pendiente de recuperación.",

    pista:"Antes de que un nuevo paciente ocupe una habitación, el sistema debe garantizar que todo esté preparado.\n\nAccede al documento que establece la configuración inicial del box.\n\nLocaliza el listado de recursos necesarios para la preparación estándar.\n\nEl segundo elemento de la lista guarda el siguiente carácter.\nExtrae únicamente su primera letra.",

    respuesta:"S"
},
{
    alerta:"MÓDULO DE SOPORTE AVANZADO IDENTIFICADO.",

    mensaje:"La información necesaria para continuar permanece almacenada en un protocolo reservado para situaciones críticas.\n\nEl sistema ha localizado un nuevo bloque de datos asistenciales pendiente de restauración.",

    pista:"Busca el documento relacionado con la asistencia extracorpórea.\n\nLa clave no está en el título del protocolo...\nEstá escondida dentro de sus páginas.\n\nUtiliza la coordenada de recuperación:\n\n▣ 36\n━━━━ 23\n● 1\n\nExtrae el carácter correspondiente y continúa la restauración.",

    respuesta:"E"
},
{
    alerta:"MÓDULO ORGANIZATIVO RESTAURADO.",

    mensaje:"La unidad conserva una guía donde se recoge la información necesaria para mantener su funcionamiento coordinado.\n\nEl sistema ha localizado un nuevo bloque de gestión interna pendiente de recuperación.",

    pista:"No busques un procedimiento clínico.\n\nBusca el documento que explica cómo funciona la propia unidad.\n\nUna vez localizado, utiliza la coordenada de recuperación:\n\n▣ 07\n━━━━ 01\n● 1\n\nExtrae el carácter correspondiente y continúa la restauración.",

    respuesta:"O"
},
{
    alerta:"SECUENCIA RECONSTRUIDA.",

    mensaje:"Los fragmentos recuperados han formado una nueva instrucción:\n\n>>> A S E O <<<\n\nEl sistema reconoce el procedimiento asociado, pero el acceso continúa bloqueado.\n\nSe requiere validación documental para continuar la restauración.",

    pista:"Cada procedimiento oficial posee una identidad única dentro del sistema de Calidad.\n\nLa palabra recuperada no es la clave...\nEs la puerta de entrada.\n\nLocaliza el procedimiento correspondiente y utiliza el código que le fue asignado para validar su existencia dentro del sistema documental.\n\nEse número permitirá desbloquear el acceso al BEDSIDE.",

    respuesta:"PCTO/UMIP/013"
},
];

let pruebaActualBed = 0;


/* ==========================================
   MOSTRAR PRUEBA
========================================== */

function mostrarPruebaBedside(){

    const prueba = pruebasBedside[pruebaActualBed];

    const panel = document.querySelector(".recovery-panel");

    panel.innerHTML = `

    <div class="bedside-screen">

    <div class="bedside-header">

    <div>

        💻 BEDSIDE · TERMINAL CLÍNICA

    </div>

    <div style="display:flex;align-items:center;gap:12px;">

        <button
            id="abrirArchivo"
            class="archivo-btn">

            📁 ARCHIVE_INDEX.DAT

        </button>

        ⏱ <span class="timer-global"></span>

    </div>

</div>

        <div class="bedside-body">

            <div class="bedside-box">

                <h3>[SYSTEM_ALERT]</h3>

                <p>${prueba.alerta}</p>

                <p>${prueba.mensaje}</p>

            </div>

            <div class="bedside-box">

                <h3>[RECOVERY_HINT]</h3>

                <p>${prueba.pista}</p>

            </div>

            <div class="bedside-row">

                <div class="bedside-box">

                    <h3>[VALIDATION_KEY]</h3>

                    <div class="bedside-code">

                        ${prueba.formula || "IDENTIFICADOR"}

                    </div>

                </div>

                <div class="bedside-box">

                    <h3>[AUTH]</h3>

                    <input
                        id="respuestaBed"
                        class="bedside-input"
                        autocomplete="off">

                    <button
                        class="bedside-btn"
                        onclick="validarBedside()">

                        VALIDAR

                    </button>

                    <div id="mensajeError"></div>

                </div>

            </div>

        </div>

    </div>

    `;

    actualizarTemporizador();

    document.getElementById("respuestaBed").focus();

const archivo = document.getElementById("archivo-bedside");

document
    .getElementById("abrirArchivo")
    .addEventListener("click",()=>{

        archivo.style.display="flex";

    });

document
    .getElementById("cerrarArchivo")
    .addEventListener("click",()=>{

        archivo.style.display="none";

    });
}
function validarBedside(){

    const respuesta = document
        .getElementById("respuestaBed")
        .value
        .trim()
        .toUpperCase();

    const correcta = pruebasBedside[pruebaActualBed]
        .respuesta
        .toUpperCase();

    const mensaje = document.getElementById("mensajeError");

    // RESPUESTA INCORRECTA
    if(respuesta !== correcta){

        simulacion.errores++;

        mensaje.innerHTML = "✖ ERROR: Carácter incorrecto.";

        mensaje.style.color = "#ff4040";
        errorSound.currentTime = 0;
errorSound.play().catch(()=>{});

        return;

    }

    // RESPUESTA CORRECTA

    mensaje.innerHTML = "✔ VALIDACIÓN CORRECTA";

    mensaje.style.color = "#00ff66";

    transicionPista(()=>{

        pruebaActualBed++;

        if(pruebaActualBed < pruebasBedside.length){

            mostrarPruebaBedside();

        }else{

            alert(`✔ IDENTIFICADOR VALIDADO

Sincronizando base de datos...
Reconstruyendo historia clínica...
Verificando registros...

MÓDULO BEDSIDE RESTAURADO
ESTADO: OPERATIVO

---------------------------------------
NUEVA ALERTA DEL SISTEMA
---------------------------------------

Se ha detectado actividad maliciosa en el
módulo MONITOR.

Iniciando protocolo de recuperación...`);

simulacion.tiempos.bedside =
    (45*60) - simulacion.tiempoRestante;

            mejorarPacienteBedside();

            simulacion.sistemas.monitor.estado = "DISPONIBLE";

            moduloRecuperado("bedside");

        }

    });

}
/* ==========================================
   MONITOR - PRUEBAS
========================================== */

const pruebasMonitor = [

   {
    alerta:"Inicializando ACCESS-SAFE...",

    mensaje:"Parámetros críticos perdidos.\n\nEl algoritmo de prevención de infección vascular no puede ejecutarse hasta recuperar las tres constantes necesarias para su calibración.\n\nLa información permanece distribuida entre los protocolos del sistema.",

    pista:"Recupera los siguientes parámetros del protocolo:\n\nα → Concentración del antiséptico utilizada antes de la inserción.\n\nβ → Tiempo máximo de permanencia del apósito transparente.\n\nγ → Tiempo de fricción tras la desinfección de un conector sin aguja.",

    formula:"ACCESS_KEY = ( α × β ) + γ",

    respuesta:"34"
},
{
    alerta:"MÓDULO DE PREVENCIÓN RESPIRATORIA INCOMPLETO.",

    mensaje:"El sistema ha perdido tres constantes esenciales del protocolo de prevención de infecciones respiratorias.\n\nLa integridad del algoritmo no puede verificarse hasta reconstruir los parámetros originales.\n\nSolo se conserva la función que desempeñaba cada uno de ellos.",

    pista:"Recupera los siguientes parámetros del protocolo:\n\nα → Valor que mantiene aislada la vía aérea inferior.\n\nβ → Parámetro que determina cuándo un circuito deja de ser considerado seguro.\n\nγ → Concentración del agente utilizado para preservar la cavidad oral durante ventilaciones prolongadas.\n\n⚠ RESTRICCIÓN DEL SISTEMA\n\nEl motor de recuperación no reconoce el separador decimal utilizado habitualmente en los registros clínicos.\n\nPara validar el resultado, utiliza exclusivamente el punto (.) como separador decimal.\n\nLa coma (,) será considerada un carácter no válido.",

    formula:"VAP-SAFE = ( α + β ) × γ",

    respuesta:"3.24"
},
{
    alerta:"ERROR PEDIATRIC PROFILE.",

    mensaje:"Paciente identificado:\n\nEdad: 2 años.\n\nEl sistema debe seleccionar automáticamente la escala de valoración del dolor adecuada.\n\nLa base de datos pediátrica ha quedado incompleta y el algoritmo no puede determinar qué herramienta utilizar.",

    pista:"Accede al protocolo de valoración del dolor pediátrico.\n\nLocaliza la única escala compatible con la edad del paciente.\n\nRecupera el número máximo de años indicado para su utilización.",

    formula:"PAIN_PROFILE = Edad máxima de utilización",

    respuesta:"3"
},
{
    alerta:"ERROR NEURO-ASSESSMENT.",

    mensaje:"El módulo de interpretación clínica ha dejado de reconocer la edad del paciente.\n\nLas escalas de valoración neurológica permanecen registradas, pero el sistema ya no puede determinar en qué momento debe utilizar cada una.\n\nEs necesario reconstruir los parámetros de decisión para restaurar el algoritmo.",

    pista:"Recupera los siguientes parámetros del protocolo:\n\nα → Edad máxima para la utilización de la escala FLACC.\n\nβ → Edad mínima para iniciar la valoración mediante la escala Wong-Baker.\n\nγ → Puntuación compatible con síndrome de abstinencia según la escala SOPHIA.",

    formula:"NEURO_KEY = α + β + γ",

    respuesta:"10"
},
{
    alerta:"ERROR NUTRITION-FLOW.",

    mensaje:"El algoritmo de alimentación enteral ha perdido el protocolo de mantenimiento del circuito.\n\nEl sistema desconoce el intervalo máximo de utilización del equipo de administración.\n\nHasta recuperar este parámetro, no puede garantizar la seguridad del soporte nutricional.",

    pista:"La seguridad no depende únicamente de la nutrición...\nTambién del tiempo que un mismo circuito permanece en funcionamiento.\n\nAccede al protocolo de nutrición enteral.\n\nRecupera el intervalo máximo permitido antes de sustituir el sistema de administración.\n\nEse valor permitirá recalibrar el módulo.",

    formula:"NUTRI_KEY = Tiempo máximo del circuito",

    respuesta:"24"
},
{
    alerta:"RECONSTRUCCIÓN DEL PACIENTE EN CURSO...",

    mensaje:"Los módulos restaurados contienen la información necesaria para reconstruir el perfil clínico del paciente.\n\nACCESS.....ONLINE\nVAP........ONLINE\nPAIN.......ONLINE\nNEURO......ONLINE\nNUTRI......ONLINE\n\nTodos los algoritmos han sido restaurados.\nSin embargo, un parámetro esencial continúa sin poder validarse.",

    pista:"Solo uno de los módulos recuperados clasifica la información en función de la edad del paciente.\n\nUtilízalo para determinar la variable AGE.\n\nUna vez obtenida, ejecuta el algoritmo habitual de selección del tubo endotraqueal pediátrico.\n\nRecuerda: el sistema únicamente acepta calibres comerciales estandarizados.\n\n⚠ RESTRICCIÓN DEL SISTEMA\n\nEl motor de recuperación utiliza el formato numérico internacional para los valores decimales.\n\nPara validar el calibre del tubo, utiliza exclusivamente el punto (.) como separador decimal.\n\nLa coma (,) será considerada un carácter no válido.",

    formula:"ØTET = ( AGE + 16 ) / 4",

    respuesta:"4.5"
},
];

let pruebaActualMonitor = 0;


/* ==========================================
   MOSTRAR PRUEBA
========================================== */

function mostrarPruebaMonitor(){

    const prueba = pruebasMonitor[pruebaActualMonitor];

    const panel = document.querySelector(".recovery-panel");

    panel.innerHTML = `

    <div class="monitor-window">

        <div class="monitor-header">

            <div>

                📈 MONITOR · DIAGNÓSTICO DEL SISTEMA

            </div>

            <div>

                ⏱ <span class="timer-global"></span>

            </div>

        </div>

        <div class="monitor-recovery-body">

            <div class="monitor-box">

                <h3>⚠ ALERTA DEL SISTEMA</h3>

                <p>${prueba.alerta}</p>

                <p>${prueba.mensaje}</p>

            </div>

            <div class="monitor-box">

                <h3>📄 PISTA DE RECUPERACIÓN</h3>

                <p>${prueba.pista}</p>

            </div>

<div class="monitor-row">
            <div class="monitor-box monitor-formula">

    <h3>🧮 VALIDACIÓN CLAVE</h3>

    <div class="formula-box">

        <strong>CLAVE</strong>

        <br><br>

        ${prueba.formula || ""}

    </div>

</div>

<div class="monitor-box monitor-validacion">

    <h3>🔑 VALIDACIÓN</h3>

    <div class="validacion-panel">

        <label><strong>CLAVE:</strong></label>

        <input
            id="respuestaMonitor"
            class="monitor-input"
            autocomplete="off">

        <button
            class="monitor-btn"
            onclick="validarMonitor()">

            VALIDAR

        </button>

    </div>

    </div>

    <div id="mensajeError"></div>

</div>

        </div>

    </div>

    `;

    actualizarTemporizador();

    document.getElementById("respuestaMonitor").focus();

}


/* ==========================================
   VALIDAR RESPUESTA
========================================== */

function validarMonitor(){

    const respuesta = document
        .getElementById("respuestaMonitor")
        .value
        .trim()
        .toUpperCase();

    const correcta = pruebasMonitor[pruebaActualMonitor]
        .respuesta
        .toUpperCase();

    const mensaje = document.getElementById("mensajeError");

    // RESPUESTA INCORRECTA
    if(respuesta !== correcta){

        simulacion.errores++;

        mensaje.innerHTML = "✖ ERROR: Respuesta incorrecta.";

        mensaje.style.color = "#d62828";
        errorSound.currentTime = 0;
errorSound.play().catch(()=>{});

        return;

    }

    // RESPUESTA CORRECTA

    new Audio("beep.mp3").play();

  mensaje.innerHTML = "✔ VALIDACIÓN CORRECTA";

mensaje.style.color = "#2e7d32";

transicionPista(()=>{

    pruebaActualMonitor++;

    if(pruebaActualMonitor < pruebasMonitor.length){

        mostrarPruebaMonitor();

    }else{

        alert(`✔ IDENTIFICADOR VALIDADO

Sincronizando monitorización...
Restaurando algoritmos clínicos...
Verificando constantes vitales...

MÓDULO MONITOR RESTAURADO
ESTADO: OPERATIVO

---------------------------------------
NUEVA ALERTA DEL SISTEMA
---------------------------------------

Se ha detectado actividad maliciosa en el
módulo BOMBAS DE INFUSIÓN.

Iniciando protocolo de recuperación...`);

simulacion.tiempos.monitor =
    (45*60) - simulacion.tiempoRestante;

        // Mejora del paciente
        mejorarPacienteMonitor();

        // Desbloquea el siguiente módulo
        simulacion.sistemas.bombas.estado = "DISPONIBLE";

        // Recupera el monitor
        moduloRecuperado("monitor");

    }

},);

}  

/* ==========================================
   BOMBAS DE INFUSIÓN
========================================== */

const pruebasBombas = [
{
    alerta:"ERROR DRUG LIBRARY.",

    mensaje:"La biblioteca farmacológica ha sufrido daños durante el incidente.\n\nSolo ha podido recuperarse un único perfil de perfusión.\n\nEl nombre del fármaco ha desaparecido, pero el resto de parámetros permanecen almacenados.\n\nLa identificación correcta permitirá reconstruir la primera entrada de la biblioteca.",

    pista:"REGISTRO RECUPERADO\n\n────────────────────────\nCompatibilidad: SF 0,9% / SG 5%\nProtección: Proteger de la luz\nUnidad de administración: mcg/kg/h\nConcentración: 200 mcg / 50 mL o DOBLE: 400mcg / 50 mL\nPaciente de referencia: 6 kg\n────────────────────────\n\nIdentifica el fármaco correspondiente e introdúcelo para restaurar el perfil farmacológico.",

    formula:"DRUG PROFILE = ?",

    respuesta:"DEXMEDETOMIDINA"
},
{
    alerta:"PUMP-CALC ENGINE OFFLINE.",

    mensaje:"El motor interno de cálculo ha dejado de responder.\n\nLa programación automática de la perfusión ha sido deshabilitada por seguridad.\n\nLa estación B. Braun exige una validación manual antes de restaurar el algoritmo de administración.",

    pista:"━━━━━━━━━━━━━━━━━━━━\n\nPACIENTE DETECTADO\n\nPeso.............. 8,4 kg\nFármaco........... Labetalol\nPreparación....... Biblioteca UMIP Estándar\nDosis............. 1,6 mg/kg/h\n\n━━━━━━━━━━━━━━━━━━━━\n\nAccede a la tabla de administración segura de fármacos de las bombas.\n\nReconstruye la preparación estándar de Labetalol y calcula el flujo de infusión correspondiente.\n\nIntroduce únicamente el valor final en mL/h.\n\n⚠ RESTRICCIÓN DEL SISTEMA\n\nEl motor de recuperación utiliza el formato numérico internacional para los valores decimales.\n\nPara validar el flujo de infusión, utiliza exclusivamente el punto (.) como separador decimal.\n\nLa coma (,) será considerada un carácter no válido.",

    formula:"FLOW RATE = ? mL/h",

    respuesta:"6.72"
},
{
    alerta:"ERROR DRUG-LIBRARY.",

    mensaje:"La biblioteca farmacológica ha sido restaurada parcialmente.\n\nLas preparaciones vuelven a estar disponibles, pero los límites de seguridad asociados a cada fármaco permanecen dañados.\n\nLa estación de infusión ha activado el MODO SEGURO y bloqueará cualquier administración hasta verificar los parámetros del perfil.",

    pista:"━━━━━━━━━━━━━━━━━━━━\n\nPERFIL DEL PACIENTE\n\nPeso.............. 13,1 kg\nFármaco........... Tiopental\nPreparación....... Biblioteca UMIP\n\n━━━━━━━━━━━━━━━━━━━━\n\nAccede a la biblioteca farmacológica de la bomba.\n\nLocaliza el perfil correspondiente a Tiopental y recupera el valor máximo que la bomba considera dentro del rango normal de administración (mg/kg/h).\n\nIntroduce únicamente el valor numérico para restaurar el perfil de seguridad.",

    formula:"MAX RATE = ? mg/kg/h",

    respuesta:"5"
},
{
    alerta:"INFUSION ENGINE ONLINE.",

    mensaje:"El motor de infusión ha conseguido restaurarse parcialmente.\n\nSin embargo, el algoritmo de dosificación continúa dañado.\n\nComo medida de seguridad, la estación B. Braun ha reducido automáticamente la perfusión al valor mínimo programable.\n\nLa administración permanecerá bloqueada hasta verificar que dicho límite es compatible con el perfil farmacológico.",

    pista:"━━━━━━━━━━━━━━━━━━━━\n\nPERFIL DEL PACIENTE\n\nPeso.............. 2,1 kg\nFármaco........... Cisatracurio\nPerfil............ Biblioteca UMIP\nVelocidad......... Límite inferior permitido por el software\n\n━━━━━━━━━━━━━━━━━━━━\n\nAccede a la biblioteca farmacológica de las bombas.\n\nRecupera la preparación estándar de Cisatracurio.\n\nA continuación, determina qué dosis (mcg/kg/min) corresponde a la velocidad mínima aceptada por la bomba.\n\nIntroduce únicamente el valor numérico final para restaurar el algoritmo de dosificación.\n\n⚠ RESTRICCIÓN DEL SISTEMA\n\nEl motor de recuperación utiliza el formato numérico internacional para los valores decimales.\n\nPara validar la dosis, utiliza exclusivamente el punto (.) como separador decimal.\n\nLa coma (,) será considerada un carácter no válido.",

    formula:"MIN RATE = ? mcg/kg/min",

    respuesta:"0.159"
},
{
    alerta:"OCCLUSION PROTECTION OFFLINE.",

    mensaje:"El sistema ha perdido la calibración del módulo de protección frente a oclusiones.\n\nLas perfusiones continúan activas, pero el algoritmo de seguridad ya no puede determinar el umbral a partir del cual debe generar una alarma.\n\nHasta restaurar este parámetro, la estación permanecerá en modo de protección.",

    pista:"━━━━━━━━━━━━━━━━━━━━\n\nPARÁMETRO REQUERIDO\n\nTipo............... Presión distal\nPerfil............. Nivel 4\nUnidad............. mmHg\n\n━━━━━━━━━━━━━━━━━━━━\n\nAccede a la configuración avanzada de la bomba de infusión.\n\nRecupera el valor de presión correspondiente al nivel de alarma 4.\n\nIntroduce únicamente el valor numérico en mmHg para restaurar el módulo OCCLUSION PROTECTION.",

    formula:"PRESSURE LIMIT = ? mmHg",

    respuesta:"384"
}
];

let pruebaActualBombas = 0;


/* ==========================================
   MOSTRAR PANTALLA B. BRAUN
========================================== */

function mostrarPruebaBombas(){

    const prueba = pruebasBombas[pruebaActualBombas];

    const panel = document.querySelector(".recovery-panel");

    panel.innerHTML = `

<div class="braun-window">

    <div class="braun-header">

        <div>

            💉 B. BRAUN SPACE

        </div>

        <div>

            🔋100%

            &nbsp;&nbsp;

            ⏱ <span class="timer-global"></span>

        </div>

    </div>

    <div class="braun-body">

        <div class="braun-display">

            <h3>${prueba.alerta}</h3>

            <br>

            <p>${prueba.mensaje}</p>

            <br><br>

            <strong>REGISTRO RECUPERADO</strong>

            <br><br>

            <p>${prueba.pista}</p>

        </div>

        <div class="braun-formula">

            ${prueba.formula}

        </div>

        <div class="braun-validacion">

            <input
                id="respuestaBomba"
                class="braun-input"
                autocomplete="off">

            <button
                class="braun-btn"
                onclick="validarBombas()">

                VALIDAR

            </button>

        </div>

        <div id="mensajeError"></div>

        <div class="braun-keyboard">

            <div class="braun-key">MENU</div>

            <div class="braun-key">▲</div>

            <div class="braun-key">▼</div>

            <div class="braun-key">OK</div>

            <div class="braun-key">START</div>

            <div class="braun-key">STOP</div>

        </div>

    </div>

</div>

`;

   actualizarTemporizador();

// Volver siempre al inicio
window.scrollTo({
    top: 0,
    behavior: "instant"
});

document.getElementById("respuestaBomba").focus();

}
/* ==========================================
   VALIDAR RESPUESTA
========================================== */

function validarBombas(){

    const respuesta = document
        .getElementById("respuestaBomba")
        .value
        .trim()
        .toUpperCase();

    const correcta = pruebasBombas[pruebaActualBombas]
        .respuesta
        .toUpperCase();

    const mensaje = document.getElementById("mensajeError");

    // RESPUESTA INCORRECTA
    if(respuesta !== correcta){

        simulacion.errores++;

        mensaje.innerHTML = "✖ ERROR: Respuesta incorrecta.";

        mensaje.style.color = "#d62828";
        errorSound.currentTime = 0;
errorSound.play().catch(()=>{});

        return;

    }

    // RESPUESTA CORRECTA

    mensaje.innerHTML = "✔ PERFIL FARMACOLÓGICO RESTAURADO";

mensaje.style.color = "#2e7d32";

transicionPista(()=>{

        pruebaActualBombas++;

        if(pruebaActualBombas < pruebasBombas.length){

            mostrarPruebaBombas();

        }else{
            // Detener cronómetro y guardar tiempo
finalizarSimulacion();

simulacion.tiempos.bombas =
    simulacion.tiempoEmpleado;

mejorarPacienteBombas();

moduloRecuperado("bombas");

// La pantalla Recovery ya se ha actualizado.
// Mantenerla visible 10 segundos antes
// de iniciar Restoration Engine.

setTimeout(()=>{

    mostrarRestorationEngine();

},10000);

}

    });

}
/* ==========================================
   RESTORATION ENGINE
========================================== */
function mostrarRestorationEngine(){

    restoreModal.style.display = "flex";
    restoreButtons.style.display = "none";

    restoreConsole.innerHTML = "";
    restoreConsole.scrollTop = 0;

    function bajarScroll(){

    requestAnimationFrame(()=>{

        restoreConsole.scrollTop = restoreConsole.scrollHeight;

    });

}

    restoreConsole.textContent =
`================================================

             UCIP CORE

       RESTORATION ENGINE v3.0

================================================

Initializing recovery process...

Checking restored modules...

`;

    bajarScroll();

    const verificaciones = [

        "RESPIRATOR",
        "BEDSIDE TERMINAL",
        "PATIENT MONITOR",
        "INFUSION SYSTEM",
        "CENTRAL SERVER",
        "CLINICAL DATABASE",
        "MEDICATION LIBRARY",
        "CYBERSECURITY"

    ];

    let indice = 0;

    verificarServicio();

    function verificarServicio(){

        if(indice >= verificaciones.length){

            finalizarRestore();

            return;

        }

        const nombre = verificaciones[indice];

        restoreConsole.innerHTML +=
`<span style="color:#d0d0d0">${nombre}</span>`;

        bajarScroll();

        let puntos = 0;

        // Cada línea tarda un tiempo diferente
        const maxPuntos = 12 + Math.floor(Math.random()*12);

        const intervalo = setInterval(()=>{

            restoreConsole.innerHTML +=
`<span style="color:#555;">.</span>`;

            bajarScroll();

            puntos++;

            if(puntos >= maxPuntos){

                clearInterval(intervalo);

                setTimeout(()=>{

                    restoreConsole.innerHTML +=
` <span style="color:#00ff66;font-weight:bold;">ONLINE ✔</span>\n`;

                    bajarScroll();

                    recoveryBeep.currentTime = 0;
                    recoveryBeep.play().catch(()=>{});

                    indice++;

                    setTimeout(verificarServicio,350);

                },250);

            }

        },40);

    }

}
/* ==========================================
   FINALIZAR RESTORATION
========================================== */
function finalizarRestore(){

    restoreConsole.innerHTML += `

<br><br>
================================================

<span style="color:#00ff66;font-weight:bold;">
MISSION SUCCESSFULLY COMPLETED
</span>

Saving operation log...
Generating encrypted mission report...
Compressing recovery data...
Validating system integrity...
Mission report generated successfully.

`;

    restoreConsole.scrollTo({
        top: restoreConsole.scrollHeight,
        behavior: "smooth"
    });

    // Mostrar inmediatamente el botón del informe
    restoreButtons.style.display = "block";

    restoreConsole.scrollTo({
        top: restoreConsole.scrollHeight,
        behavior: "smooth"
    });

}

/* ==========================================
   FORMATEAR TIEMPO
========================================== */

function formatearTiempo(segundos){

    const min = Math.floor(segundos / 60);

    const seg = segundos % 60;

    return `${String(min).padStart(2,"0")}:${String(seg).padStart(2,"0")}`;

}
/* ==========================================
   TIEMPOS POR MÓDULO
========================================== */

function obtenerTiemposModulos(){

    return{

        respirador:
            simulacion.tiempos.respirador,

        bedside:
            simulacion.tiempos.bedside -
            simulacion.tiempos.respirador,

        monitor:
            simulacion.tiempos.monitor -
            simulacion.tiempos.bedside,

        bombas:
            simulacion.tiempos.bombas -
            simulacion.tiempos.monitor

    };

}

/* ==========================================
   CLASIFICACIÓN DE LA MISIÓN
========================================== */

function obtenerClasificacion(){

    // Si no se han recuperado todos los módulos
    if(
        !simulacion.sistemas.respirador.recuperado ||
        !simulacion.sistemas.bedside.recuperado ||
        !simulacion.sistemas.monitor.recuperado ||
        !simulacion.sistemas.bombas.recuperado
    ){

        return{

            texto:"MISIÓN NO COMPLETADA",

            color:"#d62828"

        };

    }

    const minutos = simulacion.tiempoEmpleado / 60;

    if(minutos < 15){

        return{

            texto:"LEGENDARIO",

            color:"#9c27b0"

        };

    }

    if(minutos < 20){

        return{

            texto:"EXCELENTE",

            color:"#2e7d32"

        };

    }

    if(minutos < 30){

        return{

            texto:"AVANZADO",

            color:"#1565c0"

        };

    }

    if(minutos < 40){

        return{

            texto:"OPERATIVO",

            color:"#f9a825"

        };

    }

    return{

        texto:"SUPERVIVIENTE",

        color:"#ef6c00"

    };

}
/*==================================================
        GENERAR INFORME PDF
==================================================*/

function generarInformePDF(){

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation:"portrait",
        unit:"mm",
        format:"a4"
    });

    //--------------------------------------
    // CONFIGURACIÓN GENERAL
    //--------------------------------------

    const PAGE = {

        x:15,
        y:15,
        w:180,
        h:267

    };

    let cursorY = PAGE.y;

    //--------------------------------------
    // COLORES
    //--------------------------------------

    const COLOR = {

        azul:[0,90,156],
        gris:[230,233,236],
        negro:[35,35,35],
        verde:[39,174,96],
        rojo:[198,40,40],
        naranja:[245,158,11],
        azulClaro:[59,130,246],
        morado:[124,58,237]

    };

    //--------------------------------------
    // FUNCIONES DE DIBUJO
    //--------------------------------------

    function titulo(texto){

        pdf.setFont("helvetica","bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...COLOR.negro);

        pdf.text(texto,PAGE.x+4,cursorY+6);

    }

    function caja(tituloCaja,alto){

        pdf.setDrawColor(180);

        pdf.roundedRect(
            PAGE.x,
            cursorY,
            PAGE.w,
            alto,
            2,
            2
        );

        // Cabecera azul
pdf.setFillColor(...COLOR.azul);

pdf.roundedRect(
    PAGE.x,
    cursorY,
    PAGE.w,
    8,
    2,
    2,
    "F"
);

// Evita que la parte inferior quede redondeada
pdf.rect(
    PAGE.x,
    cursorY + 6,
    PAGE.w,
    2,
    "F"
);

// Texto blanco
pdf.setFont("helvetica","bold");
pdf.setFontSize(11);
pdf.setTextColor(255);

pdf.text(
    tituloCaja,
    PAGE.x + 4,
    cursorY + 5.5
);

// Restaurar color del texto para el contenido
pdf.setTextColor(...COLOR.negro);

cursorY += 14;


    }

    function siguiente(alto){

        cursorY+=alto;

    }
    function lineaDato(etiqueta, valor, y){

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.negro);

    // Etiqueta
    pdf.text(etiqueta,24,y);

    // Valor alineado a la derecha
    pdf.text(
        String(valor),
        180,
        y,
        {align:"right"}
    );

    // Línea de puntos
    pdf.setDrawColor(170);

    pdf.setLineDashPattern([0.8,1.2],0);

    pdf.line(65,y-1,168,y-1);

    pdf.setLineDashPattern([],0);

}

    //--------------------------------------
    // CABECERA
    //--------------------------------------

    pdf.setFillColor(...COLOR.azul);

    pdf.rect(
        PAGE.x,
        cursorY,
        PAGE.w,
        18,
        "F"
    );
    // ============================
// LOGO UCIP CORE
// ============================

const logo = new Image();

logo.src = "img/logo_ucip_core.png";

    pdf.setTextColor(255);

    pdf.setFont("helvetica","bold");

    pdf.setFontSize(10);
    pdf.setDrawColor(255);
pdf.setLineWidth(0.3);

pdf.line(
    PAGE.x+126,
    cursorY+14,
    PAGE.x+176,
    cursorY+14
);
if (logo.complete) {

    pdf.addImage(
        logo,
        "PNG",
        14,
        11,
        18,
        18
    );

}
  pdf.setFontSize(20);

pdf.text(
    "UCIP CORE",
    PAGE.x+36,
    cursorY+9
);
pdf.setFontSize(8);

pdf.setFont("helvetica","normal");

pdf.text(
    "RECOVERY ENGINE",
    PAGE.x+36,
    cursorY+15
);

    pdf.setFontSize(11);

    pdf.text(
        "MISSION REPORT",
        PAGE.x+138,
        cursorY+12
    );

    cursorY+=26;

    //--------------------------------------
    // TITULO
    //--------------------------------------

    pdf.setTextColor(...COLOR.negro);

    pdf.setFontSize(18);

    pdf.text(
        "INFORME DE MISIÓN",
        105,
        cursorY,
        {align:"center"}
    );

    cursorY+=7;

    pdf.setFontSize(11);

    pdf.setTextColor(90);

    pdf.text(
        "Recovery Engine v3.0",
        105,
        cursorY,
        {align:"center"}
    );

    cursorY+=10;

//--------------------------------------
// ESPACIO ENTRE TÍTULO Y DATOS
//--------------------------------------

const clasificacion = obtenerClasificacion();

cursorY += 8;
    /*==================================================
            DATOS GENERALES
    ==================================================*/

    caja("DATOS GENERALES",28);

    const hoy=new Date();

    const fecha=
        String(hoy.getDate()).padStart(2,"0")+"/"+
        String(hoy.getMonth()+1).padStart(2,"0")+"/"+
        hoy.getFullYear();

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...COLOR.negro);

    lineaDato(
    "Fecha",
    fecha,
    cursorY
);

lineaDato(
    "Tiempo total",
    formatearTiempo(simulacion.tiempoEmpleado),
    cursorY+8
);
    siguiente(30);


    /*==================================================
            PARTICIPANTES
    ==================================================*/

    const altoParticipantes =
        20 + (simulacion.participantes.length*7);

    caja("PARTICIPANTES",altoParticipantes);

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.negro);

    let yLista=cursorY;

    simulacion.participantes.forEach(nombre=>{

        pdf.text(
            "• "+nombre,
            24,
            yLista
        );

        yLista+=7;

    });

    siguiente(
        simulacion.participantes.length*7+16
    );


    /*==================================================
            TIEMPO POR MÓDULOS
    ==================================================*/

    caja("TIEMPO POR MÓDULOS",48);

    const tiempos=obtenerTiemposModulos();

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(11);

    let yMod=cursorY;

    function lineaModulo(nombre,tiempo){

        pdf.setTextColor(...COLOR.negro);

        pdf.text(
            nombre,
            24,
            yMod
        );

        pdf.text(
            formatearTiempo(tiempo),
            180,
            yMod,
            {align:"right"}
        );

        yMod+=8;

    }

    lineaModulo(
        "RESPIRADOR",
        tiempos.respirador
    );

    lineaModulo(
        "BEDSIDE",
        tiempos.bedside
    );

    lineaModulo(
        "MONITOR",
        tiempos.monitor
    );

    lineaModulo(
        "BOMBAS",
        tiempos.bombas
    );

    siguiente(34);

        /*==================================================
            ESTADÍSTICAS
    ==================================================*/

    caja("ESTADÍSTICAS",30);

    let recuperados = 0;

    if(simulacion.sistemas.respirador.recuperado) recuperados++;
    if(simulacion.sistemas.bedside.recuperado) recuperados++;
    if(simulacion.sistemas.monitor.recuperado) recuperados++;
    if(simulacion.sistemas.bombas.recuperado) recuperados++;

    pdf.setFont("helvetica","normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLOR.negro);

lineaDato(
    "Errores de validación",
    simulacion.errores,
    cursorY
);

lineaDato(
    "Módulos recuperados",
    recuperados+"/4",
    cursorY+8
);
    siguiente(30);



    /*==================================================
            VALIDACIÓN
    ==================================================*/
pdf.setFont("helvetica","italic");
pdf.setFontSize(9);
pdf.setTextColor(110);

pdf.text(
    "Clasificación obtenida",
    25,
    cursorY
);

cursorY += 6;

    caja("VALIDACIÓN",34);

    let colorValidacion = COLOR.verde;

    if(clasificacion.texto==="LEGENDARIO")
        colorValidacion=COLOR.morado;

    if(clasificacion.texto==="AVANZADO")
        colorValidacion=COLOR.azulClaro;

    if(clasificacion.texto==="OPERATIVO")
        colorValidacion=COLOR.naranja;

    if(clasificacion.texto==="MISIÓN NO COMPLETADA")
        colorValidacion=COLOR.rojo;

    pdf.setFillColor(...colorValidacion);

    pdf.roundedRect(
        30,
        cursorY,
        150,
        12,
        2,
        2,
        "F"
    );

    pdf.setTextColor(255);

    pdf.setFont("helvetica","bold");

    pdf.setFontSize(14);

    pdf.text(
        clasificacion.texto,
        105,
        cursorY+8,
        {align:"center"}
    );

    siguiente(34);



    /*==================================================
            ESTADO FINAL
    ==================================================*/

    caja("ESTADO FINAL",44);

    pdf.setFont("helvetica","normal");

    pdf.setFontSize(11);

    let yEstado = cursorY;

function escribirEstado(nombre,ok){

    // Círculo
    pdf.setFillColor(
        ...(ok ? COLOR.verde : COLOR.rojo)
    );

    pdf.circle(
        27,
        yEstado-1,
        1.6,
        "F"
    );

    // Texto
    pdf.setFont("helvetica","normal");
    pdf.setFontSize(11);

    pdf.setTextColor(...COLOR.negro);

    pdf.text(
        nombre,
        32,
        yEstado
    );

    yEstado += 8;

}

    escribirEstado(
        "RESPIRADOR",
        simulacion.sistemas.respirador.recuperado
    );

    escribirEstado(
        "BEDSIDE",
        simulacion.sistemas.bedside.recuperado
    );

    escribirEstado(
        "MONITOR",
        simulacion.sistemas.monitor.recuperado
    );

    escribirEstado(
        "BOMBAS",
        simulacion.sistemas.bombas.recuperado
    );

    siguiente(46);



/*==================================================
        PIE DEL INFORME
==================================================*/

// Dejamos un pequeño margen debajo de ESTADO FINAL
cursorY += 2;

// Línea separadora
pdf.setDrawColor(180);

pdf.line(
    PAGE.x,
    cursorY,
    PAGE.x + PAGE.w,
    cursorY
);

cursorY += 6;

// Document ID
const ahora = new Date();

const fechaID =
    String(ahora.getFullYear()).slice(-2) +
    String(ahora.getMonth()+1).padStart(2,"0") +
    String(ahora.getDate()).padStart(2,"0");

const tiempoID =
    formatearTiempo(simulacion.tiempoEmpleado)
    .replace(":","");

const randomID =
    Math.random()
        .toString(36)
        .substring(2,6)
        .toUpperCase();

const documentID =
    `UCIP-${fechaID}-${tiempoID}-${randomID}`;

pdf.setFont("helvetica","italic");
pdf.setFontSize(8);
pdf.setTextColor(100);

pdf.text(
    "Documento generado automáticamente por UCIP CORE Recovery Engine",
    PAGE.x,
    cursorY
);

cursorY += 4;

pdf.text(
    "Hospital Universitario Materno Infantil",
    PAGE.x,
    cursorY
);

cursorY += 4;

pdf.text(
    "Unidad de Medicina Intensiva Pediátrica",
    PAGE.x,
    cursorY
);

// Document ID alineado a la derecha
pdf.setFont("courier","bold");
pdf.setTextColor(...COLOR.negro);

pdf.setFillColor(240);

pdf.roundedRect(
    135,
    cursorY-5,
    55,
    10,
    2,
    2,
    "F"
);

pdf.text(
    documentID,
    PAGE.x + PAGE.w,
    cursorY,
    { align:"right" }
);

// Guardar PDF
pdf.save("Informe_UCIP_CORE.pdf");

}



/* ==========================================
   DEBUG
========================================== */

function resetDebug(){

    // Detener temporizador
    clearInterval(intervaloTiempo);
    intervaloTiempo = null;

    // Reiniciar tiempo
    simulacion.tiempoRestante = 45*60;

    // Reiniciar sistemas
    simulacion.sistemas.respirador.estado = "RECUPERABLE";
    simulacion.sistemas.respirador.recuperado = false;

    simulacion.sistemas.bedside.estado = "BLOQUEADO";
    simulacion.sistemas.bedside.recuperado = false;

    simulacion.sistemas.monitor.estado = "BLOQUEADO";
    simulacion.sistemas.monitor.recuperado = false;

    simulacion.sistemas.bombas.estado = "BLOQUEADO";
    simulacion.sistemas.bombas.recuperado = false;

    // Reiniciar constantes del paciente
    simulacion.paciente.constantes.fc = 162;
    simulacion.paciente.constantes.spo2 = 72;
    simulacion.paciente.constantes.taSis = 62;
    simulacion.paciente.constantes.taDia = 34;
    simulacion.paciente.constantes.fr = null;
    simulacion.paciente.constantes.etco2 = null;

    actualizarEstadoPaciente();

}

/* ==========================================
   DEBUG RESPIRADOR
========================================== */

function debugRespirador(){

    resetDebug();

    simulacion.tiempoRestante = 45*60;

    mostrarCentroRecuperacion();

    iniciarTemporizador();

}

/* ==========================================
   DEBUG BEDSIDE
========================================== */

function debugBedside(){

    resetDebug();

    simulacion.tiempoRestante = 42*60;

    simulacion.sistemas.respirador.estado = "OPERATIVO";
    simulacion.sistemas.respirador.recuperado = true;

    mejorarPacienteRespirador();

    simulacion.sistemas.bedside.estado = "DISPONIBLE";

    actualizarEstadoPaciente();

    mostrarCentroRecuperacion();

    iniciarTemporizador();

}

/* ==========================================
   DEBUG MONITOR
========================================== */

function debugMonitor(){

    resetDebug();

    simulacion.tiempoRestante = 38*60;

    simulacion.sistemas.respirador.estado = "OPERATIVO";
    simulacion.sistemas.respirador.recuperado = true;

    simulacion.sistemas.bedside.estado = "OPERATIVO";
    simulacion.sistemas.bedside.recuperado = true;

    mejorarPacienteRespirador();
    mejorarPacienteBedside();

    simulacion.sistemas.monitor.estado = "DISPONIBLE";

    actualizarEstadoPaciente();

    mostrarCentroRecuperacion();

    iniciarTemporizador();

}

/* ==========================================
   DEBUG BOMBAS
========================================== */

function debugBombas(){

    resetDebug();

    simulacion.tiempoRestante = 25*60;

    simulacion.sistemas.respirador.estado = "OPERATIVO";
    simulacion.sistemas.respirador.recuperado = true;

    simulacion.sistemas.bedside.estado = "OPERATIVO";
    simulacion.sistemas.bedside.recuperado = true;

    simulacion.sistemas.monitor.estado = "OPERATIVO";
    simulacion.sistemas.monitor.recuperado = true;

    mejorarPacienteRespirador();
    mejorarPacienteBedside();
    mejorarPacienteMonitor();

    simulacion.sistemas.bombas.estado = "DISPONIBLE";
    simulacion.sistemas.bombas.recuperado = false;

    actualizarEstadoPaciente();

    mostrarCentroRecuperacion();

    iniciarTemporizador();

}
function debugRecovery(){

    simulacion.tiempoRestante = 45*60;

    simulacion.sistemas.respirador.estado = "DISPONIBLE";
    simulacion.sistemas.respirador.recuperado = false;

    simulacion.sistemas.bedside.estado = "BLOQUEADO";
    simulacion.sistemas.bedside.recuperado = false;

    simulacion.sistemas.monitor.estado = "BLOQUEADO";
    simulacion.sistemas.monitor.recuperado = false;

    simulacion.sistemas.bombas.estado = "BLOQUEADO";
    simulacion.sistemas.bombas.recuperado = false;

    actualizarEstadoPaciente();

    mostrarCentroRecuperacion();

    iniciarTemporizador();

}
/* ==========================================
   DEBUG FINAL
========================================== */

function debugFinal(){

    simulacion.tiempoRestante = 18*60 + 37;

    simulacion.sistemas.respirador.estado = "OPERATIVO";
    simulacion.sistemas.respirador.recuperado = true;

    simulacion.sistemas.bedside.estado = "OPERATIVO";
    simulacion.sistemas.bedside.recuperado = true;

    simulacion.sistemas.monitor.estado = "OPERATIVO";
    simulacion.sistemas.monitor.recuperado = true;

    simulacion.sistemas.bombas.estado = "OPERATIVO";
    simulacion.sistemas.bombas.recuperado = true;

    actualizarEstadoPaciente();

    mostrarRestorationEngine();

}
/* ==========================================
   DEBUG PDF
========================================== */

function debugPDF(){

    // Simular misión completada
    simulacion.tiempoEmpleado = 18*60 + 37;

    simulacion.errores = 7;

    simulacion.participantes = [
        "Fernando",
        "Laura",
        "Sergio"
    ];

    simulacion.tiempos = {

        respirador: 292,   // 04:52

        bedside: 606,      // 10:06

        monitor: 831,      // 13:51

        bombas: 1117       // 18:37

    };

    simulacion.sistemas.respirador.recuperado = true;
    simulacion.sistemas.bedside.recuperado = true;
    simulacion.sistemas.monitor.recuperado = true;
    simulacion.sistemas.bombas.recuperado = true;

    mostrarRestorationEngine();

}