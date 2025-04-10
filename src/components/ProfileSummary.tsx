import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { Profile } from './ProfileForm';

interface ProfileSummaryProps {
  userId: string;
  onEdit: () => void;
}

const ProfileSummary = ({ userId, onEdit }: ProfileSummaryProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <h3>Perfil no encontrado</h3>
        <p>No se pudo cargar la información del perfil.</p>
      </div>
    );
  }

  return (
    <div className="profile-summary">
      <div className="profile-header">
        <h2>Mi Perfil</h2>
        <motion.button
          className="edit-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
        >
          Editar Perfil
        </motion.button>
      </div>

      <div className="profile-info">
        <div className="info-section">
          <h3>Información Personal</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Nombre Completo</span>
              <span className="value">{profile.full_name || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{profile.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Teléfono</span>
              <span className="value">{profile.phone || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Información Profesional</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Empresa</span>
              <span className="value">{profile.company || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="label">Cargo</span>
              <span className="value">{profile.position || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="label">Industria</span>
              <span className="value">{profile.industry || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="label">Ubicación</span>
              <span className="value">{profile.location || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Enlaces</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">LinkedIn</span>
              <span className="value">
                {profile.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    Ver Perfil
                  </a>
                ) : (
                  'No especificado'
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Sitio Web</span>
              <span className="value">
                {profile.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    Visitar Sitio
                  </a>
                ) : (
                  'No especificado'
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Biografía</h3>
          <p className="bio-text">{profile.bio || 'No hay biografía disponible.'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary; 