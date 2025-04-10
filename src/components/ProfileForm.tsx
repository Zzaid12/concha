import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';

// Campos requeridos para completar el perfil (ajustar según sea necesario)
export const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'country',
  'city',
  'languages',
  'portfolio_url'
];

// Interfaz para el perfil
export interface Profile {
  user_id: string; // Clave foránea a auth.users.id
  email: string;
  role?: string;
  created_at?: string; // timestamp
  first_name?: string;
  last_name?: string;
  phone?: string;
  age?: number;
  gender?: string;
  country?: string;
  city?: string;
  languages?: string[]; // _text (array of text)
  instagram_profile?: string;
  tiktok_profile?: string;
  portfolio_url?: string;
}

interface ProfileFormProps {
  profile: Profile | null;
  onSuccess: () => void;
}

export default function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const [profileData, setProfileData] = useState<Profile>({
    user_id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    country: '',
    city: '',
    languages: [],
    portfolio_url: '',
    instagram_profile: '',
    tiktok_profile: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [profileNotFound, setProfileNotFound] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileData({
        user_id: profile.user_id,
        email: profile.email,
        role: profile.role || '',
        created_at: profile.created_at,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        age: profile.age,
        gender: profile.gender || '',
        country: profile.country || '',
        city: profile.city || '',
        languages: profile.languages || [],
        instagram_profile: profile.instagram_profile || '',
        tiktok_profile: profile.tiktok_profile || '',
        portfolio_url: profile.portfolio_url || '',
      });
      checkProfileCompletion(profile);
    }
    setLoading(false);
  }, [profile]);

  const checkProfileCompletion = (currentProfileData: Profile) => {
    const missing = REQUIRED_FIELDS.filter(field => {
      const value = currentProfileData[field as keyof Profile];
      if (Array.isArray(value)) {
        return value.length === 0;
      } 
      return !value;
    });
    setMissingFields(missing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    checkProfileCompletion(profileData);
    const isComplete = missingFields.length === 0;

    try {
      const dataToSave = {
        ...profileData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(dataToSave, { onConflict: 'user_id' });

      if (error) throw error;

      setMessage('Perfil guardado exitosamente');
      if (onSuccess) {
        onSuccess();
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
    const processedValue = name === 'age' ? (value === '' ? undefined : parseInt(value, 10)) : value;
    
    setProfileData(prev => {
      const updatedData = { ...prev, [name]: processedValue };
      checkProfileCompletion(updatedData);
      return updatedData;
    });
  };

  const handleLanguageAdd = (language: string) => {
    if (language && !(profileData.languages || []).includes(language)) {
      const updatedLanguages = [...(profileData.languages || []), language];
      setProfileData(prev => {
        const updatedData = { ...prev, languages: updatedLanguages };
        checkProfileCompletion(updatedData);
        return updatedData;
      });
    }
  };

  const handleLanguageRemove = (languageToRemove: string) => {
    const updatedLanguages = (profileData.languages || []).filter(lang => lang !== languageToRemove);
    setProfileData(prev => {
      const updatedData = { ...prev, languages: updatedLanguages };
      checkProfileCompletion(updatedData);
      return updatedData;
    });
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

      <form onSubmit={handleSubmit} className="profile-form space-y-6">
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">Nombre {REQUIRED_FIELDS.includes('first_name') ? '*' : ''}</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profileData.first_name || ''} 
                onChange={handleChange}
                className={missingFields.includes('first_name') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('first_name')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Apellido {REQUIRED_FIELDS.includes('last_name') ? '*' : ''}</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profileData.last_name || ''}
                onChange={handleChange}
                className={missingFields.includes('last_name') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('last_name')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email {REQUIRED_FIELDS.includes('email') ? '*' : ''}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email || ''} 
                onChange={handleChange}
                className={missingFields.includes('email') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('email')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono {REQUIRED_FIELDS.includes('phone') ? '*' : ''}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone || ''} 
                onChange={handleChange}
                className={missingFields.includes('phone') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('phone')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Edad {REQUIRED_FIELDS.includes('age') ? '*' : ''}</label>
              <input
                type="number"
                id="age"
                name="age"
                value={profileData.age || ''} 
                onChange={handleChange}
                className={missingFields.includes('age') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('age')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Género {REQUIRED_FIELDS.includes('gender') ? '*' : ''}</label>
              <input
                type="text"
                id="gender"
                name="gender"
                value={profileData.gender || ''} 
                onChange={handleChange}
                className={missingFields.includes('gender') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('gender')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">País {REQUIRED_FIELDS.includes('country') ? '*' : ''}</label>
              <input
                type="text"
                id="country"
                name="country"
                value={profileData.country || ''} 
                onChange={handleChange}
                className={missingFields.includes('country') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('country')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">Ciudad {REQUIRED_FIELDS.includes('city') ? '*' : ''}</label>
              <input
                type="text"
                id="city"
                name="city"
                value={profileData.city || ''} 
                onChange={handleChange}
                className={missingFields.includes('city') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('city')}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Idiomas {REQUIRED_FIELDS.includes('languages') ? '*' : ''}</h3>
          <div className="form-group">
            <div className="language-input">
              <input
                type="text"
                placeholder="Agregar idioma y presionar Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    e.preventDefault();
                    handleLanguageAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div className={`languages-list ${missingFields.includes('languages') ? 'missing-field-container' : ''}`}>
              {(profileData.languages || []).map(language => (
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
             {missingFields.includes('languages') && <span className="missing-field-text">Se requiere al menos un idioma</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Enlaces</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="portfolio_url">URL del Portfolio {REQUIRED_FIELDS.includes('portfolio_url') ? '*' : ''}</label>
              <input
                type="url"
                id="portfolio_url"
                name="portfolio_url"
                value={profileData.portfolio_url || ''} 
                onChange={handleChange}
                className={missingFields.includes('portfolio_url') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('portfolio_url')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="instagram_profile">Perfil Instagram {REQUIRED_FIELDS.includes('instagram_profile') ? '*' : ''}</label>
              <input
                type="text"
                id="instagram_profile"
                name="instagram_profile"
                value={profileData.instagram_profile || ''} 
                onChange={handleChange}
                className={missingFields.includes('instagram_profile') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('instagram_profile')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tiktok_profile">Perfil TikTok {REQUIRED_FIELDS.includes('tiktok_profile') ? '*' : ''}</label>
              <input
                type="text"
                id="tiktok_profile"
                name="tiktok_profile"
                value={profileData.tiktok_profile || ''} 
                onChange={handleChange}
                className={missingFields.includes('tiktok_profile') ? 'missing-field' : ''}
                required={REQUIRED_FIELDS.includes('tiktok_profile')}
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
