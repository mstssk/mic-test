"use strict";
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const result = document.getElementById("result");
let recordingStream = null;
startButton?.addEventListener("click", () => {
    console.log("Start button clicked");
    run().catch((error) => {
        console.error("Error during recording:", error);
        if (recordingStream) {
            recordingStream.getTracks().forEach((track) => track.stop());
            recordingStream = null;
        }
        alert(error.message || "An error occurred during recording.");
    });
});
stopButton?.addEventListener("click", () => {
    console.log("Stop button clicked");
    if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
        recordingStream = null;
    }
});
console.log("Supported constraints:", navigator.mediaDevices.getSupportedConstraints());
async function run() {
    const echoCancellation = document.getElementById("echoCancellation").checked;
    const noiseSuppression = document.getElementById("noiseSuppression").checked;
    const autoGainControl = document.getElementById("autoGainControl").checked;
    console.log("Starting recording with options:", {
        echoCancellation,
        noiseSuppression,
        autoGainControl,
    });
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation,
            noiseSuppression,
            autoGainControl,
        },
    });
    recordingStream = stream;
    const blob = await record(stream);
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(blob);
    audio.preload = "auto";
    audio.controls = true;
    const div = document.createElement("div");
    div.style = "display: flex; align-items: center;";
    div.appendChild(audio);
    div.appendChild(document.createTextNode(JSON.stringify({ echoCancellation, noiseSuppression, autoGainControl })));
    result.appendChild(div);
}
async function record(stream) {
    const recorder = new MediaRecorder(stream);
    recorder.start();
    console.log("Recording started");
    return new Promise((resolve) => {
        recorder.ondataavailable = (event) => {
            console.log("Data available from MediaRecorder", event.timeStamp);
            resolve(event.data);
        };
    });
}
