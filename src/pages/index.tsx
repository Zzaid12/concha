// pages/index.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import Layout from '../components/Layout';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';

const FadeInWhenVisible = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_complete')
            .eq('id', user.id)
            .single();
          
          setIsProfileComplete(profile?.is_complete || false);
        }
      } catch (err) {
        console.error('Error checking user:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Layout>
      <div className="hero">
        <div className="hero-background">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
          <div className="gradient-orb gradient-orb-3" />
          <div className="hero-pattern" />
        </div>
        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="badge-icon">✨</span>
                <span className="badge-text">La plataforma líder en búsqueda de empleo</span>
              </motion.div>

              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Tu próxima oportunidad está aquí
              </motion.h1>
              
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Descubre las mejores oportunidades laborales y conecta con empresas que valoran tu talento.
              </motion.p>

              <motion.div
                className="hero-stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="stat-item">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Ofertas de trabajo</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Empresas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">5000+</span>
                  <span className="stat-label">Candidatos</span>
                </div>
              </motion.div>

              <motion.div
                className="hero-companies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <span className="companies-label">Empresas que confían en nosotros:</span>
                <div className="companies-logos">
                  <div className="company-logo">
                    <span>Empresa 1</span>
                  </div>
                  <div className="company-logo">
                    <span>Empresa 2</span>
                  </div>
                  <div className="company-logo">
                    <span>Empresa 3</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-image"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="image-container">
                <div className="main-illustration">
                  <Image 
                    src="/images/hero-illustration.svg" 
                    alt="Proyecto Marketing Platform" 
                    width={600} 
                    height={500}
                    priority
                  />
                </div>
                <div className="floating-card card-1">
                  <span className="card-icon">💼</span>
                  <span className="card-text">Ofertas destacadas</span>
                </div>
                <div className="floating-card card-2">
                  <span className="card-icon">🎯</span>
                  <span className="card-text">Match perfecto</span>
                </div>
                <div className="floating-card card-3">
                  <span className="card-icon">🚀</span>
                  <span className="card-text">Carrera profesional</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Características Principales */}
      <section className="features-section">
        <div className="container">
          <FadeInWhenVisible>
            <h2 className="section-title">
              ¿Por qué elegir Proyecto Marketing?
            </h2>
          </FadeInWhenVisible>

          <div className="features-grid">
            {[
              {
                icon: '🎯',
                title: 'Match Inteligente',
                description: 'Nuestro algoritmo analiza tu perfil y encuentra las ofertas que mejor se ajustan a tus habilidades.',
                image: '/images/feature-match.svg'
              },
              {
                icon: '📊',
                title: 'Análisis de Mercado',
                description: 'Obtén insights sobre salarios y tendencias del mercado laboral en tu sector.',
                image: '/images/feature-analytics.svg'
              },
              {
                icon: '🚀',
                title: 'Desarrollo Profesional',
                description: 'Accede a recursos y herramientas para impulsar tu carrera profesional.',
                image: '/images/feature-growth.svg'
              }
            ].map((feature, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.2}>
                <div className="feature-card">
                  <div className="feature-content">
                    <span className="feature-icon">{feature.icon}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    </div>
                  <motion.div 
                    className="feature-image"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={300}
                      height={200}
                    />
                  </motion.div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Proceso */}
      <section className="process-section">
        <div className="container">
          <FadeInWhenVisible>
            <h2 className="section-title">
              Tu camino al éxito profesional
            </h2>
          </FadeInWhenVisible>

          <div className="process-steps">
            {[
              {
                number: '01',
                title: 'Crea tu perfil',
                description: 'Registra tus habilidades, experiencia y preferencias laborales.',
                image: '/images/step-profile.svg'
              },
              {
                number: '02',
                title: 'Encuentra matches',
                description: 'Recibe recomendaciones personalizadas de ofertas de trabajo.',
                image: '/images/step-match.svg'
              },
              {
                number: '03',
                title: 'Aplica y conecta',
                description: 'Postúlate a las ofertas y conecta directamente con las empresas.',
                image: '/images/step-apply.svg'
              }
            ].map((step, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.3}>
                <div className="process-step">
                  <motion.div 
                    className="step-number"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {step.number}
                  </motion.div>
                  <motion.div 
                    className="step-image"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={400}
                      height={300}
                    />
                  </motion.div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </FadeInWhenVisible>
            ))}
              </div>
            </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="testimonials-section">
        <div className="container">
          <FadeInWhenVisible>
            <h2 className="section-title">
              Lo que dicen nuestros usuarios
            </h2>
          </FadeInWhenVisible>

          <div className="testimonials-grid">
            {[
              {
                avatar: '/images/avatar1.jpg',
                name: 'Alba Cañadas',
                position: 'Desarrolladora Frontend',
                company: 'TechCorp',
                testimonial: 'Gracias a Proyecto Marketing encontré mi trabajo ideal en menos de un mes. El proceso fue muy intuitivo y las recomendaciones fueron realmente precisas.'
              },
              {
                avatar: '/images/avatar2.jpg',
                name: 'Carlos Rodríguez',
                position: 'Product Manager',
                company: 'InnovateTech',
                testimonial: 'La plataforma me ayudó a encontrar oportunidades que realmente se ajustaban a mis habilidades y aspiraciones profesionales.'
              },
              {
                avatar: '/images/avatar3.jpg',
                name: 'Laura Martínez',
                position: 'UX Designer',
                company: 'DesignStudio',
                testimonial: 'El sistema de match inteligente me ahorró muchísimo tiempo en la búsqueda. Ahora tengo el trabajo de mis sueños.'
              }
            ].map((testimonial, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.2}>
                <motion.div 
                  className="testimonial-card"
                  whileHover={{ y: -10 }}
                >
                  <div className="testimonial-header">
                    <div className="avatar-placeholder">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="testimonial-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.position}</p>
                      <p className="company">{testimonial.company}</p>
              </div>
            </div>
                  <p className="testimonial-text">{testimonial.testimonial}</p>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Sección CTA */}
      <section className="cta-section">
        <div className="container">
          <FadeInWhenVisible>
            <div className="cta-content">
              <h2>¿Listo para dar el siguiente paso en tu carrera?</h2>
              <p>Únete a miles de profesionales que ya encontraron su trabajo ideal</p>
              <motion.button
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/register'}
              >
                Comenzar ahora
              </motion.button>
            </div>
          </FadeInWhenVisible>
          </div>
        </section>
    </Layout>
  );
}