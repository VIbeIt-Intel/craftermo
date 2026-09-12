(() => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    const veil = document.createElement("button");
    veil.type = "button";
    veil.className = "nav-veil";
    veil.setAttribute("aria-label", "Close menu");
    document.body.appendChild(veil);

    const setNav = (open) => {
      links.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => {
      setNav(!links.classList.contains("open"));
    });
    veil.addEventListener("click", () => setNav(false));

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setNav(false));
    });
  }

  const slides = [...document.querySelectorAll(".hero-slides img")];
  const dotsWrap = document.querySelector(".hero-dots");
  if (slides.length > 1 && dotsWrap) {
    let index = 0;
    let timer;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const loadSlide = (el) => {
      if (el && el.dataset.src) {
        el.src = el.dataset.src;
        el.removeAttribute("data-src");
      }
    };

    const show = (next) => {
      slides[index].classList.remove("is-active");
      dotsWrap.children[index]?.classList.remove("is-active");
      index = (next + slides.length) % slides.length;
      loadSlide(slides[index]);
      loadSlide(slides[(index + 1) % slides.length]);
      slides[index].classList.add("is-active");
      dotsWrap.children[index]?.classList.add("is-active");
    };

    const prefetchNext = () => loadSlide(slides[1]);
    if (document.readyState === "complete") prefetchNext();
    else window.addEventListener("load", prefetchNext, { once: true });

    slides.forEach((img, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Show photo ${i + 1}`);
      if (i === 0) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        show(i);
        if (timer) {
          clearInterval(timer);
          if (!reduced) timer = setInterval(() => show(index + 1), 6500);
        }
      });
      dotsWrap.appendChild(btn);
    });

    if (!reduced) {
      timer = setInterval(() => show(index + 1), 6500);
    }
  }

  const galleryPieces = [...document.querySelectorAll(".gallery .piece")];
  if (galleryPieces.length) {
    const items = galleryPieces.map((piece) => {
      const img = piece.querySelector("img");
      return {
        piece,
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt") || "",
        title: piece.querySelector("h3")?.textContent || "",
        note: piece.querySelector(".piece-meta p")?.textContent || ""
      };
    });

    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photograph");
    box.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close photograph">Close</button>
      <button class="lightbox-prev" type="button" aria-label="Previous photograph">&lsaquo;</button>
      <figure>
        <img alt="" />
        <figcaption>
          <strong></strong>
          <span></span>
        </figcaption>
      </figure>
      <button class="lightbox-next" type="button" aria-label="Next photograph">&rsaquo;</button>
    `;
    document.body.appendChild(box);

    const big = box.querySelector("img");
    const titleEl = box.querySelector("strong");
    const noteEl = box.querySelector("span");
    let current = 0;

    const show = (i) => {
      current = (i + items.length) % items.length;
      const item = items[current];
      big.src = item.src;
      big.alt = item.alt;
      titleEl.textContent = item.title;
      noteEl.textContent = item.note;
    };

    const open = (i) => {
      show(i);
      links?.classList.remove("open");
      document.body.classList.remove("nav-open");
      toggle?.setAttribute("aria-expanded", "false");
      box.classList.add("is-open");
      document.documentElement.classList.add("lightbox-open");
      document.body.classList.add("lightbox-open");
      box.querySelector(".lightbox-close").focus();
    };

    const close = () => {
      box.classList.remove("is-open");
      document.documentElement.classList.remove("lightbox-open");
      document.body.classList.remove("lightbox-open");
      items[current]?.piece.focus();
    };

    items.forEach((item, i) => {
      item.piece.setAttribute("role", "button");
      item.piece.tabIndex = 0;
      item.piece.setAttribute("aria-label", `View ${item.title}`);
      item.piece.addEventListener("click", () => open(i));
      item.piece.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(i);
        }
      });
    });

    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.querySelector(".lightbox-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      show(current - 1);
    });
    box.querySelector(".lightbox-next").addEventListener("click", (e) => {
      e.stopPropagation();
      show(current + 1);
    });
    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((el) => io.observe(el));
})();
