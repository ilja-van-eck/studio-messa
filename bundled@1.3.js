gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);
CustomEase.create("primary", "0.62, 0.05, 0.01, 1");
gsap.defaults({ ease: "primary" });
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};
window.addEventListener("resize", appHeight);
appHeight();
window.addEventListener("DOMContentLoaded", (event) => {
  appHeight();
});

let lenis;
if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  $("[data-lenis-start]").on("click", function () {
    lenis.start();
  });
  $("[data-lenis-stop]").on("click", function () {
    lenis.stop();
  });
  $("[data-lenis-toggle]").on("click", function () {
    $(this).toggleClass("stop-scroll");
    if ($(this).hasClass("stop-scroll")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });
}

let loadWrap = document.querySelector(".load-w");
let loadLogo = loadWrap.querySelector(".load-logo");
let navWrap = document.querySelector(".nav-w");
let menuBtn = document.querySelector(".menu-btn");
let isMobile = window.innerWidth < 480;
let pagaCtas = document.querySelectorAll(".overlay-cta");

function runSplit(next) {
  next = next || document;
  lineTargets = next.querySelectorAll("[data-split-lines]");
  var split = new SplitText(lineTargets, {
    linesClass: "line",
    type: "lines",
    clearProps: "all",
  });

  letterTargets = next.querySelectorAll("[data-split-letters]");
  if (letterTargets) {
    var splitLetters = new SplitText(letterTargets, {
      type: "lines, words, chars",
      reduceWhiteSpace: false,
      charsClass: "char",
    });
  }
  // ————— Update on window resize
  let windowWidth = $(window).innerWidth();
  window.addEventListener("resize", function () {
    if (windowWidth !== $(window).innerWidth()) {
      windowWidth = $(window).innerWidth();
      split.revert();
      splitLetters.revert();
      runSplit();
    }
  });
}
runSplit();

function resetWebflow(data) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(data.next.html, "text/html");
  let webflowPageId = dom.querySelector("html").getAttribute("data-wf-page");
  document.documentElement.setAttribute("data-wf-page", webflowPageId);
  window.Webflow.destroy();
  window.Webflow.ready();
  window.Webflow.require("ix2").init();
}
function initNavScroll(next) {
  next = next || document;
  let navTriggerElement = next.querySelector("[data-nav-trigger]");
  let navElement = document.querySelector(".nav-w");
  ScrollTrigger.create({
    trigger: navTriggerElement,
    start: "top top+=6%",
    onEnter: () => navElement.setAttribute("scrolled", "true"),
    onLeaveBack: () => navElement.setAttribute("scrolled", "false"),
  });
}
function initMenu(next) {
  next = next || document;
  let doc = next.parentElement;
  let navElement = doc.querySelector(".nav-w");
  let menuWrapper = doc.querySelector(".menu-w");
  let menuBg = menuWrapper.querySelector(".menu-bg");
  let menuLines = menuWrapper.querySelectorAll(".menu-line");
  let menuItems = menuWrapper.querySelectorAll("[data-menu-fade]");
  let menuVisual = menuWrapper.querySelector(".menu-visual");
  let menuButton = doc.querySelector(".menu-btn");
  let lineTop = doc.querySelector(".menu-btn__line.top");
  let lineMiddle = doc.querySelector(".menu-btn__line.middle");
  let lineBottom = doc.querySelector(".menu-btn__line.bottom");
  let main = doc.querySelector(".main-w");

  let originalScrolledValue = navElement.getAttribute("scrolled");

  let menuTl = gsap.timeline({
    defaults: {
      duration: 0.8,
    },
    reversed: true,
    onStart: () => navElement.setAttribute("scrolled", true),
    onReverseComplete: () => {
      gsap.set(menuWrapper, { display: "none" });
      navElement.setAttribute("scrolled", originalScrolledValue);
    },
  });

  menuTl
    .set(menuWrapper, { display: "block" })
    .to(main, { y: "10vh", opacity: 0.4 })
    .to(lineMiddle, { scaleX: 0 }, 0)
    .to(lineTop, { rotate: 135, y: 5 }, 0)
    .to(lineBottom, { rotate: -135, y: -5 }, 0)
    .fromTo(menuBg, { scaleY: 0 }, { scaleY: 1 }, 0)
    .fromTo(menuLines, { scaleX: 0 }, { scaleX: 1, stagger: 0.1 }, 0.1)
    .fromTo(
      menuItems,
      { yPercent: 50, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, stagger: 0.05 },
      "<",
    )
    .fromTo(menuVisual, { scale: 0 }, { scale: 1 }, 0.2);

  menuButton.addEventListener("click", () => {
    if (menuTl.reversed()) {
      menuTl.timeScale(1).play();
    } else {
      menuTl.timeScale(1.2).reverse();
    }
  });
}
function initCursor(next) {
  next = next || document;
  gsap.set(".cursor", { yPercent: -50 });
  window.addEventListener("mousemove", (e) => {
    gsap.to(".cursor-e", {
      x: e.clientX,
      y: e.clientY,
      ease: "power1.out",
    });
  });

  next.querySelectorAll("[data-project-item]").forEach((item) => {
    let image = item.querySelector("img");
    item.addEventListener("mouseenter", () => {
      gsap.to(".cursor-e", {
        opacity: 1,
        duration: 0.2,
        stagger: { each: 0.01 },
      });
      gsap.to(image, {
        height: "112%",
        duration: 0.5,
      });
    });
    item.addEventListener("mouseleave", () => {
      gsap.to(".cursor-e", {
        opacity: 0,
        duration: 0.2,
        stagger: { each: 0.01 },
      });
      gsap.to(image, {
        height: "110%",
        duration: 0.4,
      });
    });
  });
}
function updateSydneyTime(next) {
  next = next || document;
  let timeEl = next.querySelector("#current-time");
  if (!timeEl) return;
  var sydneyTime = new Date().toLocaleTimeString("en-US", {
    timeZone: "Australia/Sydney",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  if (timeEl) timeEl.innerText = sydneyTime;
}
updateSydneyTime();
setInterval(updateSydneyTime, 1000);

function initFadeOnLoad(next) {
  next = next || document;
  gsap.set(next, { pointerEvents: "none" });
  let items = next.querySelectorAll("[data-fade-item]");
  gsap.fromTo(
    items,
    {
      autoAlpha: 0,
      y: "3rem",
    },
    {
      autoAlpha: 1,
      y: "0rem",
      stagger: 0.03,
      duration: 1,
      onComplete: () => {
        gsap.set(next, { pointerEvents: "auto" });
      },
    },
  );
  let verticalLine = next.querySelector(".contact-line__v");
  let horizontalLine = next.querySelector(".contact-line__h");
  if (verticalLine) {
    gsap.from(horizontalLine, { scaleX: 0, duration: 1, delay: 0.5 });
    gsap.from(verticalLine, { scaleY: 0, duration: 1, delay: 0.5 });
  }
}
function initSlideOnLoad(next) {
  let slide = next.querySelector("[data-slide-up]");
  gsap.fromTo(
    slide,
    { y: "10rem", autoAlpha: 0 },
    { y: "0rem", autoAlpha: 1, duration: 1 },
  );
}
function initLinesOnLoad(next) {
  let fadeLines = next.querySelectorAll(".line");
  gsap.from(fadeLines, {
    yPercent: 100,
    autoAlpha: 0,
    stagger: 0.05,
    duration: 1,
  });
}
function initForms(next) {
  next = next || document;
  let forms = next.querySelectorAll(".form");

  if (forms.length === 0) return;

  forms.forEach((form) => {
    let submit = form.querySelector("[data-form-action]");
    if (submit) {
      let submitAction = submit.nextElementSibling;
      if (submitAction) {
        submit.addEventListener("click", () => {
          submitAction.click();
        });
      }
    }
  });
}
function initRandomLogos(next) {
  next = next || document;
  function createRandomImage(target) {
    const dataAttrs = ["data-src-1", "data-src-2", "data-src-3", "data-src-4"];
    const srcValues = dataAttrs.map((attr) => target.getAttribute(attr));
    const randomSrc = srcValues[Math.floor(Math.random() * srcValues.length)];

    if (randomSrc) {
      const img = document.createElement("img");
      img.src = randomSrc;
      img.alt = "Studio Messa logo";
      target.appendChild(img);
    }
  }
  const targets = next.querySelectorAll("[data-random]");
  targets.forEach((target) => createRandomImage(target));
}

//
//
function initHomeParallax(next) {
  next = next || document;
  let target = next.querySelector('[data-parallax="target"]');
  let gradient = next.querySelector('[data-parallax="gradient"]');
  let trigger = next.querySelector('[data-parallax="trigger"]');
  let heroParallax = gsap.timeline();
  heroParallax
    .to(target, { yPercent: 60, rotate: 0.001, ease: "linear" })
    .to(gradient, { opacity: 1, rotate: 0.001, ease: "linear" }, 0);

  ScrollTrigger.create({
    trigger: trigger,
    start: "top bottom",
    end: "top top",
    scrub: true,
    ease: "linear",
    animation: heroParallax,
  });
}
function initPageCta(next) {
  next = next || document;
  const triggers = next.querySelectorAll("[data-cta-trigger]");
  triggers.forEach((trigger) => {
    const triggerValue = trigger.getAttribute("data-cta-trigger");
    ScrollTrigger.create({
      trigger: trigger,
      start: "top 80%",
      end: "bottom 80%",
      onEnter: () => toggleActiveClass(triggerValue, true),
      onEnterBack: () => toggleActiveClass(triggerValue, true),
      onLeave: () => toggleActiveClass(triggerValue, false),
      onLeaveBack: () => toggleActiveClass(triggerValue, false),
    });
  });

  function toggleActiveClass(value, isActive) {
    const cta = document.querySelector(`[data-cta="${value}"]`);
    if (cta) {
      if (isActive) {
        cta.classList.add("active");
      } else {
        cta.classList.remove("active");
      }
    }
  }
}
function initFaq(next) {
  next = next || document;
  const faqTops = next.querySelectorAll(".faq-top");
  if (!faqTops) return;

  faqTops.forEach((faqTop) => {
    faqTop.dataset.open = "false";
    let parent = faqTop.parentElement;
    let lines = parent.querySelectorAll(".line");
    faqTop.addEventListener("click", () => {
      console.log(lines);
      if (faqTop.dataset.open === "false") {
        gsap.fromTo(
          lines,
          {
            autoAlpha: 0,
            yPercent: 75,
          },
          {
            autoAlpha: 1,
            yPercent: 0,
            stagger: 0.1,
            delay: 0.1,
            duration: 0.6,
          },
        );
        faqTop.dataset.open = "true";
      } else {
        gsap.to(lines, {
          autoAlpha: 0,
          duration: 0.4,
          stagger: { each: 0.01, from: "end" },
        });
        faqTop.dataset.open = "false";
      }
    });
  });
}
function initCase(next) {
  next = next || document;
  let track = next.querySelector(".track-w");
  let inner = track.querySelector(".track-inner");
  let list = track.querySelector(".track-list");
  let images = list.querySelectorAll("img");

  function updateDistance() {
    return list.getBoundingClientRect().width - window.innerWidth + 50;
  }

  let distance = updateDistance();

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
    },
  });

  tl.to(inner, { x: -distance, ease: "none" });

  function refreshScrollTrigger() {
    distance = updateDistance();
    tl.clear().to(inner, { x: -distance, ease: "none" });
    ScrollTrigger.refresh();
  }

  imagesLoaded(images, function () {
    refreshScrollTrigger();
  });

  gsap.delayedCall(2, () => {
    refreshScrollTrigger();
  });
}
function initCaseParallax(next) {
  next = next || document;
  let target = next.querySelector('[data-parallax="target"]');
  let trigger = next.querySelector('[data-parallax="trigger"]');
  let heroParallax = gsap.timeline();
  heroParallax.to(target, { yPercent: 60, rotate: 0.001, ease: "linear" });

  ScrollTrigger.create({
    trigger: trigger,
    start: "top 90%",
    end: "top top",
    scrub: true,
    ease: "linear",
    animation: heroParallax,
  });
}
function initMobileClients(next) {
  next = next || document;
  const clientItems = next.querySelectorAll(".client-item");
  if (clientItems.length === 0) return;
  const loadBtn = next.querySelector(".load-btn");

  if (clientItems.length > 8) {
    clientItems.forEach((item, index) => {
      if (index >= 8) {
        item.style.display = "none";
      }
    });

    loadBtn.addEventListener("click", () => {
      const hiddenLogos = [];
      clientItems.forEach((item, index) => {
        if (index >= 8) {
          item.style.display = "";
          hiddenLogos.push(item.querySelector(".client-logo"));
        }
      });

      gsap.from(hiddenLogos, {
        yPercent: 25,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power1.out",
      });

      loadBtn.style.display = "none";
      lenis.resize();
      ScrollTrigger.refresh();
    });
  }
}

//
//
//
//

function initGeneral(next) {
  initMenu(next);
  initNavScroll(next);
  initForms(next);
  initRandomLogos(next);
  if (isMobile) {
    initMobileClients(next);
  }
}
function initHome(next) {
  gsap.delayedCall(0.5, () => {
    ScrollTrigger.refresh();
  });
  initHomeParallax(next);
  initPageCta(next);
  initCursor(next);
}

//
//
//
//

barba.hooks.leave(() => {
  lenis.destroy();
});

barba.hooks.afterEnter((data) => {
  let next = data.next.container;
  let triggers = ScrollTrigger.getAll();
  triggers.forEach((trigger) => {
    trigger.kill();
  });

  resetWebflow(data);

  lenis = new Lenis({
    duration: 1.1,
    wrapper: document.body,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -13 * t)),
  });
});

//
//

barba.init({
  preventRunning: true,
  prevent: function ({ el }) {
    if (el.hasAttribute("data-barba-prevent")) {
      return true;
    }
  },
  transitions: [
    {
      name: "default",
      once(data) {
        return new Promise((resolve) => {
          lenis.stop();
          let lines = data.next.container.querySelectorAll(".line");

          const tl = gsap.timeline({
            onComplete: () => {
              resolve();
              gsap.set(".load-w", { display: "none" });
              gsap.set(".load-bg", { scaleY: 1 });
              lenis.start();
            },
            defaults: {
              duration: 1,
            },
          });

          gsap.set(".load-bg", { transformOrigin: "top top" });

          tl.fromTo(
            ".load-img",
            { autoAlpha: 0, yPercent: 50 },
            { autoAlpha: 1, yPercent: 0, duration: 0.5 },
          )
            .fromTo(".load-bg", { scaleY: 1 }, { scaleY: 0 }, ">+=0.4")
            .fromTo(
              data.next.container.querySelectorAll("[data-slide-up]"),
              {
                y: "50vh",
              },
              {
                y: 0,
                stagger: 0.05,
              },
              "<",
            )
            .to(".load-img", { autoAlpha: 0, yPercent: 50, duration: 0.4 }, "<")
            .from(
              lines,
              {
                yPercent: 100,
                autoAlpha: 0,
                stagger: 0.05,
              },
              "<+=0.5",
            )
            .from(".nav-c", { yPercent: -110, autoAlpha: 0 }, "<+=0.25");
          gsap.delayedCall(1, () => {
            initFadeOnLoad(data.next.container);
          });
        });
      },
      leave(data) {
        return new Promise((resolve) => {
          const tl = gsap.timeline({
            onComplete: () => {
              resolve();
              resetWebflow(data);
            },
            defaults: {
              duration: 0.6,
            },
          });

          lenis.stop();
          let trigger = data.trigger;
          if (trigger.classList.contains("menu-link")) {
            menuBtn.click();
          }
          pagaCtas.forEach((cta) => {
            cta.classList.remove("active");
          });
          lenis.scrollTo(0, {
            immediate: true,
            force: true,
            lock: true,
          });
          tl.to(data.current.container, { autoAlpha: 0 });
        });
      },
      enter(data) {
        return new Promise((resolve) => {
          const tl = gsap.timeline({
            onComplete: () => {
              resolve();
              lenis.start();
              gsap.set(".load-w", { display: "none" });
            },
            onStart: () => {
              gsap.set(data.next.container, { pointerEvents: "none" });
            },
            defaults: {
              duration: 1,
            },
          });
          let nextName = data.next.namespace;

          window.scrollTo(0, 0);
          const fullNavPages = ["about", "contact", "faq", "projects"];

          if (fullNavPages.includes(nextName)) {
            navWrap.removeAttribute("scrolled");
            navWrap.setAttribute("scrolled", "true");
          } else {
            navWrap.setAttribute("scrolled", "false");
          }
          runSplit(data.next.container);
          initFadeOnLoad(data.next.container);
          initLinesOnLoad(data.next.container);
          initSlideOnLoad(data.next.container);
        });
      },
    },
  ],
  views: [
    {
      namespace: "home",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initHome(next);
      },
    },
    {
      namespace: "about",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
    {
      namespace: "faq",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initFaq(next);
      },
    },
    {
      namespace: "projects",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initCursor(next);
      },
    },
    {
      namespace: "contact",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
    {
      namespace: "case",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
        initCaseParallax(next);
        if (window.innerWidth > 991) {
          initCase(next);
        }
      },
    },
    {
      namespace: "journal",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
    {
      namespace: "default",
      afterEnter(data) {
        let next = data.next.container;
        initGeneral(next);
      },
    },
  ],
});
