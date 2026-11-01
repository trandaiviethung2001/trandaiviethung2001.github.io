// ==========================================================================
// DAI VIET HUNG TRAN — CORE CLIENT LOGIC
// Minimalist, robust, zero external dependencies.
// Handles theme toggle, mobile navigation, Calendly modal, and seamless SPA page transitions.
// ==========================================================================

const rootElement = document.documentElement;

// 1. Theme Management
function initTheme() {
  const themeToggle = document.querySelector(".theme-toggle");

  const syncTheme = () => {
    const isLight = rootElement.dataset.theme === "light";
    themeToggle?.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
    themeToggle?.setAttribute("title", `Switch to ${isLight ? "dark" : "light"} mode`);
  };

  themeToggle?.addEventListener("click", () => {
    rootElement.dataset.theme = rootElement.dataset.theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("portfolio-theme", rootElement.dataset.theme);
    } catch (e) {
      // Storage unavailable or disabled
    }
    syncTheme();
  });

  syncTheme();
}

// 2. Mobile Navigation
function initMobileNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle?.addEventListener("click", () => {
    const open = navLinks?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

// 3. Navigation Active State Synchronizer
function syncNavActive(urlPath) {
  const currentFile = (urlPath || window.location.pathname)
    .split("/")
    .pop()
    .split("?")[0]
    .split("#")[0] || "index.html";

  const activeTarget = (currentFile === "" || currentFile === "/") ? "index.html" : currentFile;

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href")?.split("?")[0].split("#")[0];
    const isCurrent = href === activeTarget;
    link.classList.toggle("is-active", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// 4. Calendly Triggers
function initCalendly() {
  document.querySelectorAll("[data-calendly-open]").forEach((link) => {
    link.removeEventListener("click", handleCalendlyClick);
    link.addEventListener("click", handleCalendlyClick);
  });
}

function handleCalendlyClick(event) {
  if (!window.Calendly?.initPopupWidget) return;
  event.preventDefault();
  window.Calendly.initPopupWidget({ url: this.href });
}

// 5. Footer Year
function initFooterYear() {
  const yearElement = document.querySelector("#year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// 6. Page Mount Lifecycle Hook
function onPageMounted() {
  initCalendly();
  initFooterYear();

  // If entering gallery page, mount gallery engine
  if (document.querySelector("#gallery-grid")) {
    window.initGallery?.();
  }
}

// 7. Seamless SPA Page Transition (Soft Navigation)
async function navigateTo(targetUrl, pushState = true) {
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const htmlText = await res.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(htmlText, "text/html");

    const newMain = newDoc.querySelector("#main-content");
    const currentMain = document.querySelector("#main-content");

    if (!newMain || !currentMain) {
      window.location.href = targetUrl;
      return;
    }

    // Update document title
    if (newDoc.title) {
      document.title = newDoc.title;
    }

    // Instant swap (zero animation as requested)
    currentMain.innerHTML = newMain.innerHTML;

    // Sync active nav item
    syncNavActive(targetUrl);

    // Close mobile drawer
    const navLinks = document.querySelector(".nav-links");
    const navToggle = document.querySelector(".nav-toggle");
    navLinks?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Update History state
    if (pushState) {
      window.history.pushState({ path: targetUrl }, "", targetUrl);
    }

    // Run page mounted hooks
    onPageMounted();
  } catch (err) {
    // Graceful fallback for file:// or offline network errors
    window.location.href = targetUrl;
  }
}

// Link Click Interceptor
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  // Skip external links, new tabs, anchors, tel/mailto, or keyboard modifier clicks
  if (
    link.target === "_blank" ||
    link.hasAttribute("download") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.endsWith(".pdf") ||
    e.ctrlKey ||
    e.metaKey ||
    e.shiftKey ||
    e.altKey
  ) {
    return;
  }

  // Intercept internal HTML pages
  const validPages = [
    "index.html",
    "experience.html",
    "projects.html",
    "gallery.html",
    "contact.html",
    ""
  ];

  const targetFile = href.split("?")[0].split("#")[0];
  if (validPages.includes(targetFile)) {
    e.preventDefault();
    navigateTo(href, true);
  }
});

// Browser History Back / Forward Handler
window.addEventListener("popstate", () => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  navigateTo(currentPath, false);
});

// Initial Bootstrap
initTheme();
initMobileNav();
syncNavActive();
onPageMounted();
