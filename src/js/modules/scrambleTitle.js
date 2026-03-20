import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function scrambleTitle() {
  const container = document.querySelector(".n-preh__bottom .n-preh-t-c");
  const title = document.querySelector(".n-preh__bottom .n-preh__t");
  const lines = document.querySelectorAll(".n-preh__bottom .n-preh__t span");
  const subtitle = document.querySelector(".n-preh__bottom .n-preh__st");

  if (!container || !lines.length || !title) return;

  gsap.registerPlugin(ScrollTrigger);

  const CHARS = "XO#@!%&";
  let currentLine = null;

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  lines.forEach(line => {
    line.dataset.text = line.textContent;
    line.style.visibility = "hidden";
  });

  if (subtitle) {
    gsap.set(subtitle, { opacity: 0, y: 10 });
  }

  function scrambleChar(finalChar, iterations = 3, speed = 12) {
    return new Promise(resolve => {
      let count = 0;

      function update() {
        if (count < iterations) {
          updateChar(randomChar());
          count++;
          setTimeout(update, speed);
        } else {
          updateChar(finalChar);
          resolve();
        }
      }

      function updateChar(char) {
        currentLine.textContent =
          currentLine.textContent.slice(0, -1) + char;
      }

      update();
    });
  }

  async function typeLine(line) {
    const text = line.dataset.text;
    currentLine = line;

    line.style.visibility = "visible";
    line.textContent = "";

    for (let i = 0; i < text.length; i++) {
      const finalChar = text[i];

      line.textContent += randomChar();
      await scrambleChar(finalChar, 3, 12);
    }
  }

  ScrollTrigger.create({
    trigger: container,
    start: "top 65%",
    once: true,
    onEnter: async () => {
      for (let line of lines) {
        await typeLine(line);
        await new Promise(r => setTimeout(r, 80));
      }

      requestAnimationFrame(() => {
        title.style.minHeight = title.scrollHeight + "px";
      });

      if (subtitle) {
        gsap.to(subtitle, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        });
      }
    }
  });

  let resizeTimeout;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  });
}
