const moduleUrl = new URL(import.meta.url);
const moduleName = moduleUrl.searchParams.get('name');
const channels = {
    ["main" /* Main */]: self,
    ["worker" /* Worker */]: null
};
function onMessage(e) {
    switch (e.data?.method) {
        case 'sendMessage':
            sendMessage(e.data.messageId, e.data.data);
            break;
        case 'registerChannel':
            registerChannel(e.data.messageId, e.data.data);
            break;
        case 'message':
            receiveMessage(e.data.messageId, e.data.data);
            break;
    }
}
function sendMessage(messageId, data) {
    const channel = channels[data.channel];
    if (!channel)
        return;
    log('Send message to ' + data.channel);
    channel.postMessage(data.message);
    self.postMessage(messageId);
}
function registerChannel(messageId, data) {
    log(`Register ${data.target} channel`);
    channels[data.target] = data.port;
    data.port.onmessage = (e) => {
        log('Receive message from ' + data.target, e.data);
    };
    self.postMessage(messageId);
}
function receiveMessage(messageId, data) {
    const channel = channels[data.channel];
    if (!channel)
        return;
    log('Receive message from ' + data.channel);
    self.postMessage(messageId);
}
function log(message, ...optionalParams) {
    console.log(`%c${moduleName}`, 'background: blue; color: white; padding: 0 4px;', message, ...optionalParams);
}
function isWorker(obj) {
    return obj === self;
}
self.addEventListener('message', onMessage);
export {};
