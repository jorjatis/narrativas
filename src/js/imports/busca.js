export default function initTypewriterBusca() {
  const { ScrollTrigger } = window;

  const buscas = document.querySelectorAll(".busca");
  if (!buscas.length) return;

  buscas.forEach((busca) => {

    // 🔒 Protección por si se vuelve a inicializar
    if (busca.dataset.typewriterInit) return;
    busca.dataset.typewriterInit = "true";

    const timeEl = busca.querySelector(".busca__time");
    const textEl = busca.querySelector(".busca__txt");
    const typedContainer = busca.querySelector(".busca__typed");

    if (!timeEl || !textEl || !typedContainer) return;

    const fullTime = timeEl.dataset.text || "";
    const fullText = textEl.dataset.text || "";

    const speed = 40;

    // Limpiar contenido inicial
    timeEl.textContent = "";
    typedContainer.innerHTML = "";

    function runTypewriter() {
      let i = 0;

      function typeTime() {
        if (i < fullTime.length) {
          timeEl.textContent += fullTime[i];
          i++;
          setTimeout(typeTime, speed);
        } else {
          i = 0;
          setTimeout(typeText, 100);
        }
      }

      function typeText() {
        if (i < fullText.length) {

          if (i === 0) {
            const firstSentence = fullText.split(".")[0] + ".";
            const bold = document.createElement("b");
            bold.textContent = firstSentence;
            typedContainer.appendChild(bold);
            i += firstSentence.length;
          } else {
            typedContainer.innerHTML += fullText[i];
            i++;
          }

          setTimeout(typeText, speed);
        }
      }

      typeTime();
    }

    ScrollTrigger.create({
      trigger: busca,
      start: "top 90%",
      once: true,
      onEnter: runTypewriter,
      markers:true
    });

  });
}