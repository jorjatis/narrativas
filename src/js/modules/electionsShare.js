import html2canvas from 'html2canvas';

const IMAGE_NAME = 'elecciones-resultado.jpg';

function appleTouchIcon() {
  const icon = document.querySelector('link[rel="apple-touch-icon"][sizes="57x57"]')
    || document.querySelector('link[rel="apple-touch-icon"]');
  return icon ? icon.href : '';
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => copyTextFallback(text));
  }
  return copyTextFallback(text);
}

function copyTextFallback(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function pageTitle() {
  return (document.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
}

function fieldText(selector) {
  return (document.querySelector(selector)?.textContent || '').replace(/\s+/g, ' ').trim();
}

function resultText() {
  const chosen = fieldText('.v-elec-res__party-chosen');
  const closest = fieldText('.v-elec-res__party-name');
  const percent = fieldText('.v-elec-res__party-percent');
  return `Has elegido ${chosen} y el partido más cercano a tus posiciones es ${closest} por un ${percent}.`;
}

function shareMessage() {
  return `${resultText()} ${window.location.href}`;
}

const shareTargets = {
  whatsapp: (text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
  facebook: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  twitter: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  linkedin: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
  telegram: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  threads: (text) => `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
};

function fillShareModal(modal) {
  const url = window.location.href;
  const title = pageTitle();

  const input = modal.querySelector('.v-frm__i');
  if (input) input.value = url;

  const logo = modal.querySelector('.v-mdl__h .v-log__i');
  const icon = appleTouchIcon();
  if (logo && icon) logo.src = icon;

  const heading = modal.querySelector('.v-mdl__p');
  if (heading) heading.textContent = title;
}

function openShare(network) {
  const build = shareTargets[network];
  if (!build) return;

  const url = window.location.href;
  const sentence = resultText();
  const text = network === 'whatsapp' || network === 'twitter' || network === 'threads'
    ? `${sentence} ${url}`
    : sentence;

  window.open(build(text, url), '_blank', 'noopener,width=600,height=500');
}

function bindCopy(modal) {
  modal.querySelectorAll('[data-voc-component="copy-link"]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.closest('.v-frm__w')?.querySelector('.v-frm__i');
      const url = window.location.href;
      if (input) input.value = url;
      copyText(url);
    });
  });
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('No se pudo crear la imagen'));
    }, type, quality);
  });
}

function chartSpan(chart) {
  const box = chart.getBoundingClientRect();
  let left = box.left;
  let right = box.right;
  chart.querySelectorAll('.v-elec-matriz__axis, .v-elec-matriz__frame').forEach((el) => {
    const rect = el.getBoundingClientRect();
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
  });
  return Math.ceil(right - left);
}

function captureCanvas() {
  const header = document.querySelector('.v-elec-h');
  const matriz = document.querySelector('.v-elec-matriz');
  const widgets = document.querySelector('.v-elec-widgets');
  if (!header || !matriz) return Promise.reject(new Error('No hay resultado para capturar'));

  const chart = matriz.querySelector('.v-elec-matriz__chart');
  const liveWidth = widgets?.clientWidth || matriz.clientWidth;
  const chartWidth = chart ? chartSpan(chart) : liveWidth;

  const stage = document.createElement('div');
  stage.className = 'v-elec-capture';
  stage.setAttribute('aria-hidden', 'true');
  stage.style.boxSizing = 'content-box';
  stage.style.width = `${Math.max(liveWidth, chartWidth)}px`;
  stage.style.padding = '8px 32px 24px';

  const matrizClone = matriz.cloneNode(true);
  matrizClone.querySelector('#shareResults')?.remove();
  matrizClone.querySelector('.v-bdp')?.remove();
  matrizClone.querySelector('[popovertarget="shareResults"]')?.closest('.v-btn-c')?.remove();
  matrizClone.querySelector('.v-elec-matriz__toggle')?.remove();
  matrizClone.querySelector('.v-elec-matriz__readers')?.remove();
  matrizClone.querySelector('.v-elec-matriz__callout')?.remove();

  const chartClone = matrizClone.querySelector('.v-elec-matriz__chart');
  if (chartClone) {
    chartClone.style.transform = 'none';
    chartClone.style.width = 'max-content';
    chartClone.style.marginLeft = 'auto';
    chartClone.style.marginRight = 'auto';
  }

  stage.append(header.cloneNode(true), matrizClone);
  document.body.append(stage);

  return html2canvas(stage, {
    backgroundColor: '#F9F6EE',
    scale: 2,
    logging: false,
    useCORS: true,
  }).finally(() => stage.remove());
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = IMAGE_NAME;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showImageFeedback(button) {
  const label = button.querySelector('.v-elec-share-img__t');
  const done = button.getAttribute('data-elec-done');
  if (!label || !done) return;

  if (!button.dataset.elecLabel) button.dataset.elecLabel = label.textContent;
  label.textContent = done;
  button.classList.add('is-active');
  window.clearTimeout(Number(button.dataset.elecTimer));
  button.dataset.elecTimer = String(window.setTimeout(() => {
    button.classList.remove('is-active');
    label.textContent = button.dataset.elecLabel;
  }, 2000));
}

function bindImageActions(modal) {
  let pending = null;

  function canvas() {
    if (!pending) pending = captureCanvas().finally(() => { pending = null; });
    return pending;
  }

  modal.querySelectorAll('[data-elec-share]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-elec-share');

      if (action === 'copy') {
        const blob = canvas().then((shot) => toBlob(shot, 'image/png'));
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          .then(() => showImageFeedback(button))
          .catch(() => {});
        return;
      }

      canvas().then(async (shot) => {
        const blob = await toBlob(shot, 'image/jpeg', 0.92);
        if (action === 'download') {
          downloadBlob(blob);
          showImageFeedback(button);
          return;
        }
        const file = new File([blob], IMAGE_NAME, { type: 'image/jpeg' });
        if (!navigator.canShare?.({ files: [file] })) return;
        await navigator.share({ files: [file], title: pageTitle(), text: resultText() });
      }).catch((error) => {
        if (error?.name === 'AbortError') return;
      });
    });
  });
}

function bindShares(modal) {
  modal.querySelectorAll('[data-voc-social-sharer]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const network = button.getAttribute('data-voc-social-sharer');
      if (!shareTargets[network]) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openShare(network);
    }, true);
  });
}

export function initElectionsShare() {
  const modal = document.getElementById('shareResults');
  if (!modal) return;

  const fill = () => fillShareModal(modal);
  fill();
  bindCopy(modal);
  bindShares(modal);
  bindImageActions(modal);
  document.querySelectorAll('[popovertarget="shareResults"]').forEach((button) => {
    button.addEventListener('click', fill);
  });
  modal.addEventListener('toggle', (event) => {
    if (event.newState === 'open') fill();
  });
}
