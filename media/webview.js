const vscode = acquireVsCodeApi();

const messagesDiv = document.getElementById("messages");
const inputBox = document.getElementById("inputBox");
const sendBtn = document.getElementById("sendBtn");

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<span class="${sender}">${sender}:</span> ${text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendBtn.addEventListener("click", sendPrompt);
inputBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendPrompt();
});

function sendPrompt() {
  const text = inputBox.value.trim();
  if (!text) return;

  addMessage("you", text);
  inputBox.value = "";

  vscode.postMessage({ type: "ask", text });
}

window.addEventListener("message", (event) => {
  const msg = event.data;
  if (msg.type === "response") {
    addMessage("jeeves", msg.text);
  }
});
