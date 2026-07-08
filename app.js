/* Sats On The Road — interactive bits */

// 1) Reveal on scroll
const revealEls = document.querySelectorAll(
  ".section-head, .card, .bignum, .story, .partner, .hero__photo, .journey__map, .journey__legs, .cta__inner > *"
);
revealEls.forEach((el) => el.setAttribute("data-reveal", ""));

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  // Failsafe: never leave content hidden. Reveal anything at/above the
  // viewport bottom (covers jump-nav to anchors, reload mid-page, fast scroll).
  const failsafe = () => {
    const vh = window.innerHeight;
    revealEls.forEach((el) => {
      if (el.classList.contains("in")) return;
      const top = el.getBoundingClientRect().top;
      if (top < vh) {
        el.classList.add("in");
        io.unobserve(el);
      }
    });
  };
  window.addEventListener("load", failsafe);
  window.addEventListener("hashchange", () => setTimeout(failsafe, 60));
  document.addEventListener("click", (e) => {
    if (e.target.closest('a[href^="#"]')) setTimeout(failsafe, 60);
  });
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// 2) Count up the hero stats
function countUp(el, target, dur = 1400) {
  const start = performance.now();
  const fmt = new Intl.NumberFormat("en-US");
  function tick(t) {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = Math.round(target * eased);
    el.textContent = fmt.format(v);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const numEls = document.querySelectorAll(".num[data-count]");
if ("IntersectionObserver" in window && numEls.length) {
  const io2 = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const n = parseInt(e.target.dataset.count, 10);
          if (!isNaN(n)) countUp(e.target, n);
          io2.unobserve(e.target);
        }
      }
    },
    { threshold: 0.4 }
  );
  numEls.forEach((el) => io2.observe(el));
}

// 3) Decorative QR noise — scatter little squares so the QR feels alive
(function decorQR() {
  const g = document.getElementById("qrnoise");
  if (!g) return;
  const cells = [];
  // 21x21 grid, skip the three finder zones
  const finders = [
    [0, 0],
    [13, 0],
    [0, 13],
  ];
  function inFinder(x, y) {
    return finders.some(([fx, fy]) => x >= fx && x < fx + 8 && y >= fy && y < fy + 8);
  }
  // Deterministic-ish pattern (mulberry32)
  let s = 0x9e3779b9;
  function rnd() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.55) {
        const px = 4 + x * 4.2;
        const py = 4 + y * 4.2;
        cells.push(`<rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="3.4" height="3.4"/>`);
      }
    }
  }
  g.innerHTML = cells.join("");
})();

// 4) Copy buttons
document.querySelectorAll(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      ta.remove();
    }
    const original = btn.textContent;
    btn.textContent = "Copied ✓";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1500);
  });
});

// 5) Gallery lightbox
(function galleryLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const imgs = [...document.querySelectorAll(".gallery__wall .g-item img")];
  if (!imgs.length) return;
  const lbImg = lb.querySelector(".lightbox__img");
  const btnClose = lb.querySelector(".lightbox__close");
  const btnPrev = lb.querySelector(".lightbox__nav--prev");
  const btnNext = lb.querySelector(".lightbox__nav--next");
  let idx = 0;

  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].src;
    lbImg.alt = imgs[idx].alt || "";
  }
  function open(i) {
    show(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  imgs.forEach((im, i) => im.addEventListener("click", () => open(i)));
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
  btnNext.addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
  });
})();

// 6) Contact form → Formspree (async, stays on page)
(function contactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const btn = form.querySelector(".contact__submit");
  const note = form.querySelector(".contact__note");
  const btnText = btn.textContent;
  const noteText = note.textContent;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Sending…";
    note.textContent = "";
    note.classList.remove("contact__note--ok", "contact__note--err");

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        btn.textContent = "Message sent ✓";
        note.textContent = "Thanks — we'll be in touch soon.";
        note.classList.add("contact__note--ok");
        setTimeout(() => {
          btn.textContent = btnText;
          btn.disabled = false;
          note.textContent = noteText;
          note.classList.remove("contact__note--ok");
        }, 5000);
      } else {
        throw new Error("bad response");
      }
    } catch (err) {
      btn.textContent = btnText;
      btn.disabled = false;
      note.textContent = "Something went wrong — email us at bitkwaofficial@gmail.com.";
      note.classList.add("contact__note--err");
    }
  });
})();

/* Floating soundtrack player — expand / minimise, remembers the visitor's choice.
   Note: browsers block audio autoplay, and Audiomack's embed is cross-origin,
   so the visitor starts playback with the play button inside the player. */
(function soundbar() {
  const bar = document.getElementById("soundbar");
  if (!bar) return;
  const pill = document.getElementById("soundbarPill");
  const min = document.getElementById("soundbarMin");
  const KEY = "sotr-soundbar";

  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "min" || saved === "open") {
      bar.dataset.state = saved;
    } else if (window.matchMedia("(max-width: 560px)").matches) {
      bar.dataset.state = "min"; // start collapsed on phones, expanded on desktop
    }
  } catch (e) {}

  function setState(state) {
    bar.dataset.state = state;
    pill.setAttribute("aria-expanded", state === "open" ? "true" : "false");
    try { localStorage.setItem(KEY, state); } catch (e) {}
  }

  pill.addEventListener("click", () => setState("open"));
  min.addEventListener("click", () => setState("min"));
})();
