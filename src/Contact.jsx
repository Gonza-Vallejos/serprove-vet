import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Argentina from '@react-map/argentina';
import Navbar from './components/Navbar';

function Contact({ settings }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'whatsapp'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (settings?.global_primaryColor) {
      document.documentElement.style.setProperty('--color-primary', settings.global_primaryColor);
    }
  }, [settings]);

  const coverageProvinces = (settings?.coverage_provinces || 'Chaco, Corrientes, Misiones, Formosa')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const cityColors = {};
  coverageProvinces.forEach(prov => {
    cityColors[prov] = 'var(--color-primary)';
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Completá todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const whatsappMessage = formData.contactMethod === 'whatsapp'
      ? `*Nuevo mensaje de contacto*\n\n👤 *Nombre:* ${formData.name}\n📧 *Email:* ${formData.email}\n📱 *Teléfono:* ${formData.phone || 'No proporcionado'}\n📝 *Consulta:* ${formData.message}`
      : null;

    const emailSubject = encodeURIComponent(formData.subject || 'Contacto desde Serprove');
    const emailBody = encodeURIComponent(
      `Nombre: ${formData.name}\nEmail: ${formData.email}\nTeléfono: ${formData.phone || 'No proporcionado'}\n\nMensaje:\n${formData.message}`
    );

    if (formData.contactMethod === 'whatsapp' && settings?.global_whatsappPhone) {
      const whatsappUrl = `https://api.whatsapp.com/send?phone=54${settings.global_whatsappPhone}&text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      window.location.href = `mailto:${settings?.contact_email || 'contacto@serprove.com'}?subject=${emailSubject}&body=${emailBody}`;
    }

    setSubmitted(true);
    setIsSubmitting(false);
    toast.success('¡Mensaje enviado correctamente!');
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ 
            background: 'white', 
            padding: isMobile ? '32px 20px' : '48px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ marginBottom: '12px', color: '#16a34a' }}>¡Mensaje enviado!</h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>
              {formData.contactMethod === 'whatsapp' 
                ? 'Te redireccionamos a WhatsApp para completar el envío.'
                : 'Tu email se abrió con el mensaje cargado.'}
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Navbar */}
      <Navbar settings={settings} />

      {/* Hero */}
      <section style={{ 
        background: `linear-gradient(135deg, var(--color-primary) 0%, #C2185B 100%)`,
        padding: isMobile ? '32px 16px' : '48px 20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ color: 'white', marginBottom: '10px', fontSize: isMobile ? '1.8rem' : '2.5rem' }}>Contactanos</h1>
          <p style={{ opacity: 0.9, fontSize: isMobile ? '0.95rem' : '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            Estamos para ayudarte. Completá el formulario o contactanos directamente.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section style={{ padding: isMobile ? '24px 12px' : '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : '40px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Contact Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settings?.contact_phone && (
                <InfoCard icon={<Phone size={20} />} label="Teléfono" value={settings.contact_phone} isMobile={isMobile} />
              )}
              {settings?.contact_email && (
                <InfoCard icon={<Mail size={20} />} label="Email" value={settings.contact_email} isMobile={isMobile} />
              )}
              {settings?.contact_address && (
                <InfoCard icon={<MapPin size={20} />} label="Dirección" value={settings.contact_address} isMobile={isMobile} />
              )}
              {settings?.contact_schedule && (
                <InfoCard icon={<Clock size={20} />} label="Horarios" value={settings.contact_schedule} isMobile={isMobile} />
              )}
            </div>

            {/* Map */}
            <div style={{ 
              background: 'white', 
              padding: isMobile ? '16px' : '24px', 
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ marginBottom: '8px', fontSize: isMobile ? '0.95rem' : '1.1rem' }}>Zona de Cobertura</h3>
              <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.85rem' }}>
                Operamos en las siguientes provincias del norte argentino:
              </p>

              {/* Map SVG */}
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: '12px',
                padding: isMobile ? '12px 4px' : '16px 8px',
                overflow: 'hidden'
              }}>
                <Argentina 
                  type="select-single"
                  size={isMobile ? 280 : 350}
                  mapColor="#cbd5e1"
                  strokeColor="#ffffff"
                  strokeWidth={1}
                  disableClick={true}
                  disableHover={true}
                  cityColors={cityColors}
                />

                {/* Legend */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {coverageProvinces.map((prov, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{prov}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <div style={{ 
              background: 'white', 
              padding: isMobile ? '20px' : '32px', 
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ marginBottom: '8px', fontSize: isMobile ? '1.2rem' : '1.4rem' }}>Envianos un mensaje</h2>
              <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.9rem' }}>
                Completá el formulario y te responderemos a la brevedad.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>
                    Nombre completo *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                      style={{ ...inputStyle, paddingLeft: '38px' }} placeholder="Tu nombre" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Email *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required
                        style={{ ...inputStyle, paddingLeft: '38px' }} placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Teléfono</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        style={{ ...inputStyle, paddingLeft: '38px' }} placeholder="+54 9 ..." />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Asunto</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange}
                    style={inputStyle} placeholder="Motivo de tu consulta" />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Mensaje *</label>
                  <div style={{ position: 'relative' }}>
                    <MessageSquare size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#999' }} />
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={4}
                      style={{ ...inputStyle, paddingLeft: '38px', resize: 'vertical', minHeight: '100px' }}
                      placeholder="Escribí tu mensaje aquí..." />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                    Preferí que te respondamos por:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setFormData({ ...formData, contactMethod: 'whatsapp' })}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px',
                        border: formData.contactMethod === 'whatsapp' ? 'none' : '1px solid #e0e0e0',
                        background: formData.contactMethod === 'whatsapp' ? 'var(--color-primary)' : 'white',
                        color: formData.contactMethod === 'whatsapp' ? 'white' : '#333',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', fontWeight: '500', fontSize: '0.9rem', transition: 'all 0.2s'
                      }}>
                      <MessageCircle size={16} /> WhatsApp
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, contactMethod: 'email' })}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px',
                        border: formData.contactMethod === 'email' ? 'none' : '1px solid #e0e0e0',
                        background: formData.contactMethod === 'email' ? 'var(--color-primary)' : 'white',
                        color: formData.contactMethod === 'email' ? 'white' : '#333',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', fontWeight: '500', fontSize: '0.9rem', transition: 'all 0.2s'
                      }}>
                      <Mail size={16} /> Email
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting}
                  style={{
                    padding: '14px', fontSize: '1rem', fontWeight: '600',
                    background: isSubmitting ? '#f0a0b4' : 'var(--color-primary)', color: 'white',
                    border: 'none', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s'
                  }}>
                  {isSubmitting ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Enviando...
                    </>
                  ) : (
                    <><Send size={16} /> Enviar Mensaje</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a2e', color: 'white', padding: '24px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
            © {new Date().getFullYear()} Serprove. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #bbb',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: 'white'
};

function InfoCard({ icon, label, value, isMobile }) {
  return (
    <div style={{
      background: 'white',
      padding: isMobile ? '14px' : '16px',
      borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{ backgroundColor: 'rgba(233,30,99,0.1)', padding: '10px', borderRadius: '10px', flexShrink: 0 }}>
        <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontWeight: '600', margin: 0, fontSize: '0.85rem' }}>{label}</p>
        <p style={{ color: '#666', margin: '3px 0 0', fontSize: '0.9rem' }}>{value}</p>
      </div>
    </div>
  );
}

export default Contact;
