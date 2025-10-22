const LEVELS_OBJ = {
    level1: [{
            desc: "Muerte de Franco",
            year: 1975,
            src: 'assets/images/events/level1/1-franco.jpg'
        },
        {
            desc: "España gana por 12-1 a Malta",
            year: 1983,
            src: 'assets/images/events/level1/2-malta.jpg'
        },
        {
            desc: "Empiezan a emitir las televisiones privadas (Antena 3, Telecinco y Canal+)",
            year: 1990,
            src: 'assets/images/events/level1/3-tv.jpg'
        },
        {
            desc: "Se inaugura el AVE Madrid-Sevilla",
            year: 1992,
            src: 'assets/images/events/level1/4-ave.jpg'
        },
        {
            desc: "Desaparece la peseta. El euro única moneda oficial",
            year: 2002,
            src: 'assets/images/events/level1/5-pesetas.jpg'
        },
        {
            desc: "Felipe de Borbón se casa con Doña Letizia Ortiz",
            year: 2004,
            src: 'assets/images/events/level1/6-boda.jpg'
        },
        {
            desc: "España, campeona del mundo de fútbol",
            year: 2010,
            src: 'assets/images/events/level1/7-mundial.jpg'
        },
        {
            desc: "Don Juan Carlos I abdica",
            year: 2014,
            src: 'assets/images/events/level1/8-abdicar.jpg'
        }
    ],
    level2: [{
            desc: "El Guernica regresa a España",
            year: 1981,
            src: 'assets/images/events/level2/1-franco.jpg'
        },
        {
            desc: "Primera película española que gana un Óscar: ‘Volver a empezar’ de José Luis Garci",
            year: 1982,
            src: 'assets/images/events/level2/2-malta.jpg'
        },
        {
            desc: "España ingresa en la Comunidad Económica Europea y la OTAN",
            year: 1986,
            src: 'assets/images/events/level2/3-tv.jpg'
        },
        {
            desc: "Atentado de Hipercor y la casa cuartel de Zaragoza, dos de las mayores matanzas de ETA",
            year: 1987,
            src: 'assets/images/events/level2/4-ave.jpg'
        },
        {
            desc: "Camilo José Cela gana el premio Nobel de Literatura",
            year: 1989,
            src: 'assets/images/events/level2/5-pesetas.jpg'
        },
        {
            desc: "Se acaba la EGB y entra la ESO",
            year: 1995,
            src: 'assets/images/events/level2/6-boda.jpg'
        },
        {
            desc: "Desaparece la mili",
            year: 2001,
            src: 'assets/images/events/level2/7-mundial.jpg'
        },
        {
            desc: "El “¿por qué no te callas?”, del Rey Juan Carlos a Hugo Chávez.",
            year: 2007,
            src: 'assets/images/events/level2/8-abdicar.jpg'
        }
    ],
    level3: [{
            desc: "Primer concierto de los Rolling en España",
            year: 1976,
            src: 'assets/images/events/level3/1-franco.jpg'
        },
        {
            desc: "Fin de la censura (se deroga la Ley de Prensa e Imprenta de 1966)",
            year: 1977,
            src: 'assets/images/events/level3/2-malta.jpg'
        },
        {
            desc: "Primera marcha del Orgullo en Madrid",
            year: 1978,
            src: 'assets/images/events/level3/3-tv.jpg'
        },
        {
            desc: "Nace el primer niño en España por fecundación in vitro",
            year: 1984,
            src: 'assets/images/events/level3/4-ave.jpg'
        },
        {
            desc: "Primer ingreso de mujeres en la Policía Nacional",
            year: 1985,
            src: 'assets/images/events/level3/5-pesetas.jpg'
        },
        {
            desc: "Legalizado el matrimonio homosexual",
            year: 2005,
            src: 'assets/images/events/level3/6-boda.jpg'
        },
        {
            desc: "Entra en vigor la ley antitabaco",
            year: 2006,
            src: 'assets/images/events/level3/7-mundial.jpg'
        },
        {
            desc: "Fin de ETA. La banda anuncia el “cese definitivo de su actividad armada”",
            year: 2011,
            src: 'assets/images/events/level3/8-abdicar.jpg'
        }
    ]
};

const resultMessages = [{
        min: 0,
        max: 0,
        title: "¡NO RECUERDAS NADA!",
        subtitle: "¿Seguro que has vivido en este país?"
    },
    {
        min: 1,
        max: 2,
        title: "MALA MEMORIA",
        subtitle: "Ni la EGB te ha salvado..."
    },
    {
        min: 3,
        max: 3,
        title: "JUSTITO",
        subtitle: "Aprobado raspado con ayuda de la Wikipedia."
    },
    {
        min: 4,
        max: 5,
        title: "MEMORIA DECENTE",
        subtitle: "Tu cabeza aún funciona."
    },
    {
        min: 6,
        max: 6,
        title: "CASI PERFECTO",
        subtitle: "Solo te ha fallado una. ¡Muy bien!"
    },
    {
        min: 7,
        max: 7,
        title: "¡UNA PUNTUACIÓN DE MATRÍCULA!",
        subtitle: "Tienes más memoria que Jordi Hurtado."
    }
];

class DragDropManager {
    constructor(dragZoneSelector, dropZoneSelector, level = 1) {
        this.dragZone = document.querySelector(dragZoneSelector);
        this.dropZone = document.querySelector(dropZoneSelector);
        this.aboveZone = this.dropZone.querySelector('.blocks-above');
        this.belowZone = this.dropZone.querySelector('.blocks-below');
        this.mainItem = this.dropZone.querySelector('.block-item--main');
        this.currentDragItem = null;
        this.lastCloseItems = [];

        this.levelData = LEVELS_OBJ[`level${level}`];
        this.currentLevel = level;
        console.log('Array original (levelData):', this.levelData);
        this.round = 1;
        this.maxRounds = 7;
        this.score = 0;
        this.usedIndexes = new Set();

        this.setMainEvent();
        this.init();
    }

    setMainEvent() {
        const index = Math.floor(Math.random() * (this.levelData.length - 4)) + 2;
        this.mainIndex = index;
        this.mainEvent = this.levelData[index];
        this.mainItem.textContent = this.mainEvent.desc;
        this.mainItem.dataset.year = this.mainEvent.year;

        this.remainingEvents = this.levelData.filter((_, i) => i !== index);
        console.log('Array actual antes de barajar (remainingEvents):', this.remainingEvents);

        this.shuffleArray(this.remainingEvents);

        console.log('Array actual después de barajar (remainingEvents):', this.remainingEvents);

        this.currentEventIndex = 0;
        this.updateStatus();
    }

    updateStatus() {
        document.getElementById('round').textContent = this.round;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    init() {
        this.addNewDraggable();
        this.dropZone.addEventListener('dragover', this.onDragOver.bind(this));
        this.dropZone.addEventListener('drop', this.onDrop.bind(this));
    }

    addNewDraggable() {
        if (this.currentEventIndex >= this.remainingEvents.length) return;

        const item = document.createElement('div');
        item.className = 'block-item block-item--drag';
        item.textContent = this.remainingEvents[this.currentEventIndex].desc;
        item.setAttribute('draggable', 'true');
        item.dataset.year = this.remainingEvents[this.currentEventIndex].year;

        item.addEventListener('dragstart', (e) => {
            item.classList.add('is-dragging');
            this.currentDragItem = item;
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.dropEffect = 'move';
        });

        item.addEventListener('dragend', this.onDragEnd.bind(this));

        item.addEventListener('dragend', () => {
            item.classList.remove('is-dragging');
        });

        this.dragZone.innerHTML = '';
        this.dragZone.appendChild(item);
    }

    onDragOver(e) {
        e.preventDefault();
        const dragging = document.querySelector('.is-dragging');
        if (!dragging) return;

        const mouseY = e.clientY;
        const mainBox = this.mainItem.getBoundingClientRect();
        const inAbove = mouseY < mainBox.top;
        const zone = inAbove ? this.aboveZone : this.belowZone;

        const siblings = [...zone.querySelectorAll('.block-item:not(.is-dragging)')];
        let inserted = false;

        for (const sibling of siblings) {
            const box = sibling.getBoundingClientRect();
            if (mouseY < box.top + box.height / 2) {
                zone.insertBefore(dragging, sibling);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            zone.appendChild(dragging);
        }

        const allItems = [...this.dropZone.querySelectorAll('.block-item:not(.is-dragging)')];
        const closeItems = this.getClosestItems(dragging, allItems);

        const changed =
            closeItems.length !== this.lastCloseItems.length ||
            closeItems.some((item, i) => item !== this.lastCloseItems[i]);

        if (changed) {
            this.lastCloseItems.forEach(el => el.classList.remove('is-close'));
            closeItems.forEach(el => el.classList.add('is-close'));
            this.lastCloseItems = closeItems;
        }
    }

    onDrop(e) {
        e.preventDefault();
        const dragging = document.querySelector('.is-dragging');
        if (!dragging) return;

        dragging.classList.remove('is-dragging');

        this.lastCloseItems.forEach(el => el.classList.remove('is-close'));
        this.lastCloseItems = [];

        this.showConfirmationButton(dragging);
    }

    onDragEnd(e) {
        const dragging = e.target;
        if (!dragging) return;

        dragging.classList.remove('is-dragging');
        this.lastCloseItems.forEach(el => el.classList.remove('is-close'));
        this.lastCloseItems = [];

        if (this.dropZone.contains(dragging)) {
            if (!dragging.querySelector('.confirm-btn')) {
                this.showConfirmationButton(dragging);
            }
        } else {
            const confirmBtn = dragging.querySelector('.confirm-btn');
            if (confirmBtn) confirmBtn.remove();

            dragging.setAttribute('draggable', 'true');
            dragging.classList.remove('block-item--drop');
            dragging.classList.add('block-item--drag');

            this.dragZone.innerHTML = '';
            this.dragZone.appendChild(dragging);
        }
    }

    getClosestItems(dragging, items) {
        const draggingBox = dragging.getBoundingClientRect();
        return items.filter(item => {
            const box = item.getBoundingClientRect();
            return Math.abs(draggingBox.top - box.top) <= 80;
        });
    }

    checkCorrectPosition(blockItem, container) {
      const year = parseInt(blockItem.dataset.year);
      const children = [...container.querySelectorAll('.block-item--drop')].filter(el => el !== this.mainItem);

      // Encontramos la posición del bloque
      const index = children.indexOf(blockItem);

      let correct = true;

      if (container === this.aboveZone) {
          const prevYear = index > 0 ? parseInt(children[index - 1].dataset.year) : -Infinity;
          const nextYear = index < children.length - 1 ? parseInt(children[index + 1].dataset.year) : parseInt(this.mainItem.dataset.year);
          correct = year > prevYear && year < nextYear;
      } else {
          const prevYear = index > 0 ? parseInt(children[index - 1].dataset.year) : parseInt(this.mainItem.dataset.year);
          const nextYear = index < children.length - 1 ? parseInt(children[index + 1].dataset.year) : Infinity;
          correct = year > prevYear && year < nextYear;
      }

      return correct;
  }

    showConfirmationButton(blockItem) {
        if (blockItem.querySelector('.confirm-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'confirm-btn';
        btn.textContent = '¿Correcto?';

        btn.addEventListener('click', () => {
            blockItem.removeAttribute('draggable');
            blockItem.classList.remove('block-item--drag');
            blockItem.classList.add('block-item--drop');
            btn.remove();

            const year = parseInt(blockItem.dataset.year);
            const mainYear = parseInt(this.mainItem.dataset.year);
            const container = blockItem.closest('.blocks-above') ? this.aboveZone : this.belowZone;

            const correct = this.checkCorrectPosition(blockItem, container);

            blockItem.classList.add(correct ? 'correct' : 'wrong');

            if (!correct) {
                blockItem.classList.remove('wrong');
                const correctContainer = year < mainYear ? this.aboveZone : this.belowZone;

                this.insertInOrder(blockItem, correctContainer);
                blockItem.classList.add('wrong');
            }

            const scoreItem = document.createElement('span');
            scoreItem.textContent = correct ? '✔️' : '❌';
            document.getElementById('score').appendChild(scoreItem);

            if (correct) this.score++;

            // LOG: Estado de confirmación actual
            console.log('Evento confirmado:', {
                text: blockItem.textContent,
                year: year,
                zone: container === this.aboveZone ? 'above' : 'below',
                correct: correct
            });

            // LOG: Estado actual de items colocados arriba y abajo
            const aboveItems = [...this.aboveZone.querySelectorAll('.block-item--drop')].map(i => ({
                text: i.textContent,
                year: i.dataset.year,
                status: i.classList.contains('correct') ? 'correct' : 'wrong'
            }));
            const belowItems = [...this.belowZone.querySelectorAll('.block-item--drop')].map(i => ({
                text: i.textContent,
                year: i.dataset.year,
                status: i.classList.contains('correct') ? 'correct' : 'wrong'
            }));

            console.log('Estado actual arriba:', aboveItems);
            console.log('Estado actual abajo:', belowItems);

            this.round++;
            this.currentEventIndex++;
            if (this.round > this.maxRounds) {
                this.showFinalResult(this.score);
            } else {
                this.updateStatus();
                this.addNewDraggable();
            }
        });

        blockItem.appendChild(btn);
    }

    insertInOrder(blockItem, container) {
        const firstRect = blockItem.getBoundingClientRect();

        const children = [...container.children].filter(el => el !== this.mainItem);
        const year = parseInt(blockItem.dataset.year);

        let referenceNode = null;
        for (const child of children) {
            const childYear = parseInt(child.dataset.year);
            if (year < childYear) {
                referenceNode = child;
                break;
            }
        }

        if (referenceNode) {
            container.insertBefore(blockItem, referenceNode);
        } else {
            container.appendChild(blockItem);
        }

        const lastRect = blockItem.getBoundingClientRect();

        const deltaX = firstRect.left - lastRect.left;
        const deltaY = firstRect.top - lastRect.top;

        blockItem.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        blockItem.style.transition = 'transform 0s';

        blockItem.offsetHeight;

        blockItem.style.transition = 'transform 0.4s ease';
        blockItem.style.transform = 'translate(0, 0)';

        blockItem.addEventListener('transitionend', function cleanup() {
            blockItem.style.transform = '';
            blockItem.style.transition = '';
            blockItem.removeEventListener('transitionend', cleanup);
        });
    }

    showFinalResult(points) {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('result-title');
        const subtitle = document.getElementById('result-subtitle');
        const score = document.getElementById('result-score');

        const message = resultMessages.find(m => points >= m.min && points <= m.max);

        title.textContent = message.title;
        subtitle.textContent = message.subtitle;
        score.textContent = points;

        setTimeout(() => {
            modal.classList.remove('hidden');
        }, 1000);
    }

    resetGame() {
        this.round = 1;
        this.score = 0;
        this.usedIndexes.clear();
        this.dragZone.innerHTML = '';
        this.aboveZone.innerHTML = '';
        this.belowZone.innerHTML = '';
        this.levelData = LEVELS_OBJ[`level${this.currentLevel}`];
        document.getElementById('score').innerHTML = '';
        document.getElementById('result-modal').classList.add('hidden');

        this.setMainEvent();
        this.updateStatus();
        this.addNewDraggable();
    }
}

let gameInstance;
let selectedLevel = null;

document.addEventListener('DOMContentLoaded', () => {
    const levelButtons = document.querySelectorAll('.level-btn');
    const startButton = document.getElementById('start-game-btn');
    const levelSelector = document.getElementById('level-selector');
    const gameContainer = document.querySelector('.container');

    // Ocultar el juego inicialmente
    gameContainer.classList.add('hidden');

    // Seleccionar nivel
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedLevel = parseInt(btn.dataset.level);
            startButton.disabled = false;

            // Marcar botón seleccionado
            levelButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Comenzar juego
    startButton.addEventListener('click', () => {
        if (!selectedLevel) return;

        // Oculta el selector y muestra el juego
        levelSelector.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        // Inicializa el juego con el nivel seleccionado
        gameInstance = new DragDropManager('#drag-zone', '#drop-zone', selectedLevel);
    });
});

document.getElementById('restart-btn').addEventListener('click', () => {
    if (gameInstance) {
        gameInstance.resetGame();
    } else {
        location.reload();
    }
});

document.getElementById('share-btn').addEventListener('click', () => {
    const score = document.getElementById('result-score').textContent;
    const url = window.location.href;
    const text = `¡He conseguido ${score}/7 puntos en este juego de memoria histórica! ¿Puedes superarme?`;

    if (navigator.share) {
        navigator.share({
            title: 'Juego de memoria histórica',
            text: text,
            url: url,
        }).catch(console.error);
    } else {
        const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebook, '_blank');
    }
});