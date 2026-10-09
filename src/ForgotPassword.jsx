import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, ArrowLeft, Mail, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'serprove_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: security question, 3: new password
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const navigate = useNavigate();

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

  const handleSearchUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresá tu email.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = JSON.parse(localStorage.getItem('serprove_users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        setFoundUser(user);
        setSecurityQuestion(user.securityQuestion || '');
        setStep(2);
      } else {
        setError('No encontramos una cuenta con ese email.');
      }
    } catch (err) {
      setError('Error al buscar la cuenta.');
    }
    
    setIsLoading(false);
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setError('');

    if (!securityAnswer.trim()) {
      setError('Ingresá tu respuesta.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const hashedAnswer = await hashPassword(securityAnswer.toLowerCase());
      
      if (hashedAnswer === foundUser.securityAnswer) {
        setStep(3);
      } else {
        setError('Respuesta incorrecta. Intentá de nuevo.');
      }
    } catch (err) {
      setError('Error al verificar. Intentá de nuevo.');
    }
    
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (getPasswordStrength(newPassword).strength < 4) {
      setError('La contraseña es muy débil.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem('serprove_users') || '[]');
      const userIndex = users.findIndex(u => u.id === foundUser.id);
      
      if (userIndex !== -1) {
        const hashedPassword = await hashPassword(newPassword);
        users[userIndex].password = hashedPassword;
        localStorage.setItem('serprove_users', JSON.stringify(users));
        setSuccess(true);
        toast.success('¡Contraseña restablecida exitosamente!');
        
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Error al actualizar la contraseña.');
      }
    } catch (err) {
      setError('Error al restablecer la contraseña.');
    }
    
    setIsLoading(false);
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const questionLabels = {
    mascota: '¿Cómo se llama tu primera mascota?',
    ciudad: '¿En qué ciudad naciste?',
    escuela: '¿Cómo se llamaba tu escuela primaria?',
    color: '¿Cuál es tu color favorito?'
  };

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
          <h2 style={{ marginBottom: '12px', color: '#16a34a' }}>¡Contraseña Restablecida!</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>
            Ya podés iniciar sesión con tu nueva contraseña.
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
      <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '420px' }}>
        
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

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '24px',
          padding: '10px 14px',
          backgroundColor: '#fef3c7',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #fde68a'
        }}>
          <AlertTriangle size={18} style={{ color: '#d97706' }} />
          <span style={{ fontSize: '0.8rem', color: '#92400e' }}>
            Solo funciona para cuentas creadas en este navegador
          </span>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '8px' }}>
            {step === 1 && 'Recuperar Cuenta'}
            {step === 2 && 'Pregunta de Seguridad'}
            {step === 3 && 'Nueva Contraseña'}
          </h2>
          <p style={{ color: 'var(--color-text-light)' }}>
            {step === 1 && 'Ingresá el email asociado a tu cuenta'}
            {step === 2 && `Respondé la pregunta de seguridad de ${foundUser?.username}`}
            {step === 3 && 'Creá una nueva contraseña segura'}
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: s <= step ? 'var(--color-primary)' : '#e0e0e0',
              transition: 'background-color 0.3s'
            }} />
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSearchUser}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500' }}>
                <Mail size={16} /> Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Buscando...' : 'Buscar Cuenta'}
            </button>
          </form>
        )}

        {/* Step 2: Security Question */}
        {step === 2 && (
          <form onSubmit={handleVerifyAnswer}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'var(--color-bg)', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px'
            }}>
              <p style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--color-secondary)' }}>
                {questionLabels[foundUser?.securityQuestion] || 'Pregunta de seguridad'}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Tu Respuesta
              </label>
              <input 
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #bbb',
                  fontSize: '1rem'
                }}
                placeholder="Respondé la pregunta"
              />
            </div>

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

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Verificando...' : 'Verificar Respuesta'}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '500' }}>
                <Lock size={16} /> Nueva Contraseña
              </label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #bbb',
                  fontSize: '1rem'
                }}
                placeholder="Mínimo 8 caracteres"
              />
              {newPassword && (
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
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Confirmar Contraseña
              </label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: confirmPassword && newPassword !== confirmPassword ? '1px solid #ef4444' : '1px solid #bbb',
                  fontSize: '1rem'
                }}
                placeholder="Repetí la nueva contraseña"
              />
            </div>

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

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Guardando...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}

        <div className="text-center" style={{ marginTop: '20px' }}>
          <p style={{ color: 'var(--color-text-light)' }}>
            ¿Recordaste tu contraseña? 
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
      </div>
    </div>
  );
}

export default ForgotPassword;
