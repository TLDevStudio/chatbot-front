const BACKEND_URL = "https://chatbot-back-bice.vercel.app/api/chat";

const conversationHistory = [];

const messagesArea = document.getElementById("messagesArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function getCurrentTime() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function appendMessage(text, sender = "bot", quickReplies = []) {
    const isBot = sender === "bot";
    const row = document.createElement("div");
    row.className = `msg-row ${isBot ? "" : "user"}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = `msg-avatar ${isBot ? "bot" : "user-av"}`;
    avatarEl.innerHTML = isBot ? `<span style="font-family:'Sora',sans-serif;font-weight:600;font-size:11px;letter-spacing:-0.5px;">TL<span style="color:#4f8ef7;">.</span></span>` : "EU";

    const bubbleWrap = document.createElement("div");
    bubbleWrap.className = "bubble-wrap";

    const bubble = document.createElement("div");
    bubble.className = `bubble ${isBot ? "bot" : "user"}`;
    bubble.textContent = text;

    const timeEl = document.createElement("div");
    timeEl.className = "bubble-time";
    timeEl.textContent = getCurrentTime();

    bubbleWrap.appendChild(bubble);
    bubbleWrap.appendChild(timeEl);

    if (isBot && quickReplies.length > 0) {
        const qrWrap = document.createElement("div");
        qrWrap.className = "quick-replies";

        quickReplies.forEach(label => {
            const btn = document.createElement("button");
            btn.className = "quick-btn";
            btn.textContent = label;
            btn.addEventListener("click", () => {
                qrWrap.remove();
                sendMessage(label);
            });
            qrWrap.appendChild(btn);
        });

        bubbleWrap.appendChild(qrWrap);
    }

    row.appendChild(avatarEl);
    row.appendChild(bubbleWrap);
    messagesArea.appendChild(row);
    scrollToBottom();

    return bubble;
}

function showTyping() {
    const row = document.createElement("div");
    row.className = "msg-row";
    row.id = "typingIndicator";

    const avatarEl = document.createElement("div");
    avatarEl.className = "msg-avatar bot";
    avatarEl.innerHTML = `<span style="font-family:'Sora',sans-serif;font-weight:600;font-size:11px;letter-spacing:-0.5px;">TL<span style="color:#4f8ef7;">.</span></span>`;

    const typing = document.createElement("div");
    typing.className = "typing-bubble";
    typing.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

    row.appendChild(avatarEl);
    row.appendChild(typing);
    messagesArea.appendChild(row);
    scrollToBottom();
}

function hideTyping() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

async function callBackend(userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });

    const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || `Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    conversationHistory.push({ role: "assistant", content: data.reply });

    return data.reply;
}

async function sendMessage(text) {
    const message = (text || userInput.value).trim();
    if (!message) return;

    userInput.value = "";
    userInput.disabled = true;
    sendBtn.disabled = true;

    appendMessage(message, "user");
    showTyping();

    try {
        const reply = await callBackend(message);
        hideTyping();
        appendMessage(reply, "bot");
    } catch (error) {
        hideTyping();
        console.error("Erro:", error);

        let errorMsg = "Desculpe, ocorreu um erro ao processar sua mensagem.";
        if (error.message.includes("Failed to fetch")) {
            errorMsg = "🌐 Não foi possível conectar ao servidor. Verifique se o backend está no ar.";
        } else if (error.message.includes("500")) {
            errorMsg = "⚠️ Erro interno no servidor. Verifique as configurações do backend.";
        }

        appendMessage(errorMsg, "bot");
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener("click", () => sendMessage());

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function initChat() {
    setTimeout(() => {
        appendMessage(
            "Olá! 👋 Sou o Assistente Virtual da AutoBot IA. Como posso te ajudar hoje?",
            "bot",
            ["💬 Falar com suporte", "📦 Ver planos", "❓ Tirar dúvidas"]
        );
    }, 600);
}

initChat();