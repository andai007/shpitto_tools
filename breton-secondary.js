(function () {
  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("mainMenu");
  const talkToggle = document.getElementById("talkToggle");
  const mobileTalk = document.getElementById("mobileTalk");
  const contactDrawer = document.getElementById("contactDrawer");
  const contactBackdrop = document.getElementById("contactBackdrop");
  const contactClose = document.getElementById("contactClose");

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    closeContact();
    if (!menu || !menuToggle) return;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  }

  function closeContact() {
    if (!contactDrawer || !contactBackdrop) return;
    contactDrawer.classList.remove("is-open");
    contactBackdrop.classList.remove("is-open");
    contactDrawer.setAttribute("aria-hidden", "true");
    contactBackdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  function openContact() {
    closeMenu();
    if (!contactDrawer || !contactBackdrop) return;
    contactDrawer.classList.add("is-open");
    contactBackdrop.classList.add("is-open");
    contactDrawer.setAttribute("aria-hidden", "false");
    contactBackdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }

  [talkToggle, mobileTalk].forEach(function (trigger) {
    if (!trigger) return;
    trigger.addEventListener("click", function () {
      if (contactDrawer && contactDrawer.classList.contains("is-open")) closeContact();
      else openContact();
    });
  });

  if (contactClose) contactClose.addEventListener("click", closeContact);
  if (contactBackdrop) contactBackdrop.addEventListener("click", closeContact);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
      closeContact();
    }
  });

  if (menu) {
    menu.addEventListener("click", function (event) {
      if (event.target === menu) closeMenu();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const page = document.body.getAttribute("data-page") || "";
  document.querySelectorAll("[data-nav]").forEach(function (el) {
    if (el.getAttribute("data-nav") === page) el.classList.add("is-active");
  });

  const footer = document.querySelector(".site-footer");
  if (footer && !document.querySelector(".utility-links-wrap")) {
    const wrap = document.createElement("div");
    wrap.className = "utility-links-wrap";
    wrap.innerHTML =
      '<div class="container">' +
      '<div class="utility-links">' +
      '<a href="./breton-services.html">Customer Service</a>' +
      '<a href="./breton-contacts.html">Contacts</a>' +
      '<a href="./breton-about.html">Terms</a>' +
      "</div>" +
      "</div>";
    footer.parentNode.insertBefore(wrap, footer);
  }

  let chatBtn = document.getElementById("chatUs");
  if (!chatBtn) {
    chatBtn = document.createElement("button");
    chatBtn.id = "chatUs";
    chatBtn.className = "chat-us";
    chatBtn.type = "button";
    chatBtn.textContent = "Chat with us";
    document.body.appendChild(chatBtn);
  }
  chatBtn.addEventListener("click", openContact);
})();
