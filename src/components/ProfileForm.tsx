import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';

// Campos requeridos para completar el perfil
export const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'country',
  'city',
  'bio',
  'skills',
  'languages',
  'portfolio_url'
];

// Interfaz para el perfil
export interface Profile {
  id?: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
  skills: string[];
  languages: string[];
  portfolio_url: string;
  linkedin_url?: string;
  github_url?: string;
  is_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProfileFormProps {
  userId: string;
  onProfileUpdate?: (profile: Profile) => void;
}

export default function ProfileForm({ userId, onProfileUpdate }: ProfileFormProps) {
  const [profile, setProfile] = useState<Profile>({
    user_id: userId,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    bio: '',
    skills: [],
    languages: [],
    portfolio_url: '',
    linkedin_url: '',
    github_url: '',
    is_complete: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [profileNotFound, setProfileNotFound] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setProfileNotFound(true);
        }
        throw error;
      }

      if (data) {
        setProfile(data);
        checkProfileCompletion(data);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setMessage('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const checkProfileCompletion = (profileData: Profile) => {
    const missing = REQUIRED_FIELDS.filter(field => {
      const value = profileData[field as keyof Profile];
      return !value || (Array.isArray(value) && value.length === 0);
    });
    setMissingFields(missing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const isComplete = missingFields.length === 0;
      const profileData = {
        ...profile,
        is_complete: isComplete,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      setMessage('Perfil guardado exitosamente');
      if (onProfileUpdate) {
        onProfileUpdate(profileData);
      }
    } catch (error) {
      console.error('Error guardando perfil:', error);
      setMessage('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    checkProfileCompletion({ ...profile, [name]: value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setProfile(prev => ({
      ...prev,
      skills
    }));
    checkProfileCompletion({ ...profile, skills });
  };

  const handleLanguageAdd = (language: string) => {
    if (language && !profile.languages.includes(language)) {
      const updatedLanguages = [...profile.languages, language];
      setProfile(prev => ({
        ...prev,
        languages: updatedLanguages
      }));
      checkProfileCompletion({ ...profile, languages: updatedLanguages });
    }
  };

  const handleLanguageRemove = (languageToRemove: string) => {
    const updatedLanguages = profile.languages.filter(lang => lang !== languageToRemove);
    setProfile(prev => ({
      ...prev,
      languages: updatedLanguages
    }));
    checkProfileCompletion({ ...profile, languages: updatedLanguages });
  };

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  if (profileNotFound) {
    return (
      <motion.div 
        className="profile-not-found"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Perfil no encontrado</h2>
        <p>No se encontró un perfil asociado a tu cuenta. Por favor, completa la información a continuación para crear tu perfil.</p>
        <motion.button
          className="create-profile-button"
          onClick={() => setProfileNotFound(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Crear Perfil
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="profile-form-container">
      {missingFields.length > 0 && (
        <motion.div 
          className="profile-completion-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="completion-info">
            <h3>¡Completa tu perfil!</h3>
            <p>Para mejorar tus oportunidades, completa los siguientes campos:</p>
            <ul className="missing-fields-list">
              {missingFields.map(field => (
                <motion.li
                  key={field}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {field.replace('_', ' ')}
                </motion.li>
              ))}
            </ul>
            <motion.button
              className="complete-profile-button"
              onClick={() => {
                const firstMissingField = document.getElementById(missingFields[0]);
                if (firstMissingField) {
                  firstMissingField.scrollIntoView({ behavior: 'smooth' });
                  firstMissingField.focus();
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Completar Perfil
            </motion.button>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">Nombre *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                className={missingFields.includes('first_name') ? 'missing-field' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Apellido *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                className={missingFields.includes('last_name') ? 'missing-field' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className={missingFields.includes('email') ? 'missing-field' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className={missingFields.includes('phone') ? 'missing-field' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">País *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={profile.country}
                onChange={handleChange}
                className={missingFields.includes('country') ? 'missing-field' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                className={missingFields.includes('city') ? 'missing-field' : ''}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Biografía y Habilidades</h3>
          <div className="form-group">
            <label htmlFor="bio">Biografía *</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className={missingFields.includes('bio') ? 'missing-field' : ''}
              rows={4}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="skills">Habilidades * (separadas por comas)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={profile.skills.join(', ')}
              onChange={handleSkillsChange}
              className={missingFields.includes('skills') ? 'missing-field' : ''}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Idiomas</h3>
          <div className="form-group">
            <div className="language-input">
              <input
                type="text"
                placeholder="Agregar idioma"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLanguageAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div className="languages-list">
              {profile.languages.map(language => (
                <div key={language} className="language-tag">
                  <span>{language}</span>
                  <button
                    type="button"
                    className="remove-language"
                    onClick={() => handleLanguageRemove(language)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Enlaces</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="portfolio_url">URL del Portfolio *</label>
              <input
                type="url"
                id="portfolio_url"
                name="portfolio_url"
                value={profile.portfolio_url}
                onChange={handleChange}
                className={missingFields.includes('portfolio_url') ? 'missing-field' : ''}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="linkedin_url">URL de LinkedIn</label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={profile.linkedin_url}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="github_url">URL de GitHub</label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={profile.github_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <motion.button
          type="submit"
          className="save-profile-button"
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? 'Guardando...' : 'Guardar Perfil'}
        </motion.button>
      </form>
    </div>
  );
}
