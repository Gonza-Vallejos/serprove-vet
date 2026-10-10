import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Check, X, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from './supabaseClient';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    
    if (strength <= 2) return { strength, label: 'Muy débil', color: '#ef4444' };
    if (strength <= 3) return { strength, label: 'Débil', color: '#f97316' };
    if (strength <= 4) return { strength, label: 'Regular', color: '#eab308' };
    if (strength <= 5) return { strength, label: 'Buena', color: '#22c55e' };
    return { strength, label: 'Muy fuerte', color: '#16a34a' };
  };

  const passwordRequirements = [
    { test: formData.password.length >= 8, label: 'Mínimo 8 caracteres' },
    { test: /[A-Z]/.test(formData.password), label: 'Una letra mayúscula' },
    { test: /[a-z]/.test(formData.password), label: 'Una letra minúscula' },
    { test: /[0-9]/.test(formData.password), label: 'Un número' },
    { test: /[^A-Za-z0-9]/.test(formData.password), label: 'Un carácter especial' }
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    if (formData.username.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Ingresá un email válido.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (getPasswordStrength(formData.password).strength < 4) {
      setError('La contraseña es muy débil. Usá al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      setIsLoading(false);
      toast.success('¡Cuenta creada exitosamente!');

      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('El email ya está registrado.');
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.');
      }
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '20px' }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-lg)', 
          width: '100%', 
          maxWidth: '420px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Check size={32} style={{ color: '#22c55e' }} />
          </div>
          <h2 style={{ marginBottom: '12px', color: '#16a34a' }}>¡Cuenta creada!</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>
            Ya podés iniciar sesión con tus credenciales.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            Redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '480px' }}>
        
        <button 
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--color-text-light)',
            marginBottom: '20px',
            padding: '0'
          }}
        >
          <ArrowLeft size={18} /> Volver al login
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '8px' }}>Crear Cuenta</h2>
          <p style={{ color: 'var(--color-text-light)' }}>Registrate para acceder al panel de administración</p>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '24px',
          padding: '10px 14px',
          backgroundColor: '#f0f9ff',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #e0f2fe'
        }}>
          <Shield size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.8rem', color: '#0369a1' }}>
            Tus datos están protegidos con encriptación SHA-256
          </span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500' }}>
              <User size={16} /> Usuario
            </label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid #bbb',
                fontSize: '1rem'
              }}
              placeholder="Mínimo 3 caracteres"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500' }}>
              <Mail size={16} /> Email
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid #bbb',
                fontSize: '1rem'
              }}
              placeholder="tu@email.com"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500' }}>
              <Lock size={16} /> Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '12px 45px 12px 14px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid #bbb',
                  fontSize: '1rem'
                }}
                placeholder="Creá una contraseña segura"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-light)',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {formData.password && (
              <>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} style={{
                      height: '4px',
                      flex: 1,
                      borderRadius: '2px',
                      backgroundColor: i <= passwordStrength.strength ? passwordStrength.color : '#e0e0e0'
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: passwordStrength.color, marginTop: '4px' }}>
                  {passwordStrength.label}
                </p>
              </>
            )}

            {/* Password requirements */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {passwordRequirements.map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {req.test ? (
                    <Check size={14} style={{ color: '#22c55e' }} />
                  ) : (
                    <X size={14} style={{ color: '#d1d5db' }} />
                  )}
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: req.test ? '#16a34a' : '#9ca3af'
                  }}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500' }}>
              <Lock size={16} /> Confirmar Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '12px 45px 12px 14px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? '1px solid #ef4444' 
                    : '1px solid #e0e0e0',
                  fontSize: '1rem'
                }}
                placeholder="Repetí la contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-light)',
                  padding: '4px'
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Pregunta de Seguridad (para recuperar tu cuenta)
            </label>
            <div style={{ position: 'relative' }}>
              <select
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  cursor: 'pointer',
                  color: formData.securityQuestion ? '#333' : '#999'
                }}
              >
                <option value="">Seleccioná una pregunta...</option>
                <option value="mascota">¿Cómo se llama tu primera mascota?</option>
                <option value="ciudad">¿En qué ciudad naciste?</option>
                <option value="escuela">¿Cómo se llamaba tu escuela primaria?</option>
                <option value="color">¿Cuál es tu color favorito?</option>
              </select>
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#666'
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 4l4 4 4-4" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {formData.securityQuestion && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Tu Respuesta
              </label>
              <input 
                type="text"
                name="securityAnswer"
                value={formData.securityAnswer}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid #bbb',
                  fontSize: '1rem'
                }}
                placeholder="Tu respuesta secreta"
              />
            </div>
          )}
          
          {error && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fee2e2',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: 0 }}>{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  border: '2px solid white', 
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '20px' }}>
          <p style={{ color: 'var(--color-text-light)' }}>
            ¿Ya tenés cuenta? 
            <button 
              onClick={() => navigate('/login')} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--color-primary)', 
                cursor: 'pointer',
                fontWeight: '600',
                marginLeft: '4px'
              }}
            >
              Iniciar Sesión
            </button>
          </p>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Register;
