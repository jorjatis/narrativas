import html2canvas from 'html2canvas';

export function initAll() {
  const downloadBtn = document.getElementById('downloadBtn');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCapture);
  }
}

function prepareClone(clonedDoc) {
  const captureArea = clonedDoc.getElementById('captureArea');
  if (!captureArea) return;
  captureArea.style.width = '610px';
  captureArea.style.height = '754px';
  captureArea.style.backgroundColor = '#f4f4f4';
  captureArea.style.padding = '24px 0';

  const pyramidBadge = clonedDoc.querySelectorAll('pyramid-badge');
  pyramidBadge.forEach(el => {
    el.style.fontSize = '16px';
    el.style.width = '26px';
    el.style.height = '26px';
  });

  const pyramidLogo = clonedDoc.getElementById('captureLogo');
  if (pyramidLogo) {
    pyramidLogo.style.display = 'block';
  }
}

async function downloadCapture() {
  const element = document.getElementById('captureArea');

  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      onclone: prepareClone
    });

    const link = document.createElement('a');
    link.download = 'mi-ranking.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

  } catch (error) {
    console.error('Error al generar la imagen:', error);
  }
}

window.addEventListener('load', initAll);