/* Sarah's Portfolio Assistant — frontend only; no secret keys belong here. */
(function () {
  "use strict";

  // After deploying chatbot-worker, replace this with its public HTTPS URL.
  // Example: https://sarah-portfolio-chatbot.your-subdomain.workers.dev
  var CHATBOT_API_URL = "https://sarah-portfolio-chatbot.sarahammadai.workers.dev";

  var suggestions = [
    "What projects has Sarah built?",
    "What technologies does Sarah use?",
    "Tell me about her AI capstone",
    "How can I contact Sarah?"
  ];

  var messages = [];
  var isBusy = false;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function init() {
    if (document.getElementById("sa-chat-launcher")) return;

    var launcher = el("button", "sa-chat-launcher", "✦");
    launcher.id = "sa-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Sarah's AI portfolio assistant");
    launcher.setAttribute("aria-expanded", "false");

    var panel = el("section", "sa-chat-panel");
    panel.id = "sa-chat-panel";
    panel.setAttribute("aria-label", "Sarah's AI portfolio assistant");
    panel.setAttribute("aria-hidden", "true");

    var header = el("header", "sa-chat-header");
    var avatar = el("div", "sa-chat-avatar", "✧");
    avatar.setAttribute("aria-hidden", "true");
    var identity = el("div", "sa-chat-identity");
    identity.appendChild(el("strong", "", "Sarah's AI Assistant"));
    identity.appendChild(el("span", "sa-chat-status", "Portfolio guide · AI-powered"));
    var close = el("button", "sa-chat-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close chat");
    header.append(avatar, identity, close);

    var transcript = el("div", "sa-chat-transcript");
    transcript.id = "sa-chat-transcript";
    transcript.setAttribute("role", "log");
    transcript.setAttribute("aria-live", "polite");
    transcript.setAttribute("aria-relevant", "additions");

    var composer = el("form", "sa-chat-composer");
    var input = el("textarea", "sa-chat-input");
    input.rows = 1;
    input.maxLength = 1200;
    input.placeholder = "Ask about Sarah's work…";
    input.setAttribute("aria-label", "Your message");
    input.required = true;
    var send = el("button", "sa-chat-send", "↑");
    send.type = "submit";
    send.setAttribute("aria-label", "Send message");
    composer.append(input, send);

    var foot = el("div", "sa-chat-foot", "AI-generated answers can be inaccurate. Please verify important details.");
    panel.append(header, transcript, composer, foot);
    document.body.append(launcher, panel);

    function openChat() {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      launcher.setAttribute("aria-expanded", "true");
      launcher.classList.add("is-open");
      launcher.textContent = "×";
      if (!transcript.childElementCount) showWelcome();
      window.setTimeout(function () { input.focus(); }, 80);
    }

    function closeChat() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      launcher.setAttribute("aria-expanded", "false");
      launcher.classList.remove("is-open");
      launcher.textContent = "✦";
    }

    function showWelcome() {
      var welcome = el("div", "sa-chat-welcome");
      welcome.appendChild(el("div", "sa-chat-sparkle", "✧"));
      welcome.appendChild(el("strong", "", "Hi there! 💗"));
      welcome.appendChild(el("p", "", "I'm Sarah's portfolio assistant. Ask me about her projects, skills, studies, or how to get in touch."));
      var chips = el("div", "sa-chat-suggestions");
      suggestions.forEach(function (question) {
        var chip = el("button", "sa-chat-chip", question);
        chip.type = "button";
        chip.addEventListener("click", function () { submitMessage(question); });
        chips.appendChild(chip);
      });
      welcome.appendChild(chips);
      transcript.appendChild(welcome);
    }

    function addMessage(role, text) {
      var wrap = el("div", "sa-chat-message " + (role === "assistant" ? "is-assistant" : "is-user"));
      var bubble = el("div", "sa-chat-bubble");
      bubble.textContent = text;
      wrap.appendChild(bubble);
      transcript.appendChild(wrap);
      transcript.scrollTop = transcript.scrollHeight;
      return wrap;
    }

    function setBusy(value) {
      isBusy = value;
      send.disabled = value;
      input.disabled = value;
      send.textContent = value ? "…" : "↑";
      composer.classList.toggle("is-busy", value);
    }

    async function submitMessage(text) {
      var message = String(text || input.value).trim();
      if (!message || isBusy) return;
      if (message.length > 1200) message = message.slice(0, 1200);

      var welcome = transcript.querySelector(".sa-chat-welcome");
      if (welcome) welcome.remove();

      addMessage("user", message);
      messages.push({ role: "user", content: message });
      if (messages.length > 12) messages = messages.slice(-12);
      input.value = "";
      input.style.height = "auto";
      setBusy(true);
      var typing = addMessage("assistant", "Thinking…");
      typing.classList.add("is-typing");

      try {
        if (CHATBOT_API_URL.indexOf("YOUR-SUBDOMAIN") !== -1) {
          throw new Error("SETUP_REQUIRED");
        }
        var response = await fetch(CHATBOT_API_URL.replace(/\/$/, "") + "/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messages })
        });
        var payload = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          if (response.status === 429) throw new Error("RATE_LIMIT");
          throw new Error(payload.error || "REQUEST_FAILED");
        }
        if (!payload.reply || typeof payload.reply !== "string") throw new Error("EMPTY_REPLY");
        typing.remove();
        addMessage("assistant", payload.reply);
        messages.push({ role: "assistant", content: payload.reply });
        if (messages.length > 12) messages = messages.slice(-12);
      } catch (error) {
        typing.remove();
        var friendly = "Sorry, I couldn't connect just now. Please try again in a moment.";
        if (error.message === "SETUP_REQUIRED") friendly = "I'm almost ready! The secure AI backend still needs to be deployed and connected. Please check the setup guide in the website's GitHub repository.";
        else if (error.message === "RATE_LIMIT") friendly = "You've sent several messages quite quickly. Please wait a little and try again.";
        addMessage("assistant", friendly);
      } finally {
        setBusy(false);
        input.focus();
      }
    }

    launcher.addEventListener("click", function () {
      if (panel.classList.contains("is-open")) closeChat();
      else openChat();
    });
    close.addEventListener("click", closeChat);
    composer.addEventListener("submit", function (event) {
      event.preventDefault();
      submitMessage(input.value);
    });
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        composer.requestSubmit();
      }
      if (event.key === "Escape") closeChat();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) closeChat();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();