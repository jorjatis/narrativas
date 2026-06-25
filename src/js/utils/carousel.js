/**
 * Componente Carousel Reutilizable
 */
export default class Carousel {
  constructor(elementOrSelector = '.carousel', customOptions = {}) {
    if (typeof elementOrSelector === 'string') {
      const elements = document.querySelectorAll(elementOrSelector);
      if (elements.length > 1) {
        elements.forEach(el => new Carousel(el, customOptions));
        return;
      }
      this.wrapper = elements[0];
    } else {
      this.wrapper = elementOrSelector;
    }

    if (!this.wrapper) return;

    this.options = {
      arrows: true,
      shadows: true,
      dots: false,
      counter: false,
      counterSeparator: '/',
      centerItem: false, 
      draggable: true, // Nueva opción por defecto en true
      ...customOptions
    };

    this.currentIndex = 0;
    this.items = [];
    this.track = null;
    
    // Gestión del Drag y efecto elástico
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.dragThreshold = 40; 
    this.hasMoved = false;

    this.init();
  }

  init() {
    this.track = this.wrapper.querySelector('.carousel-track');
    if (!this.track) return;

    this.items = Array.from(this.track.children);
    if (this.items.length === 0) return;

    // Inyectar dinámicamente los contenedores de sombras si la opción está activa
    this.renderShadows();
    this.renderArrows();
    this.renderDots();
    this.renderCounter();

    this.bindEvents();
    this.updateCarousel();
  }

  renderShadows() {
    if (!this.options.shadows) return;
    
    this.shadowLeftEl = document.createElement('div');
    this.shadowLeftEl.className = 'carousel-shadow shadow-left';
    
    this.shadowRightEl = document.createElement('div');
    this.shadowRightEl.className = 'carousel-shadow shadow-right';

    this.wrapper.appendChild(this.shadowLeftEl);
    this.wrapper.appendChild(this.shadowRightEl);
  }

  renderArrows() {
    if (!this.options.arrows) {
      this.wrapper.querySelectorAll('.nav-btn').forEach(btn => btn.remove());
      return;
    }

    this.btnLeft = this.wrapper.querySelector('.nav-btn-left');
    this.btnRight = this.wrapper.querySelector('.nav-btn-right');

    if (!this.btnLeft) {
      this.btnLeft = document.createElement('button');
      this.btnLeft.className = 'nav-btn nav-btn-left';
      this.btnLeft.innerHTML = '&#10094;';
      this.wrapper.querySelector('.carousel-container')?.appendChild(this.btnLeft);
    }
    if (!this.btnRight) {
      this.btnRight = document.createElement('button');
      this.btnRight.className = 'nav-btn nav-btn-right';
      this.btnRight.innerHTML = '&#10095;';
      this.wrapper.querySelector('.carousel-container')?.appendChild(this.btnRight);
    }
  }

  renderDots() {
    if (!this.options.dots) return;
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.className = 'carousel-dots';

    this.items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.addEventListener('click', () => this.goTo(index));
      this.dotsContainer.appendChild(dot);
    });

    this.wrapper.appendChild(this.dotsContainer);
  }

  renderCounter() {
    if (!this.options.counter) return;
    this.counterContainer = document.createElement('div');
    this.counterContainer.className = 'carousel-counter';
    this.wrapper.appendChild(this.counterContainer);
  }

  bindEvents() {
    if (this.options.arrows) {
      this.btnLeft.addEventListener('click', () => this.prev());
      this.btnRight.addEventListener('click', () => this.next());
    }

    // Eventos de arrastre condicionados por la opción draggable
    if (this.options.draggable) {
      this.track.addEventListener('pointerdown', (e) => this.dragStart(e));
      this.track.addEventListener('pointermove', (e) => this.dragMove(e));
      this.track.addEventListener('pointerup', () => this.dragEnd());
      this.track.addEventListener('pointerleave', () => this.dragEnd());
    } else {
      this.track.style.cursor = 'default';
    }

    window.addEventListener('resize', () => this.updateCarousel());
  }

  goTo(index) {
    if (index < 0 || index >= this.items.length) return;
    this.currentIndex = index;
    this.updateCarousel();
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  updateCarousel() {
    if (this.items.length === 0) return;

    let targetTranslate = 0;
    const wrapperWidth = this.wrapper.offsetWidth;
    const trackWidth = this.track.scrollWidth;

    if (this.options.centerItem) {
      const currentItem = this.items[this.currentIndex];
      targetTranslate = (wrapperWidth / 2) - (currentItem.offsetLeft) - (currentItem.offsetWidth / 2);
    } else {
      const currentItem = this.items[this.currentIndex];
      targetTranslate = -currentItem.offsetLeft;

      if (trackWidth > wrapperWidth) {
        const maxTranslate = -(trackWidth - wrapperWidth);
        
        // EFECTO MUELLE PRONUNCIADO
        if (targetTranslate < maxTranslate) {
          // Exageramos la deformación física a 55px de desplazamiento elástico
          this.track.style.transform = `translateX(${maxTranslate - 55}px)`;
          setTimeout(() => {
            this.track.style.transform = `translateX(${maxTranslate}px)`;
          }, 180);
          
          targetTranslate = maxTranslate;
        }
      } else {
        targetTranslate = 0;
      }
    }
    
    setTimeout(() => {
      this.track.style.transform = `translateX(${targetTranslate}px)`;
    }, 0);
    
    this.prevTranslate = targetTranslate;
    this.updateUIComponents();
  }

  updateUIComponents() {
    const trackWidth = this.track.scrollWidth;
    const wrapperWidth = this.wrapper.offsetWidth;
    const maxTranslate = -(trackWidth - wrapperWidth);

    // 1. Lógica de Flechas Inteligente: 
    // La flecha derecha se queda encendida siempre que el ÍNDICE no sea matemáticamente el último, aunque el raíl esté topado.
    const hideLeftBtn = this.currentIndex === 0;
    const hideRightBtn = this.currentIndex === this.items.length - 1;

    if (this.options.arrows) {
      hideLeftBtn ? this.btnLeft.classList.remove('is-visible') : this.btnLeft.classList.add('is-visible');
      hideRightBtn ? this.btnRight.classList.remove('is-visible') : this.btnRight.classList.add('is-visible');
    }

    // 2. Lógica de Sombras (Basada en la posición visual real del raíl)
    if (this.options.shadows && this.shadowLeftEl && this.shadowRightEl) {
      const isAtStart = this.prevTranslate >= 0;
      const isAtEnd = trackWidth > wrapperWidth && this.prevTranslate <= maxTranslate;

      isAtStart ? this.shadowLeftEl.classList.remove('is-visible') : this.shadowLeftEl.classList.add('is-visible');
      isAtEnd ? this.shadowRightEl.classList.remove('is-visible') : this.shadowRightEl.classList.add('is-visible');
    }

    // 3. Modificar Dots
    if (this.options.dots && this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, idx) => {
        idx === this.currentIndex ? dot.classList.add('is-active') : dot.classList.remove('is-active');
      });
    }

    // 4. Modificar Contador
    if (this.options.counter && this.counterContainer) {
      this.counterContainer.innerText = `${this.currentIndex + 1} ${this.options.counterSeparator} ${this.items.length}`;
    }
  }

  // --- CONTROL DE DRAG ---

  dragStart(e) {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.hasMoved = false;
    this.startX = e.clientX;
    this.track.style.transition = 'none';
    this.track.classList.add('is-grabbing');
    this.track.setPointerCapture(e.pointerId);
  }

  dragMove(e) {
    if (!this.isDragging) return;
    const currentX = e.clientX;
    const diffX = currentX - this.startX;

    if (Math.abs(diffX) > 3) {
      this.hasMoved = true;
    }

    let calculatedTranslate = this.prevTranslate + diffX;
    const trackWidth = this.track.scrollWidth;
    const wrapperWidth = this.wrapper.offsetWidth;
    const maxTranslate = -(trackWidth - wrapperWidth);

    // Resistencia elástica en extremos durante el arrastre dinámico
    if (calculatedTranslate > 0) {
      calculatedTranslate = diffX * 0.20; // Más resistencia
    } else if (calculatedTranslate < maxTranslate) {
      calculatedTranslate = maxTranslate + (calculatedTranslate - maxTranslate) * 0.20;
    }

    this.track.style.transform = `translateX(${calculatedTranslate}px)`;
    this.currentTranslate = calculatedTranslate;
  }

  dragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.transition = '';
    this.track.classList.remove('is-grabbing');

    if (!this.hasMoved) {
      this.updateCarousel();
      return;
    }

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -this.dragThreshold && this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    } else if (movedBy > this.dragThreshold && this.currentIndex > 0) {
      this.currentIndex--;
    }

    this.updateCarousel();
  }
}