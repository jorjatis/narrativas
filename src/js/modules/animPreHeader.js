export default function animPreHeader() {
  const wave = document.querySelector(".anim-wave path");
  const bg = document.querySelector(".anim-bg");
  const lottieContainer = document.getElementById('lottie-anim');

  const waveTween = gsap.to(wave, {
    duration: 0.7,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    attr: {
      d: "M0,60 C300,0 600,120 900,60 C1200,0 1440,120 1440,60 L1440,150 L0,150 Z"
    }
  });

  const animation = lottie.loadAnimation({
    container: lottieContainer,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'https://s1.abcstatics.com/comun/especiales/bandas-latinas/json/cabecera-bandas-latinas-ojo.json'
  });

  let started = false;

  animation.addEventListener('DOMLoaded', () => {
    animation.addEventListener('enterFrame', () => {
      const progress = animation.currentFrame / animation.totalFrames;

      if (progress > 0.4 && !started) {
        started = true;

        gsap.to(bg, {
          y: "-150%",
          duration: 1.5,
          ease: "power2.inOut",

          onComplete: () => {
            waveTween.kill();
            animation.destroy();
            bg.remove();
            lottieContainer?.remove();
          }
        });
      }
    });
  });
}