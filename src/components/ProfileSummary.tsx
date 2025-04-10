import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Profile, REQUIRED_FIELDS } from './ProfileForm';

interface ProfileSummaryProps {
  profile: Profile | null;
  onEdit: () => void;
}

export default function ProfileSummary({ profile, onEdit }: ProfileSummaryProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!profile) {
      setIsComplete(false);
      return;
    }
    
    const missing = REQUIRED_FIELDS.filter(field => {
      const value = profile[field as keyof Profile];
      if (Array.isArray(value)) {
        return value.length === 0;
      } 
      return !value;
    });
    
    setIsComplete(missing.length === 0);
    
  }, [profile]);

  if (!profile) {
    return <div>No hay datos del perfil disponibles</div>;
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const location = [profile.city, profile.country].filter(Boolean).join(', ');

  return (
    <motion.div 
      className="profile-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-header">
        <h2>Resumen del Perfil {isComplete ? '(Completo)' : '(Incompleto)'}</h2>
        <button onClick={onEdit} className="edit-button">
          Editar Perfil
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Información Personal</h3>
          <p><strong>Nombre:</strong> {fullName || 'No especificado'}</p>
          <p><strong>Email:</strong> {profile.email || 'No especificado'}</p>
          <p><strong>Teléfono:</strong> {profile.phone || 'No especificado'}</p>
          <p><strong>Ubicación:</strong> {location || 'No especificado'}</p>
          {profile.age !== undefined && profile.age !== null && <p><strong>Edad:</strong> {profile.age}</p>}
          {profile.gender && <p><strong>Género:</strong> {profile.gender}</p>}
        </div>

        <div className="profile-section">
          <h3>Idiomas</h3>
          <div className="languages-list">
            {(profile.languages && profile.languages.length > 0) ? (
              profile.languages.map((language: string, index: number) => ( 
                <span key={index} className="language-tag">{language}</span>
              ))
            ) : (
              <p>No especificado</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Enlaces</h3>
          <div className="social-links">
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                Portfolio
              </a>
            )}
            {profile.instagram_profile && (
              <a href={`https://instagram.com/${profile.instagram_profile}`} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {profile.tiktok_profile && (
              <a href={`https://tiktok.com/@${profile.tiktok_profile}`} target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
            )}
            {!profile.portfolio_url && !profile.instagram_profile && !profile.tiktok_profile && (
                 <p>No hay enlaces disponibles</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-summary {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .edit-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .profile-section {
          margin-bottom: 2rem;
        }

        .profile-section:last-child {
          margin-bottom: 0;
        }

        .profile-section h3 {
          color: #333;
          margin-bottom: 1rem;
        }

        .languages-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .language-tag {
          background: #f0f0f0;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .social-links a {
          color: #0070f3;
          text-decoration: none;
        }

        .social-links a:hover {
          text-decoration: underline;
        }

        .social-links p {
          margin: 0;
        }
      `}</style>
    </motion.div>
  );
} 