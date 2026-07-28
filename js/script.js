const SERVER_IP = "play.infernium.org";

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  setupMenu();
  setupCopyButtons();
  setupReveal();
  updateYear();
  loadServerStatus();
});

function setActiveNav() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });
}

function setupMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(nav.classList.contains("open")));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));
}

function setupCopyButtons() {
  document.querySelectorAll("[data-copy-ip]").forEach(button => {
    button.addEventListener("click", async () => {
      const target = button.dataset.messageTarget || "#copy-message";
      const message = document.querySelector(target);
      try {
        await navigator.clipboard.writeText(SERVER_IP);
        button.textContent = "Copied!";
        if (message) message.textContent = `IP copied: ${SERVER_IP}`;
      } catch {
        if (message) message.textContent = `Copy this IP: ${SERVER_IP}`;
      }
      setTimeout(() => {
        button.textContent = "Copy IP";
        if (message) message.textContent = "";
      }, 2200);
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(item => observer.observe(item));
}

function updateYear() {
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
}

async function loadServerStatus() {
  const status = document.querySelectorAll("[data-server-status]");
  const players = document.querySelectorAll("[data-player-count]");
  const versions = document.querySelectorAll("[data-server-version]");
  const dots = document.querySelectorAll("[data-status-dot]");

  if (!status.length && !players.length && !versions.length) return;

  try {
    const response = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    if (!data.online) throw new Error("Offline");

    status.forEach(el => el.textContent = "Online");
    players.forEach(el => el.textContent = `${data.players?.online ?? 0} / ${data.players?.max ?? 150}`);
    versions.forEach(el => el.textContent = data.version || "1.21.11");
    dots.forEach(el => { el.classList.remove("offline"); el.classList.add("online"); });
  } catch {
    status.forEach(el => el.textContent = "Offline / unavailable");
    players.forEach(el => el.textContent = "0 / 150");
    versions.forEach(el => el.textContent = "1.21.11");
    dots.forEach(el => { el.classList.remove("online"); el.classList.add("offline"); });
  }
}