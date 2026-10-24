import { useEffect, useRef } from 'react';

// Generador de beep sonoro con Web Audio API para simular el sonido del lector físico
function playBeep(type = 'success') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(1750, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Si el navegador bloquea audio sin interacción previa, ignorar
  }
}

export function BarcodeListener({ onScan, products = [] }) {
  const barcodeBuffer = useRef('');
  const lastKeyTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Si el foco está en un input normal y el usuario escribe lento, dejamos que funcione el input
      const targetTag = e.target.tagName.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea';

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;
      lastKeyTime.current = currentTime;

      // Un lector de código de barras físico emite caracteres con menos de 40ms de diferencia
      if (timeDiff > 100 && barcodeBuffer.current.length > 0) {
        barcodeBuffer.current = '';
      }

      if (e.key === 'Enter') {
        const code = barcodeBuffer.current.trim();
        barcodeBuffer.current = '';

        if (code.length >= 4) {
          // Buscamos si coincide con algún producto por código de barras o ID
          const matchedProduct = products.find(
            p => (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
                 p.id.toLowerCase() === code.toLowerCase()
          );

          if (matchedProduct) {
            playBeep('success');
            onScan(matchedProduct);
            if (isInput) e.target.blur(); // Quitar foco para no interferir
          } else {
            playBeep('error');
            console.warn(`[Lector de Barras] Código no encontrado: ${code}`);
          }
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, onScan]);

  return null;
}
