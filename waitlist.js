// SOTR waitlist form (Stories/Join page). Posts signups to a Google Apps Script
// Web App that appends them to a Google Sheet. Loaded only on /join.
(function waitlist() {
  var form = document.getElementById("waitlistForm");
  if (!form) return;

  // ── Set this to your deployed Apps Script Web App URL (ends in /exec) ──
  var WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycbyXAwhmXX9KF0Tqz972JmjLJSxTqgDwYVKW5RmAu8wfa355Fl8BfAE04z70hF9gtd9ocg/exec";
  var QUEUE_KEY = "sotr-waitlist-queue";

  var fr = function () { return document.documentElement.lang === "fr"; };
  var S = function (en, frTxt) { return fr() ? frTxt : en; };

  var roleInput = document.getElementById("wl-role");
  var roleBtns = form.parentElement.querySelectorAll(".join__role");
  var merchantFields = form.querySelectorAll(".field--merchant");
  var doneBox = document.getElementById("waitlistDone");
  var submitBtn = form.querySelector(".join__submit");

  function setRole(role) {
    roleInput.value = role;
    roleBtns.forEach(function (b) {
      var on = b.dataset.role === role;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    merchantFields.forEach(function (f) { f.hidden = role !== "merchant"; });
  }
  roleBtns.forEach(function (b) {
    b.addEventListener("click", function () { setRole(b.dataset.role); });
  });
  setRole("merchant");

  function endpointReady() {
    return WAITLIST_ENDPOINT && WAITLIST_ENDPOINT.indexOf("REPLACE_") === -1;
  }

  function send(payload) {
    return fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      mode: "no-cors", // Apps Script sends no CORS headers; response is opaque (fine, we don't read it)
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }

  function queue(payload) {
    try {
      var q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      q.push(payload);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (e) {}
  }
  function flushQueue() {
    if (!endpointReady()) return;
    var q;
    try { q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch (e) { return; }
    if (!q.length) return;
    localStorage.removeItem(QUEUE_KEY);
    q.forEach(function (p) { send(p).catch(function () { queue(p); }); });
  }
  window.addEventListener("online", flushQueue);
  flushQueue();

  function showDone(payload) {
    form.hidden = true;
    if (doneBox) {
      doneBox.hidden = false;
      var msg = S(
        "I just joined the Sats On The Road waitlist ⚡ Bitcoin payments coming to Africa — join me:",
        "Je viens de rejoindre la liste d'attente Sats On The Road ⚡ Les paiements Bitcoin arrivent en Afrique — rejoignez-moi :"
      );
      var url = "https://satsontheroad.africa/join";
      var x = document.getElementById("wlShareX");
      var wa = document.getElementById("wlShareWa");
      if (x) x.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(msg) + "&url=" + encodeURIComponent(url);
      if (wa) wa.href = "https://wa.me/?text=" + encodeURIComponent(msg + " " + url);
      doneBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot — silently succeed, store nothing.
    if (form.website && form.website.value) { showDone({}); return; }

    var role = roleInput.value;
    var required = [form.name, form.country, form.city, form.phone];
    for (var i = 0; i < required.length; i++) {
      if (required[i] && !required[i].value.trim()) {
        required[i].focus();
        required[i].reportValidity && required[i].reportValidity();
        return;
      }
    }

    var params = new URLSearchParams(location.search);
    var payload = {
      role: role,
      name: form.name.value.trim(),
      business: role === "merchant" && form.business ? form.business.value.trim() : "",
      category: role === "merchant" && form.category ? form.category.value : "",
      country: form.country.value,
      city: form.city.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      source: params.get("src") || "website",
      city_ref: params.get("city") || "",
      website: "", // honeypot (empty for real users)
    };

    submitBtn.disabled = true;
    submitBtn.textContent = S("Joining…", "Envoi…");

    if (!endpointReady()) {
      // Endpoint not configured yet: queue and confirm so nothing is lost.
      queue(payload);
      showDone(payload);
      return;
    }

    send(payload)
      .then(function () { showDone(payload); })
      .catch(function () { queue(payload); showDone(payload); }); // offline: saved, retried later
  });
})();
