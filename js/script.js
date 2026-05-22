import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjLXqBV2uRqRNj_b_Afj8LB6ofUvmh9hg",
    authDomain: "chatbot-6e89a.firebaseapp.com",
    projectId: "chatbot-6e89a",
    storageBucket: "chatbot-6e89a.firebasestorage.app",
    messagingSenderId: "352570271409",
    appId: "1:352570271409:web:542f7b6ad9607d3508a490"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BACKEND_URL = "https://chatbot-back-bice.vercel.app/api/chat";

const conversationHistory = [];
const CHAT_ID =
    localStorage.getItem("chat_id") ||
    crypto.randomUUID();

localStorage.setItem("chat_id", CHAT_ID);

const messagesArea = document.getElementById("messagesArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const PLANS = [
    {
        id: "landing",
        name: "Landing Page",
        subtitle: "Site de Vendas Essencial",
        price: "R$ 499,00",
        description: "Página única de alta conversão com design profissional, formulário de leads e integração com WhatsApp.",
        features: ["Design responsivo", "Botão WhatsApp", "Formulário de leads", "SEO básico"],
        image: "img/landing.png",
        color: "#0f62fe"
    },
    {
        id: "site",
        name: "Site Completo",
        subtitle: "Presença Digital Profissional",
        price: "R$ 999,00",
        description: "Site multi-páginas com blog, painel de edição simples e animações premium.",
        features: ["Multi-páginas", "Blog / Notícias", "Painel de edição", "Google Analytics", "Animações premium"],
        image: "img/site.png",
        color: "#7c3aed"
    },
    {
        id: "ecommerce",
        name: "E-commerce",
        subtitle: "Loja Virtual Completa",
        price: "R$ 1.999,00",
        description: "Loja online com carrinho, checkout (Pix, cartão, boleto) e gestão de estoque.",
        features: ["Catálogo de produtos", "Pix / Cartão / Boleto", "Gestão de estoque", "Cupons desconto", "App mobile"],
        image: "img/ecommerce.png",
        color: "#059669"
    },
    {
        id: "ia",
        name: "IA + Automação",
        subtitle: "Site Inteligente com Chatbot",
        price: "A partir de R$ 999,00",
        description: "Site completo com chatbot de IA para atender, capturar leads e fechar vendas 24/7.",
        features: ["Chatbot com IA", "Atendimento 24/7", "Captura de leads", "Integração CRM", "Automação WhatsApp"],
        image: "img/ia.png",
        color: "#ea580c"
    },
    {
        id: "sistema",
        name: "Sistema Web",
        subtitle: "Sistema de Ordem de Serviço",
        price: "R$ 1.499,00",
        description: "Sistema para gerenciar ordens de serviço, clientes e status de atendimento.",
        features: ["Cadastro de Clientes", "Controle de OS", "Status de Atendimento", "Gestão Operacional", "Sistema Responsivo"],
        image: "img/sistema.png",
        color: "#0891b2"
    }
];

const WHATSAPP_NUMBER = "5521975930204";

function getCurrentTime() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

async function saveMessages() {
    try {
        await setDoc(doc(db, "chats", CHAT_ID), {
            messages: conversationHistory
        });
    } catch (error) {
        console.error("Erro ao salvar mensagens:", error);
    }
}

async function loadMessages() {
    try {
        const docRef = doc(db, "chats", CHAT_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.messages && Array.isArray(data.messages)) {

                conversationHistory.push(...data.messages);

                data.messages.forEach(msg => {
                    appendMessage(
                        msg.content,
                        msg.role === "assistant" ? "bot" : "user"
                    );
                });
            }
        } else {
            initChat();
        }

    } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
        initChat();
    }
}

function appendMessage(text, sender = "bot", quickReplies = []) {
    const isBot = sender === "bot";
    const row = document.createElement("div");
    row.className = `msg-row ${isBot ? "" : "user"}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = `msg-avatar ${isBot ? "bot" : "user-av"}`;
    avatarEl.innerHTML = isBot
        ? `<span style="font-family:'Sora',sans-serif;font-weight:600;font-size:11px;letter-spacing:-0.5px;">TL<span style="color:#4f8ef7;">.</span></span>`
        : "EU";

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

function showPlansCarousel() {
    const row = document.createElement("div");
    row.className = "msg-row";

    const avatarEl = document.createElement("div");
    avatarEl.className = "msg-avatar bot";
    avatarEl.innerHTML = `<span style="font-family:'Sora',sans-serif;font-weight:600;font-size:11px;letter-spacing:-0.5px;">TL<span style="color:#4f8ef7;">.</span></span>`;

    const bubbleWrap = document.createElement("div");
    bubbleWrap.className = "bubble-wrap";
    bubbleWrap.style.maxWidth = "100%";
    bubbleWrap.style.width = "100%";

    const label = document.createElement("div");
    label.className = "bubble bot";
    label.textContent = "Aqui estão nossos planos! 🚀 Deslize para ver todos:";
    label.style.marginBottom = "10px";

    // WRAPPER
    const carouselWrapper = document.createElement("div");
    carouselWrapper.className = "plans-carousel-wrapper";

    // BOTÃO ESQUERDA
    const leftBtn = document.createElement("button");
    leftBtn.className = "carousel-nav left";
    leftBtn.innerHTML = "‹";

    // BOTÃO DIREITA
    const rightBtn = document.createElement("button");
    rightBtn.className = "carousel-nav right";
    rightBtn.innerHTML = "›";

    // CARROSSEL
    const carousel = document.createElement("div");
    carousel.className = "plans-carousel";

    PLANS.forEach(plan => {
        const card = document.createElement("div");
        card.className = "plan-card";
        card.style.setProperty("--plan-color", plan.color);

        card.innerHTML = `
            <div class="plan-card-img">
                <img src="${plan.image}" alt="${plan.name}" onerror="this.parentElement.style.background='${plan.color}20'; this.style.display='none'"/>
                <div class="plan-card-badge" style="background:${plan.color}">${plan.price}</div>
            </div>

            <div class="plan-card-body">
                <div class="plan-card-name">${plan.name}</div>
                <div class="plan-card-sub">${plan.subtitle}</div>
                <div class="plan-card-desc">${plan.description}</div>

                <ul class="plan-card-features">
                    ${plan.features.map(f => `<li>✓ ${f}</li>`).join("")}
                </ul>

                <a class="plan-card-btn"
                   style="background:${plan.color}"
                   href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Tenho interesse no plano ${plan.name} (${plan.price}). Pode me dar mais informações?`)}"
                   target="_blank"
                   rel="noopener">
                   Quero esse plano →
                </a>
            </div>
        `;

        carousel.appendChild(card);
    });

    leftBtn.addEventListener("click", () => {
        carousel.scrollBy({
            left: -320,
            behavior: "smooth"
        });
    });

    rightBtn.addEventListener("click", () => {
        carousel.scrollBy({
            left: 320,
            behavior: "smooth"
        });
    });

    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener("mousedown", (e) => {
        isDown = true;
        carousel.classList.add("dragging");

        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener("mouseleave", () => {
        isDown = false;
        carousel.classList.remove("dragging");
    });

    carousel.addEventListener("mouseup", () => {
        isDown = false;
        carousel.classList.remove("dragging");
    });

    carousel.addEventListener("mousemove", (e) => {
        if (!isDown) return;

        e.preventDefault();

        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.2;

        carousel.scrollLeft = scrollLeft - walk;
    });

    carouselWrapper.appendChild(leftBtn);
    carouselWrapper.appendChild(carousel);
    carouselWrapper.appendChild(rightBtn);

    const timeEl = document.createElement("div");
    timeEl.className = "bubble-time";
    timeEl.textContent = getCurrentTime();

    bubbleWrap.appendChild(label);
    bubbleWrap.appendChild(carouselWrapper);
    bubbleWrap.appendChild(timeEl);

    row.appendChild(avatarEl);
    row.appendChild(bubbleWrap);

    messagesArea.appendChild(row);

    scrollToBottom();
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
    await saveMessages();

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
    await saveMessages();

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

        if (reply.trim() === "SHOW_PLANS") {
            showPlansCarousel();
        } else {
            appendMessage(reply, "bot");
        }

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
            "Olá! 👋 Sou o Assistente Virtual da TL Dev Studio. Como posso te ajudar hoje?",
            "bot",
            ["💬 Falar com suporte", "📦 Ver planos", "❓ Tirar dúvidas"]
        );
    }, 600);
}

loadMessages();