const moduleName = 'Main';
const worker1 = new Worker('/worker/worker.js?name=worker1', { type: 'module' });
const worker2 = new Worker('/worker/worker.js?name=worker2', { type: 'module' });
let currentMessageId = 1;
// Register direct channel in another worker
const channel = new MessageChannel();
await postMessage('registerChannel', {
    target: "worker" /* Worker */,
    port: channel.port1
}, worker1, [channel.port1]);
await postMessage('registerChannel', {
    target: "worker" /* Worker */,
    port: channel.port2
}, worker2, [channel.port2]);
mainToWorker1Button.addEventListener('click', fromMainToWorker1);
mainToWorker2Button.addEventListener('click', fromMainToWorker2);
worker1ToWorker2Button.addEventListener('click', fromWorker1ToWorker2);
worker2ToWorker1Button.addEventListener('click', fromWorker2ToWorker1);
function postMessage(method, data, worker, transfer) {
    const messageId = currentMessageId++;
    const message = { messageId, method, data };
    return new Promise(resolve => {
        const onResponse = (e) => {
            e.data === messageId;
            worker.removeEventListener('message', onResponse);
            resolve();
        };
        worker.addEventListener('message', onResponse);
        if (transfer) {
            worker.postMessage(message, transfer);
        }
        else {
            worker.postMessage(message);
        }
    });
}
async function fromMainToWorker1() {
    log('Send message to Worker1');
    await postMessage('message', {
        channel: "main" /* Main */,
        message: { foo: 'bar' }
    }, worker1);
}
async function fromMainToWorker2() {
    log('Send message to Worker2');
    await postMessage('message', {
        channel: "main" /* Main */,
        message: { foo: 'bar' }
    }, worker2);
}
async function fromWorker1ToWorker2() {
    await postMessage('sendMessage', {
        channel: "worker" /* Worker */,
        message: { foo: 'bar' }
    }, worker1);
}
async function fromWorker2ToWorker1() {
    await postMessage('sendMessage', {
        channel: "worker" /* Worker */,
        message: { foo: 'bar' }
    }, worker2);
}
function log(message, ...optionalParams) {
    console.log(`%c${moduleName}`, 'background: blue; color: white; padding: 0 4px;', message, ...optionalParams);
}
export {};
