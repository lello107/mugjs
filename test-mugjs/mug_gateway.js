
const fs = require('fs');
const readline = require('readline');
const axios = require('axios');
const path = require('path');

const LOGBASE = 'log/';

function getTimestamp() {
  return new Date().toISOString();
}

function logToFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, content + '\n');
}

async function sendCurl(url, data, contentType = 'text/plain') {
  try {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': contentType },
      timeout: 1000,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      proxy: false 
    });
    return response.data;
  } catch (error) {
    return 'ERROR';
  }
}

process.stdin.on('data', (data) => {
  const input = data.toString().trim();
  const array = input.split(/[, ]+/);
  const CH = input.substring(9, 12);
  const LOGDIR = path.join(LOGBASE, CH);
  const TIMESTAMP = getTimestamp();

  const INITL = path.join(LOGBASE, 'init.log');
  const DEBUGL = path.join(LOGBASE, 'debug.log');

  const logs = {
    RECPL: path.join(LOGDIR, 'recprd_ems_coll.log'),
    RECDL: path.join(LOGDIR, 'recdev_ems_coll.log'),
    BRKPL: path.join(LOGDIR, 'brkprd_ems_prod.log'),
    BRKDL: path.join(LOGDIR, 'brkdev_ems_coll.log'),
    BRKTL: path.join(LOGDIR, 'brktst_ems_coll.log'),
    PGMPL: path.join(LOGDIR, 'pgmprd_ems_prod.log'),
    PGMDL: path.join(LOGDIR, 'pgmdev_ems_coll.log'),
    PGMTL: path.join(LOGDIR, 'pgmtst_ems_coll.log'),
    BRKPLAUX: path.join(LOGDIR, 'brkprd_ems_coll.log'),
    PGMPLAUX: path.join(LOGDIR, 'pgmprd_ems_coll.log'),
    DAIPRD: path.join(LOGDIR, 'daiprd_ems_coll.log')
  };

  if (input === 'INIT') {
    console.log('INITOK');
    logToFile(INITL, `${TIMESTAMP} ; INIT`);

  } else if (input === 'POLL') {
    console.log('POLLOK');

  } else if (input.startsWith('BRKPRD')) {
    logToFile(logs.BRKPL, `${TIMESTAMP} ; {${input.slice(7)}} ; `);
    const status = 'OK'// await sendCurl('https://ems.skytech.local/api/v1/playout/breaksignaling', `'{'${input.slice(7)}'}'`);
    const ack = status === 'OK' ? 'BRKP-ACK' : 'BRKP-NAK';
    console.log(ack);
    logToFile(logs.BRKPL, ack);
    const status2 = 'OK' //await sendCurl('https://ems-coll.skytech.local/api/v1/playout/breaksignaling', `'{'${input.slice(7)}'}'`);
    logToFile(logs.BRKPLAUX, `${TIMESTAMP} ; {${input.slice(7)}} ; ${status2}`);

  } else if (input.startsWith('RECPRD')) {
    const json = {
      type: 'start',
      channelName: array[2],
      eventKey: `REC:${array[1]}:${array[2]}:${array[3]}`,
      startTime: array[4]
    };
    logToFile(logs.RECPL, `${TIMESTAMP} ; ${JSON.stringify(json)} ; `);
    const status = 'OK' //await sendCurl('https://ems.skytech.local/api/v1/playout/recsignaling', json, 'application/json');
    const ack = status === 'OK' ? 'RECPL-ACK' : 'RECPL-NAK';
    console.log(ack);
    logToFile(logs.RECPL, ack);

  } else if (input.startsWith('DAIPRD')) {
    const json = {
      type: 'start',
      channelName: array[2],
      eventKey: `DAI:${array[1]}:${array[2]}:${array[3]}`,
      startTime: array[4]
    };
    logToFile(logs.DAIPRD, `${TIMESTAMP} ; ${JSON.stringify(json)} ; `);
    const status = 'OK' //sendCurl('http://10.64.7.212:3001/hello', json, 'application/json');
    const ack = status === 'OK' ? 'DAIPRD-ACK' : 'DAIPRD-NAK';
    console.log(ack);
    logToFile(logs.DAIPRD, ack);

  } else {
    console.log('KO - Missing command');
    logToFile(DEBUGL, `${TIMESTAMP} ; DEBUG ; ${input}`);

  }
});
