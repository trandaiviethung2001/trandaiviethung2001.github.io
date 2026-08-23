const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rootElement = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
let canvasRgb = getComputedStyle(rootElement).getPropertyValue("--canvas-rgb").trim() || "100, 244, 220";

const syncThemeInterface = () => {
  const isLight = rootElement.dataset.theme === "light";
  themeToggle?.setAttribute("aria-pressed", String(isLight));
  themeToggle?.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
  themeToggle?.setAttribute("title", `${isLight ? "Dark" : "Light"} mode`);
  themeColorMeta?.setAttribute("content", isLight ? "#f3f5ea" : "#080c18");
  canvasRgb = getComputedStyle(rootElement).getPropertyValue("--canvas-rgb").trim() || "100, 244, 220";
};

themeToggle?.addEventListener("click", () => {
  rootElement.dataset.theme = rootElement.dataset.theme === "light" ? "dark" : "light";
  try {
    localStorage.setItem("portfolio-theme", rootElement.dataset.theme);
  } catch {
    // The selected theme still works for this page view when storage is unavailable.
  }
  syncThemeInterface();
});

syncThemeInterface();

// Short intro — enough to set the theme without getting between the visitor and the work.
const loader = document.querySelector(".loader");
window.addEventListener("load", () => {
  window.setTimeout(() => loader?.classList.add("is-hidden"), reducedMotion ? 0 : 850);
});

// Navigation behavior.
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];

const closeNavigation = () => {
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open navigation");
  navLinks?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
};

navToggle?.addEventListener("click", () => {
  const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(willOpen));
  navToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
  navLinks?.classList.toggle("is-open", willOpen);
  document.body.classList.toggle("nav-open", willOpen);
});

navAnchors.forEach((link) => link.addEventListener("click", closeNavigation));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

const updateNavigation = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  const marker = window.scrollY + window.innerHeight * 0.38;
  let activeSection = "";
  sections.forEach((section) => {
    if (marker >= section.offsetTop) activeSection = section.id;
  });
  navAnchors.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection}`);
  });
};

window.addEventListener("scroll", updateNavigation, { passive: true });
updateNavigation();

// Staggered entrance animations.
const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.13 }
  );
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(item);
  });
}

// Rotating hero statement.
const typedElement = document.querySelector(".typed-text");
const phrases = [
  "systems that can see.",
  "models that can learn.",
  "AI that solves problems.",
];
let phraseIndex = 0;
let characterIndex = phrases[0].length;
let deleting = true;

function typeNext() {
  if (!typedElement || reducedMotion) return;
  const phrase = phrases[phraseIndex];
  characterIndex += deleting ? -1 : 1;
  typedElement.textContent = phrase.slice(0, characterIndex);

  let delay = deleting ? 32 : 58;
  if (deleting && characterIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 300;
  } else if (!deleting && characterIndex === phrases[phraseIndex].length) {
    deleting = true;
    delay = 1700;
  }
  window.setTimeout(typeNext, delay);
}

if (!reducedMotion) window.setTimeout(typeNext, 2300);

// Count up compact profile metrics.
const countItems = document.querySelectorAll("[data-count]");
const runCounter = (element) => {
  const target = Number(element.dataset.count);
  const started = performance.now();
  const duration = 900;
  const tick = (now) => {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased)).padStart(2, "0");
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

if (reducedMotion || !("IntersectionObserver" in window)) {
  countItems.forEach((item) => (item.textContent = String(item.dataset.count).padStart(2, "0")));
} else {
  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.8 }
  );
  countItems.forEach((item) => countObserver.observe(item));
}

// Light perspective response on project cards for mouse/trackpad users.
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (canHover && !reducedMotion) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 2.4}deg) rotateY(${x * 2.4}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
    });
  });
}

// Ambient neural-node canvas. It stays intentionally quiet behind the content.
const canvas = document.querySelector("#neural-canvas");
const context = canvas?.getContext("2d");
let nodes = [];
let animationFrame;

function resizeCanvas() {
  if (!canvas || !context) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(50, Math.max(18, Math.floor(window.innerWidth / 30)));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    size: Math.random() > 0.85 ? 2.2 : 1.2,
  }));
}

function drawNetwork() {
  if (!canvas || !context) return;
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
    if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;

    context.fillStyle = `rgba(${canvasRgb}, 0.48)`;
    context.fillRect(node.x, node.y, node.size, node.size);

    for (let j = i + 1; j < nodes.length; j += 1) {
      const other = nodes[j];
      const distance = Math.hypot(node.x - other.x, node.y - other.y);
      if (distance >= 135) continue;
      context.strokeStyle = `rgba(${canvasRgb}, ${(1 - distance / 135) * 0.1})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(node.x, node.y);
      context.lineTo(other.x, other.y);
      context.stroke();
    }
  }
  animationFrame = requestAnimationFrame(drawNetwork);
}

if (canvas && context) {
  resizeCanvas();
  if (!reducedMotion) drawNetwork();
  else {
    drawNetwork();
    cancelAnimationFrame(animationFrame);
  }
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 150);
  });
}

document.querySelector("#year").textContent = new Date().getFullYear();
