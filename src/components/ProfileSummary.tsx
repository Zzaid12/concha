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
          <p><strong>Nombre:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Email:</strong> {profile.email || 'No especificado'}</p>
          <p><strong>Rol:</strong> {profile.role}</p>
          {profile.country && <p><strong>País:</strong> {profile.country}</p>}
          {profile.city && <p><strong>Ciudad:</strong> {profile.city}</p>}
          {profile.bio && <p><strong>Biografía:</strong> {profile.bio}</p>}
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
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="social-link">
                Portfolio
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="social-link">
                GitHub
              </a>
            )}
            {!profile.portfolio_url && !profile.linkedin_url && !profile.github_url && (
              <p>No hay enlaces disponibles</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-summary {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        @media (min-width: 768px) {
          .profile-summary {
            padding: 2rem;
          }
        }

        .profile-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .profile-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
        }

        .profile-header h2 {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.4;
        }

        @media (min-width: 768px) {
          .profile-header h2 {
            font-size: 1.5rem;
          }
        }

        .edit-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
          width: 100%;
        }

        .edit-button:hover {
          background: #0060df;
        }

        @media (min-width: 768px) {
          .edit-button {
            width: auto;
            padding: 0.75rem 1.5rem;
          }
        }

        .profile-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .profile-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .profile-section:first-child {
            grid-column: 1 / 3;
          }
        }

        .profile-section {
          margin-bottom: 1.5rem;
        }

        .profile-section:last-child {
          margin-bottom: 0;
        }

        .profile-section h3 {
          color: #333;
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
        }

        @media (min-width: 768px) {
          .profile-section h3 {
            margin-bottom: 1rem;
            font-size: 1.2rem;
          }
        }

        .profile-section p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        @media (min-width: 768px) {
          .profile-section p {
            font-size: 1rem;
          }
        }

        .languages-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .language-tag {
          background: #f0f0f0;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
        }

        @media (min-width: 768px) {
          .language-tag {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }

        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }

        .social-link {
          color: #0070f3;
          text-decoration: none;
          padding: 0.5rem 1rem;
          background: rgba(0, 112, 243, 0.1);
          border-radius: 8px;
          transition: background 0.2s;
          font-size: 0.9rem;
        }

        .social-link:hover {
          background: rgba(0, 112, 243, 0.2);
        }

        .social-links p {
          margin: 0;
        }
      `}</style>
    </motion.div>
  );
} 