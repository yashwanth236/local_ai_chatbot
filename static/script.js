const messages = document.getElementById("messages");
const input = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

// =====================================================
//                ADD MESSAGE + ANIMATION
// =====================================================

function addMessage(text, who = "bot", animated = false) {
    const div = document.createElement("div");
    div.className = "msg " + (who === "user" ? "user" : "bot");

    // No animation → normal message
    if (!animated) {
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return;
    }

    // Typing animation
    let i = 0;
    messages.appendChild(div);

    const interval = setInterval(() => {
        if (i < text.length) {
            div.textContent += text[i];
            i++;
            messages.scrollTop = messages.scrollHeight;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// =====================================================
//                 BOT TYPING INDICATOR
// =====================================================

function showTyping() {
    const div = document.createElement("div");
    div.id = "typing";
    div.className = "msg bot";
    div.textContent = "• • •";
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
    const typingDiv = document.getElementById("typing");
    if (typingDiv) typingDiv.remove();
}

// =====================================================
//                 SEND MESSAGE TO BACKEND
// =====================================================

async function sendText(text) {
    addMessage(text, "user");

    showTyping();

    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    const data = await res.json();

    hideTyping();

    addMessage(data.reply, "bot", true);

    speak(data.reply);
}

// Button send
sendBtn.onclick = () => {
    const text = input.value.trim();
    if (!text) return;
    sendText(text);
    input.value = "";
};

// Enter key
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

// =====================================================
//           SPEECH SYNTHESIS (Better Voice)
// =====================================================

let selectedVoice = null;

speechSynthesis.onvoiceschanged = () => {
    const voices = speechSynthesis.getVoices();

    selectedVoice =
        voices.find(v => v.name.includes("Microsoft Aria")) ||
        voices.find(v => v.name.includes("Microsoft Zira")) ||
        voices.find(v => v.name.includes("Google US English")) ||
        voices.find(v => v.lang === "en-US") ||
        voices[0];
};

function speak(text) {
    let cleaned = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`/g, '');

    const u = new SpeechSynthesisUtterance(cleaned);

    if (selectedVoice) {
        u.voice = selectedVoice;
    }

    u.rate = 1;
    u.pitch = 1;

    speechSynthesis.speak(u);
}

// =====================================================
//           SPEECH TO TEXT (STT)
// =====================================================

let recognition;

if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";

  micBtn.onclick = () => {
    recognition.start();

    // Start animation
    micBtn.classList.add("mic-active");

    const indicator = document.getElementById("listeningIndicator");
    indicator.style.display = "block";
};

recognition.onend = () => {
    // Stop animation when listening stops
    micBtn.classList.remove("mic-active");

    const indicator = document.getElementById("listeningIndicator");
    indicator.style.display = "none";
};


    recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        sendText(spoken);
    };

    recognition.onend = () => {
        micBtn.classList.remove("mic-active");
    };

    recognition.onstart = () => {
        micBtn.classList.add("mic-active");
    };

} else {
    micBtn.textContent = "Mic Not Supported";
    micBtn.disabled = true;
}
