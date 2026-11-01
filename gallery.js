// Visual Gallery Engine
// Handles dynamic JSON exhibit loading, search filtering, and lightbox modal viewer.

const FALLBACK_GALLERY = [
  {
    file: "prof-hang.jpg",
    name: "Visited Gyeongbokgung with Professors after ICIT 2026 Conference in Seoul"
  },
  {
    file: "ambassy-visit.jpg",
    name: "Visited Vietnamese Ambassy in Seoul, South Korea with PSHH lab & HUMG Professors"
  },
  {
    file: "pshh-welcome.jpg",
    name: "Welcome Professor Hong Anh (HUMG) to vist Sejong University"
  },
  {
    file: "un-visit.jpg",
    name: "United Nations Conference Centre in Bangkok, Thailand"
  },
  {
    file: "un-card.jpg",
    name: "CICTSTI Conference in Bangkok, Thailand"
  },
  {
    file: "iaaa-2026.jpg",
    name: "Visited IAAA 2026 Conference in Ho Chi Minh City, Vietnam"
  },
  {
    file: "graduate.jpg",
    name: "Achieved Bachelor's degree of Computer Science in Sejong University, August 2026"
  },
  {
    file: "capstone.jpg",
    name: "Presented final product at Capstone Design 2025 in Sejong University"
  }
];

function cleanGalleryTitle(filename) {
  const base = filename.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeGalleryItem(item) {
  if (typeof item === "string") {
    return {
      file: item,
      name: cleanGalleryTitle(item),
      src: `assets/gallery/${item}`
    };
  }
  return {
    file: item.file,
    name: item.name || cleanGalleryTitle(item.file),
    src: item.src || `assets/gallery/${item.file}`
  };
}

let galleryData = [];
let visibleItems = [];
let currentModalIndex = 0;

window.initGallery = async function () {
  const galleryGrid = document.querySelector("#gallery-grid");
  if (!galleryGrid) return;

  const searchInput = document.querySelector("#gallery-search");
  const countNumber = document.querySelector("#count-number");

  const modal = document.querySelector("#gallery-modal");
  const modalImage = document.querySelector("#modal-image");
  const modalTitle = document.querySelector("#modal-title");
  const modalClose = document.querySelector("#modal-close");
  const modalPrev = document.querySelector("#modal-prev");
  const modalNext = document.querySelector("#modal-next");

  function renderGallery(items) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = "";
    visibleItems = items;

    if (countNumber) countNumber.textContent = items.length;

    if (items.length === 0) {
      galleryGrid.innerHTML = `
        <div class="gallery-empty">
          <p>No exhibits found matching your search.</p>
        </div>
      `;
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "gallery-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View ${item.name}`);

      card.innerHTML = `
        <img class="gallery-card-thumb" src="${item.src}" alt="${item.name}" loading="lazy" />
        <div class="gallery-card-body">
          <h3 class="gallery-card-title">${item.name}</h3>
        </div>
      `;

      card.addEventListener("click", () => openModal(index));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(index);
        }
      });

      galleryGrid.appendChild(card);
    });
  }

  function openModal(index) {
    if (!visibleItems.length || !modal) return;
    currentModalIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[currentModalIndex];

    if (modalImage) {
      modalImage.src = item.src;
      modalImage.alt = item.name;
    }
    if (modalTitle) modalTitle.textContent = item.name;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  modalClose?.addEventListener("click", closeModal);
  modalPrev?.addEventListener("click", () => openModal(currentModalIndex - 1));
  modalNext?.addEventListener("click", () => openModal(currentModalIndex + 1));

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const handleKeydown = (e) => {
    if (!modal?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowLeft") openModal(currentModalIndex - 1);
    else if (e.key === "ArrowRight") openModal(currentModalIndex + 1);
  };

  document.removeEventListener("keydown", window._galleryKeydownHandler);
  window._galleryKeydownHandler = handleKeydown;
  document.addEventListener("keydown", handleKeydown);

  // Search Filter
  searchInput?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderGallery(galleryData);
    } else {
      const filtered = galleryData.filter(
        (item) => item.name.toLowerCase().includes(query) || item.file.toLowerCase().includes(query)
      );
      renderGallery(filtered);
    }
  });

  // Load Data
  try {
    const res = await fetch("assets/gallery/gallery.json");
    if (!res.ok) throw new Error("Fetch failed");
    const json = await res.json();
    galleryData = json.map(normalizeGalleryItem);
  } catch (err) {
    galleryData = FALLBACK_GALLERY.map(normalizeGalleryItem);
  }
  renderGallery(galleryData);
};

// Initial auto-mount if page contains #gallery-grid
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#gallery-grid")) window.initGallery();
  });
} else {
  if (document.querySelector("#gallery-grid")) window.initGallery();
}
