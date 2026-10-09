import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';

// Simple hash function for password storage
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'serprove_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [lastAttemptTime, setLastAttemptTime] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Show session expired message
  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message);
    }
  }, [location]);

  // Check if locked
  useEffect(() => {
    const lockEnd = localStorage.getItem('loginLockedUntil');
    if (lockEnd && Date.now() < parseInt(lockEnd)) {
      setLockedUntil(parseInt(lockEnd));
    }
  }, []);

  // Countdown timer for locked state
  useEffect(() => {
    if (lockedUntil) {
      const interval = setInterval(() => {
        if (Date.now() >= lockedUntil) {
          setLockedUntil(null);
          localStorage.removeItem('loginLockedUntil');
          setAttempts(0);
          setError('');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockedUntil]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Demasiados intentos. Intenta en ${remaining} segundos.`);
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Get stored users
      const users = JSON.parse(localStorage.getItem('serprove_users') || '[]');
      const hashedInput = await hashPassword(password);
      
      // Find user with matching username and password
      const validUser = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === hashedInput
      );

      // Fallback for default admin (if no users registered yet)
      const isDefaultAdmin = username.toLowerCase() === 'admin' && password === 'admin123';
      const isFirstUser = users.length === 0 && isDefaultAdmin;

      if (validUser || isFirstUser) {
        // Generate session token
        const sessionToken = await hashPassword(Date.now().toString() + username);
        const sessionData = {
          username: validUser?.username || username,
          loginTime: Date.now(),
          expiresAt: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000), // 7 days or 30 min
          token: sessionToken
        };
        
        localStorage.setItem('serprove_session', JSON.stringify(sessionData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
        
        // Reset attempts on success
        setAttempts(0);
        setIsLoading(false);
        toast.success(`¡Bienvenido, ${validUser?.username || username}!`);
        navigate('/admin');
      } else {
        // Failed attempt
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setLastAttemptTime(Date.now());
        
        if (newAttempts >= 5) {
          // Lock for 5 minutes
          const lockTime = Date.now() + 5 * 60 * 1000;
          setLockedUntil(lockTime);
          localStorage.setItem('loginLockedUntil', lockTime.toString());
          setError(`Demasiados intentos fallidos. Bloqueado por 5 minutos.`);
        } else {
          const remaining = 5 - newAttempts;
          setError(`Contraseña incorrecta. Te quedan ${remaining} intentos.`);
        }
        setIsLoading(false);
      }
    } catch (err) {
      setError('Error al intentar iniciar sesión.');
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '' };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    
    const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
    return { strength, label: labels[strength] || 'Muy débil' };
  };

  const passwordStrength = getPasswordStrength(password);

  const lockTimeRemaining = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '420px', position: 'relative' }}>
        
        {/* Security indicator */}
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
            Conexión segura SSL
          </span>
        </div>

        <div className="text-center" style={{ marginBottom: '32px' }}>
          <h2 className="logo" style={{ justifyContent: 'center', marginBottom: '8px' }}>
            SERPR<span>+</span>VE
          </h2>
          <p style={{ color: 'var(--color-text-light)' }}>Panel de Administración</p>
        </div>
        
        {lockedUntil && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #fee2e2'
          }}>
            <AlertTriangle size={20} style={{ color: '#dc2626' }} />
            <div>
              <p style={{ color: '#dc2626', fontWeight: '600', margin: 0 }}>Sesión bloqueada</p>
              <p style={{ color: '#991b1b', fontSize: '0.85rem', margin: '4px 0 0' }}>
                Intentá en {lockTimeRemaining} segundos
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={lockedUntil || isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #bbb',
                fontSize: '1rem'
              }}
              placeholder="Tu nombre de usuario"
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={lockedUntil || isLoading}
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #bbb',
                  fontSize: '1rem'
                }}
                placeholder="Tu contraseña"
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
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} style={{
                      height: '4px',
                      flex: 1,
                      borderRadius: '2px',
                      backgroundColor: i <= passwordStrength.strength 
                        ? passwordStrength.strength <= 2 ? '#ef4444' 
                          : passwordStrength.strength <= 4 ? '#f59e0b' 
                          : '#22c55e'
                        : '#e0e0e0'
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: passwordStrength.strength <= 2 ? '#ef4444' : passwordStrength.strength <= 4 ? '#f59e0b' : '#22c55e' }}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Recordarme</span>
            </label>
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--color-primary)', 
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          {error && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fee2e2',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
              <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: 0 }}>{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={lockedUntil || isLoading}
            style={{ 
              width: '100%', 
              opacity: (lockedUntil || isLoading) ? 0.7 : 1,
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
                Verificando...
              </>
            ) : (
              <>
                <Lock size={18} /> Ingresar
              </>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          paddingTop: '24px', 
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '12px' }}>
            ¿No tenés cuenta?
          </p>
          <button 
            onClick={() => navigate('/register')} 
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            Crear Cuenta
          </button>
        </div>

        <div className="text-center" style={{ marginTop: '16px' }}>
          <button onClick={() => navigate('/')} className="btn btn-outline" style={{ width: '100%' }}>
            Volver a la Web
          </button>
        </div>

        {/* Login attempts indicator */}
        {attempts > 0 && !lockedUntil && (
          <div style={{ 
            marginTop: '16px', 
            textAlign: 'center',
            fontSize: '0.8rem',
            color: attempts >= 3 ? '#dc2626' : 'var(--color-text-light)'
          }}>
            Intentos: {attempts}/5
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Login;
