/**
 * ==========================================================================================
 * PROJECT: PHARMED - HOLISTIC HEALTH PLATFORM
 * COMPONENT: Main Application Logic & AI Neural Interface
 * DEVELOPER: Arnav Bansal
 * VERSION: 3.0.0 (Enterprise Release)
 * MODEL: Gemini 2.5 Flash
 * ==========================================================================================
 */

/* ==========================================================================================
   SECTION 1: THE "MEGA-BRAIN" (SYSTEM INSTRUCTION)
   This variable contains the entire personality, knowledge base, and rules for the AI.
   It acts as the "Employee Handbook" injected into the model's context.
   ========================================================================================== */

const PHARMED_KNOWLEDGE_BASE = `
*** SYSTEM INSTRUCTIONS ***

I. CORE IDENTITY
You are "Pharmed Assistant", the advanced virtual concierge for Pharmed.
Your goal is to bridge the gap between Modern Medicine (Allopathy) and Holistic Healing (Ayurveda, Lifestyle, Nutrition).
You are NOT a doctor. You are a health consultant and guide.

II. TONE & VOICE
- Professional: You speak with authority but without arrogance.
- Empathetic: You deeply care about the user's pain. Use phrases like "I understand how difficult that can be."
- Calming: Your words should reduce anxiety.
- Format: Use bullet points for lists. Use bold text for emphasis.
- Emojis: Use them sparsely to add warmth (e.g., 🌿, 💧, 🧘, ✨).

III. FOUNDER & ORIGIN STORY
- Founder: Arnav Bansal.
- Vision: Arnav created Pharmed to solve the "pill-popping" culture. He believes the body can heal itself with the right support.
- Location: The clinic and tech HQ are based at the Newton School of Technology (NST), Sonipat, Haryana, India.
- Contact: Email at arnavbansal23feb2007@gmail.com or Phone +91-7520620895.

IV. DETAILED SERVICE MENU
1. DIGESTIVE HEALTH (Gut Reset Protocol)
   - We treat: IBS, Bloating, Acid Reflux, Leaky Gut.
   - Approach: Elimination diets, Probiotics, Stress reduction.
   - "Gut health is the root of all health."

2. HORMONAL BALANCE
   - We treat: PCOS, Thyroid issues (Hypo/Hyper), Adrenal Fatigue, Cortisol management.
   - Approach: Circadian rhythm syncing, Seed cycling, Nutrient density.

3. AUTOIMMUNE CARE
   - We treat: Rheumatoid Arthritis, Hashimoto's, Psoriasis.
   - Approach: Anti-inflammatory diet (AIP), Toxin removal.

4. MENTAL WELLNESS
   - We treat: Anxiety, Brain Fog, Burnout.
   - Approach: Nootropics, Breathwork, Sleep architecture.

5. SKIN CLARITY
   - We treat: Cystic Acne, Eczema, Rosacea.
   - Approach: "Face mapping" (treating the internal organ linked to the breakout).

V. PRICING & MEMBERSHIP TIERS (Be Exact)
- OPTION A: "The Holistic Starter" (Subscription)
  * Cost: ₹600 USD / month.
  * Includes: Weekly diet updates, 24/7 Chat access, 1 Doctor call per month.
  * Cancellation: Anytime with 15 days notice.

- OPTION B: "The Deep Dive" (One-Time)
  * Cost: ₹15000 USD (Flat fee).
  * Includes: 90-minute comprehensive consult, Full bloodwork analysis, 3-month roadmap.

- PAYMENT METHODS: Credit Card, UPI, Stripe.
- INSURANCE: We are an out-of-network provider. We provide Superbills for reimbursement.

VI. STRICT GUARDRAILS (SAFETY PROTOCOLS)
1. EMERGENCY TRIGGER: If user mentions "chest pain", "difficulty breathing", "suicide", "bleeding", or "unconscious":
   - RESPONSE: "🚨 EMERGENCY ALERT: I am an AI. Please hang up and call Emergency Services (112 in India / 911 in US) immediately. Do not wait."
2. DIAGNOSIS BLOCKER: Never say "You have [Disease]."
   - CORRECT: "Your symptoms align with [Disease], but only a doctor can diagnose this. Let's explore how to manage the symptoms."
3. PRESCRIPTIONS: Never suggest specific dosage of medication. Only suggest supplements (Magnesium, Vitamin D) with a disclaimer.
4. OFF-TOPIC: If asked about Politics, coding, or movies:
   - RESPONSE: "I am laser-focused on your health right now. Let's get back to your wellness journey. 🌿"

VII. FAQ DATABASE
- "Where are you located?" -> "We are physically at Newton School of Technology, but we serve clients globally via Telehealth."
- "Are you AI?" -> "I am a sophisticated AI trained on the Pharmed medical protocols, developed by Arnav Bansal."
- "Can I book a demo?" -> "Yes, ask for a 15-minute discovery call."

*** END OF INSTRUCTIONS ***
`;

/* ==========================================================================================
   SECTION 2: CONFIGURATION & STATE MANAGEMENT
   ========================================================================================== */

const CONFIG = {
  // CREDENTIALS
  API_KEY: "AIzaSyA7laRqgOyXVZAWMEyFKhocslyLfNJIht4",
  API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  
  // SETTINGS
  MAX_HISTORY: 15,    // Remembers last 15 exchanges
  RATE_LIMIT_DELAY: 2000, // Artificial delay for realism (ms)
};

// Application State
const STATE = {
  chatHistory: [],     // Stores the conversation context
  isTyping: false,     // Flag to prevent double submission
  userInteracted: false
};

/* ==========================================================================================
   SECTION 3: GLOBAL INITIALIZATION
   ========================================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.clear();
  console.log("%c PHARMED SYSTEM ONLINE ", "background: #222; color: #bada55; font-size: 16px;");
  
  // Initialize Modules
  initNavigation();
  initHealthTips();
  initBMI();
  initChatbot();
});

/* ==========================================================================================
   SECTION 4: NAVIGATION MODULE
   Handles active state for the navbar
   ========================================================================================== */

function initNavigation() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.main-nav a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if ((currentPath.includes(href) && href !== "") || (currentPath === "/" && href === "index.html")) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================================
   SECTION 5: INTELLIGENT HEALTH TIPS MODULE
   Expanded library of tips with categories
   ========================================================================================== */

const HEALTH_LIBRARY = [
  { cat: "Hydration", text: "Drink 500ml of water immediately after waking up to flush toxins." },
  { cat: "Sleep", text: "Blue light blocks Melatonin. Put your phone away 60 mins before bed." },
  { cat: "Nutrition", text: "Eat protein at breakfast to prevent sugar cravings later in the day." },
  { cat: "Mental", text: "Box breathing (4-4-4-4) resets the nervous system in 60 seconds." },
  { cat: "Movement", text: "Sitting is the new smoking. Stand up and stretch every 30 minutes." },
  { cat: "Gut", text: "Chew your food 20 times per bite. Digestion starts in the mouth." },
  { cat: "Sun", text: "Morning sunlight helps set your circadian rhythm for better sleep." }
];

function initHealthTips() {
  const display = document.getElementById("health-tip-display");
  const btn = document.getElementById("new-tip-btn");
  
  if (!display) return;

  const showTip = () => {
    const random = HEALTH_LIBRARY[Math.floor(Math.random() * HEALTH_LIBRARY.length)];
    display.innerHTML = `<strong>${random.cat}:</strong> ${random.text}`;
    // Add a fade-in animation effect
    display.style.opacity = 0;
    setTimeout(() => display.style.opacity = 1, 100);
  };

  // Show one on load
  showTip();

  if (btn) btn.addEventListener('click', showTip);
}

/* ==========================================================================================
   SECTION 6: ADVANCED BMI CALCULATOR MODULE
   Includes input sanitation and detailed health classifications
   ========================================================================================== */

function initBMI() {
  const btn = document.getElementById('calculate-bmi');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const weightEl = document.getElementById('weight');
    const heightEl = document.getElementById('height');
    const valEl = document.getElementById('bmi-value');
    const msgEl = document.getElementById('bmi-message');

    // 1. Input Validation
    const weight = parseFloat(weightEl.value);
    const height = parseFloat(heightEl.value);

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      alert("⚠️ Error: Please enter valid positive numbers for weight and height.");
      return;
    }

    // 2. Calculation
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    
    // 3. Update UI
    valEl.innerText = bmi;
    
    // 4. Detailed Classification Logic
    let category = "";
    let color = "";
    let advice = "";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "#e67e22"; // Orange
      advice = "Focus on nutrient-dense foods and strength training.";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      category = "Normal Weight";
      color = "#27ae60"; // Green
      advice = "Maintain your balanced diet and regular activity.";
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "Overweight";
      color = "#f39c12"; // Yellow-Orange
      advice = "Consider reducing processed carbs and increasing daily steps.";
    } else {
      category = "Obese";
      color = "#c0392b"; // Red
      advice = "We recommend a consultation to discuss metabolic health.";
    }

    msgEl.innerHTML = `<span style="color:${color}; font-weight:bold;">${category}</span><br><span style="font-size:0.9em; color:#555;">${advice}</span>`;
  });
}

/* ==========================================================================================
   SECTION 7: AI CHATBOT KERNEL
   The core logic for the conversational interface
   ========================================================================================== */

function initChatbot() {
  // DOM Elements
  const UI = {
    window: document.getElementById('chat-window'),
    toggle: document.getElementById('chat-toggle'),
    close: document.getElementById('chat-close'),
    input: document.getElementById('user-input'),
    send: document.getElementById('send-btn'),
    messages: document.getElementById('chat-messages')
  };

  if (!UI.toggle) return; // Exit if chat widget isn't in HTML

  // --- UI EVENT LISTENERS ---

  UI.toggle.addEventListener('click', () => {
    UI.window.style.display = 'flex';
    UI.toggle.style.display = 'none';
    UI.input.focus();
    
    // Initial Greeting (Only once)
    if (!STATE.userInteracted) {
      setTimeout(() => {
        addMessage("system", "👋 Hello! I'm the Pharmed Assistant. I can help with digestion, hormones, plans, or general wellness. How can I support you today?");
        STATE.userInteracted = true;
      }, 500);
    }
  });

  UI.close.addEventListener('click', () => {
    UI.window.style.display = 'none';
    UI.toggle.style.display = 'block';
  });

  UI.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  UI.send.addEventListener('click', handleSend);

  // --- CORE MESSAGING LOGIC ---

  async function handleSend() {
    const text = UI.input.value.trim();
    
    // Validation
    if (!text) return;
    if (STATE.isTyping) return; // Prevent spamming while waiting

    // 1. Clear Input & Show User Message
    UI.input.value = '';
    addMessage("user", text);
    STATE.isTyping = true;
    UI.send.disabled = true;

    // 2. Add Thinking Indicator
    const loadingId = addLoadingIndicator();

    // 3. Prepare Payload
    try {
      // Build the history for the API
      // We prepend the Knowledge Base as a "User" message at the very top of context
      // This is a "One-Shot" Context Injection technique
      
      const contentsPayload = [
        {
          role: "user",
          parts: [{ text: PHARMED_KNOWLEDGE_BASE }]
        },
        {
          role: "model",
          parts: [{ text: "I have internalized the Pharmed protocols. I am ready to assist." }]
        },
        ...STATE.chatHistory // Append actual conversation
      ];

      // Add the NEW message
      contentsPayload.push({
        role: "user",
        parts: [{ text: text }]
      });

      // 4. API Network Request
      const responseText = await callGeminiAPI(contentsPayload);

      // 5. Handle Success
      removeLoadingIndicator(loadingId);
      addMessage("model", responseText);

      // Update Local History
      STATE.chatHistory.push({ role: "user", parts: [{ text: text }] });
      STATE.chatHistory.push({ role: "model", parts: [{ text: responseText }] });
      
      // Prune History (Keep memory efficient)
      if (STATE.chatHistory.length > CONFIG.MAX_HISTORY * 2) {
        STATE.chatHistory = STATE.chatHistory.slice(-(CONFIG.MAX_HISTORY * 2));
      }

    } catch (error) {
      // 6. Handle Errors
      removeLoadingIndicator(loadingId);
      console.error("Bot Error:", error);
      
      let errorMsg = "I'm having trouble connecting right now.";
      
      if (error.message.includes("429")) {
        errorMsg = "⚠️ I am receiving too many messages. Please wait 30 seconds and try again.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMsg = "⚠️ Internet connection error. Please check your network.";
      }
      
      addMessage("system", errorMsg);
    } finally {
      STATE.isTyping = false;
      UI.send.disabled = false;
      UI.input.focus();
    }
  }

  // --- HELPER FUNCTIONS ---

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    if (role === 'user') {
      div.classList.add('sent');
    } else if (role === 'model') {
      div.classList.add('received');
    } else {
      div.classList.add('received'); // System messages look like bot messages
      div.style.fontStyle = 'italic';
      div.style.fontSize = '0.9em';
    }

    // Convert newlines to breaks and simple markdown for bolding
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
      .replace(/\n/g, '<br>');

    div.innerHTML = `<p>${formattedText}</p>`;
    UI.messages.appendChild(div);
    scrollToBottom();
  }

  function addLoadingIndicator() {
    const id = "loading-" + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.classList.add('message', 'received');
    div.innerHTML = `
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    // We add a tiny CSS style dynamically for the dots
    if (!document.getElementById('typing-style')) {
      const style = document.createElement('style');
      style.id = 'typing-style';
      style.innerHTML = `
        .typing-indicator span {
          display: inline-block; width: 6px; height: 6px; 
          background: #555; border-radius: 50%; 
          animation: type 1s infinite; margin: 0 2px;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes type { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `;
      document.head.appendChild(style);
    }
    
    UI.messages.appendChild(div);
    scrollToBottom();
    return id;
  }

  function removeLoadingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    UI.messages.scrollTop = UI.messages.scrollHeight;
  }
}

/* ==========================================================================================
   SECTION 8: NETWORK LAYER (API CALLS)
   Handles the raw communication with Google's Servers
   ========================================================================================== */

async function callGeminiAPI(contentsPayload) {
  const url = `${CONFIG.API_URL}?key=${CONFIG.API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: contentsPayload
    })
  });

  // Specific Error Handling for Rate Limits
  if (response.status === 429) {
    throw new Error("429 Rate Limit Exceeded");
  }

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || `HTTP Error ${response.status}`);
  }

  const data = await response.json();
  
  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("No response content generated");
  }
}

/**
 * END OF SCRIPT
 * ==========================================================================================
 */