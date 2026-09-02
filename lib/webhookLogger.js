import { time } from "./util.js";

const urls = {
    "glitch-usa": "/api/webhooks/1536508050620293272/HgZI8d2nGGKX_vfsBL4dIK3fnGUzJuO5FR1RZZ8A0KzUCHOtmlckwfN9wwqUw8XxNWbN",
    "development": "/api/webhooks/1266391955898892413/jyxmwKPy5Z9SlyY60_dDAm_6GSTX2LQ-fxvCtV-ssOdNxmqaLIBPUzdj5SQirZkZ57pb",
    "dallas-router": "/api/webhooks/1275161091546288169/TXRFQjd8yqk6AaNNwXdF981Sjx3pkCzftlTclDEQRJrx4M0UhI1sHpSS_qL6PBUlgMNl"
};

let lastSend = 0;

const queue = [];
const selectedPath = urls[Bun.env.LOG_NAME] || urls.development;
export const logName = selectedPath === urls["development"] ? "development." : "";

function send(data) {
    fetch("https://discordapp.com" + selectedPath, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: data.trim()
        })
    }).catch(console.error);
}

function publish(force) {
    let output = "";
    if (queue.length < 3 && Date.now() - lastSend < 10000 && !force)  return;
    lastSend = Date.now();

    while (queue.length > 0) {
        if (output + "\n" + queue[0] > 2000) return send(output);
        output += "\n" + queue.shift();
    }

    send(output);
}

function internalLog(data, force) {
    data = data + "";
    data = data.replace("@", "🤓");
    data = data.trim();

    if (data.length > 2000) {
        while (data.length) {
            send(data.slice(0, 2000).trim());
            data = data.slice(2000).trim();
        }
        return;
    }

    queue.push(data);

    if (force) publish(true);
}

setInterval(publish, 5000);

export default function logToWebhook(...args) {
    args.unshift(`[${time()}]`);
    console.log(...args);
    internalLog(args.join(" "), false);
}