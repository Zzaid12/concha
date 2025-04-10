import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  // Cerrar el menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Verificar si el perfil está completo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error al obtener el perfil:', profileError);
          return;
        }
        
        setIsProfileComplete(profile?.is_complete || false);
        setUserRole(profile?.role || null);
      }
    } catch (err) {
      console.error('Error al verificar el usuario:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setIsProfileComplete(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
      <nav>
        <Link href="/" className="logo">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Proyecto Marketing
          </motion.span>
        </Link>

        {/* Hamburger menu button (mobile only) */}
        <button 
          className="mobile-menu-button" 
          onClick={toggleMobileMenu}
          aria-label="Menú principal"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Desktop and mobile menu */}
        <AnimatePresence>
          <motion.div 
            className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {user ? (
              <>
                <Link href="/jobs" className="nav-link">
                  Ver Ofertas
                </Link>
                {userRole === 'admin' && (
                  <Link href="/admin" className="nav-link">
                    Panel de Admin
                  </Link>
                )}
                <div className="nav-right">
                  {!isProfileComplete && userRole !== 'admin' && (
                    <Link href="/profile" className="nav-link warning">
                      <span className="warning-icon">⚠️</span>
                      Completar Perfil
                    </Link>
                  )}
                  {userRole !== 'admin' && (
                    <Link href="/profile" className="nav-button secondary">
                      Mi Perfil
                    </Link>
                  )}
                  <motion.button
                    onClick={handleLogout}
                    className="nav-button outline"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cerrar Sesión
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="nav-right">
                <Link href="/login" className="nav-button secondary">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="nav-button primary">
                  Registrarse
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </nav>

      <style jsx>{`
        header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 0.5rem 1rem;
          background: transparent;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        header.scrolled {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          text-decoration: none;
          z-index: 10;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        /* Mobile menu button */
        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          width: 40px;
          height: 40px;
          position: relative;
          z-index: 20;
        }

        .menu-icon {
          position: relative;
          display: block;
          width: 24px;
          height: 2px;
          background: #333;
          margin: 0 auto;
          transition: all 0.3s;
        }

        .menu-icon::before,
        .menu-icon::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 2px;
          background: #333;
          left: 0;
          transition: all 0.3s;
        }

        .menu-icon::before {
          top: -8px;
        }

        .menu-icon::after {
          bottom: -8px;
        }

        .menu-icon.open {
          background: transparent;
        }

        .menu-icon.open::before {
          transform: rotate(45deg);
          top: 0;
        }

        .menu-icon.open::after {
          transform: rotate(-45deg);
          bottom: 0;
        }

        .nav-link {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .nav-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          font-family: inherit;
          font-size: 1rem;
        }

        .nav-button.primary {
          background: #4f46e5;
          color: white;
        }

        .nav-button.primary:hover {
          background: #4338ca;
        }

        .nav-button.secondary {
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
        }

        .nav-button.secondary:hover {
          background: rgba(79, 70, 229, 0.2);
        }

        .nav-button.outline {
          background: transparent;
          color: #333;
          border: 1px solid #ddd;
        }

        .nav-button.outline:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .warning {
          color: #f59e0b;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .warning-icon {
          font-size: 1.25rem;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: block;
          }

          .nav-links {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            flex-direction: column;
            justify-content: center;
            gap: 2rem;
            background: white;
            padding: 1rem;
            transform: translateX(100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .nav-links.mobile-open {
            transform: translateX(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-right {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
            margin-top: 1rem;
          }

          .nav-button, .nav-link {
            width: 100%;
            text-align: center;
            padding: 0.75rem 1rem;
          }

          header.menu-open {
            background: white;
          }
        }
      `}</style>
    </header>
  );
}
