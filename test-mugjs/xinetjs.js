
const net = require('net');
const { spawn } = require('child_process');

const PORT = process.env.PORT;

const appName = process.env.APP_NAME || 'App';
console.log(`Avviando ${appName}...`);

const MAX_CONNECTIONS = 5;
const TIMEOUT_MS = 30000; // 30 secondi
const ALLOWED_IPS = ['127.0.0.1', '::1', '10.64.10.175', '::ffff:10.64.10.175']; // Aggiungi IP autorizzati qui

let activeConnections = 0;

const server = net.createServer((socket) => {
    socket.setNoDelay(true);
    const remoteIP = socket.remoteAddress;
    console.log(`[INFO] Connessione da ${remoteIP}`);

    // Controllo IP
    if (!ALLOWED_IPS.includes(remoteIP)) {
        console.log(`[WARN] Connessione rifiutata da IP non autorizzato: ${remoteIP}`);
        socket.destroy();
        return;
    }

    // Limite connessioni
    if (activeConnections >= MAX_CONNECTIONS) {
        console.log(`[WARN] Limite massimo di connessioni raggiunto`);
        socket.end('Server occupato, riprova più tardi.\n');
        return;
    }

    activeConnections++;
    console.log(`[INFO] Connessioni attive: ${activeConnections}`);

    // Timeout
    socket.setTimeout(TIMEOUT_MS);
    socket.on('timeout', () => {
        console.log(`[INFO] Timeout connessione da ${remoteIP}`);
        socket.end('Timeout di inattività.\n');
    });

    // Avvia processo figlio
    const child = spawn('node', ['mug_gateway.js'], { stdio: ['pipe', 'pipe', 'pipe'] }); // Sostituisci con il tuo programma


    socket.pipe(child.stdin);
    child.stdout.pipe(socket);
    child.stderr.pipe(process.stderr);

    socket.on('data', (data) => {
        if(data.toString() === "POLL"){

        }else{

            console.log(`[DEBUG] Ricevuto dal client: ${data.toString()}`);
        }
    });



    socket.on('close', () => {
        console.log(`[INFO] Connessione chiusa da ${remoteIP}`);
        // child.kill();
        activeConnections--;
    });

    socket.on('error', (err) => {
        console.error(`[ERROR] Socket error: ${err.message}`);
    });

    child.on('exit', (code, signal) => {
        // console.log(`[INFO] Processo figlio terminato con codice ${code}`);

        console.log(`[INFO] Processo figlio terminato con codice: ${code}, segnale: ${signal}`);

    });
});

server.listen(PORT, () => {
    console.log(`[INFO] Server in ascolto sulla porta ${PORT}`);
});

server.on('error', (err) => {
    console.error(`[ERROR] Errore del server: ${err.message}`);
});
