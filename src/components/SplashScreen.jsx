import { useState, useEffect } from 'react';
import logoImg from '../assets/Gemini_Generated_Image_idiu8widiu8widiu.jpeg';

export default function SplashScreen({ duration = 1000, onComplete }) {
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Bloquea el scroll del fondo mientras dura el splash
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Iniciar desvanecimiento a los 1000ms
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, duration);

    // Retirar del DOM una vez completada la transición CSS
    const removeTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = originalOverflow || '';
      if (onComplete) onComplete();
    }, duration + 350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = originalOverflow || '';
    };
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <aside className={`splash-screen ${fading ? 'splash-fading' : ''}`} aria-label="Cargando Serprove Vet">
      <div className="splash-glow" />
      <div className="splash-content">
        <div className="splash-logo-card">
          <img
            src={logoImg}
            alt="Serprove Logo"
            className="splash-logo-img"
          />
          <h1 className="splash-logo-title">
            SERPR<span className="splash-cross">+</span>VE
          </h1>
          <span className="splash-tagline">Insumos Veterinarios</span>
          <div className="splash-progress-track">
            <div className="splash-progress-bar" />
          </div>
        </div>
      </div>
    </aside>
  );
}
