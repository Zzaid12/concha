import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Definimos los campos requeridos para completar el perfil
export const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'role',
  'country',
  'city'
];

// Definimos la interfaz para el perfil
export interface Profile {
  id?: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'candidate' | 'admin' | 'recruiter' | 'cliente'; // Valores permitidos para role
  bio?: string;
  country?: string;
  city?: string;
  languages?: string[];
  skills?: string[];
  avatar_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  website_url?: string;
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
  created_at?: string;
}

interface ProfileFormProps {
  profile?: Profile | null;
  onSuccess?: () => void;
}

// Componente para mostrar un banner de campos faltantes
const CompletionBanner = ({ missingFields, scrollToField }: { missingFields: string[], scrollToField: (fieldId: string) => void }) => {
  if (missingFields.length === 0) return null;
  
  const fieldNames: Record<string, string> = {
    first_name: 'Nombre',
    last_name: 'Apellido',
    email: 'Email',
    role: 'Rol',
    country: 'País'
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-600 to-red-600 p-4 rounded-lg mb-6 text-white shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-2">Por favor complete su perfil</h3>
      <p className="mb-3">Faltan completar los siguientes campos:</p>
      <ul className="list-disc pl-5 mb-4">
        {missingFields.map(field => (
          <li key={field} className="mb-1">
            <button 
              onClick={() => scrollToField(field)}
              className="underline hover:text-white/80 focus:outline-none"
            >
              {fieldNames[field] || field}
            </button>
          </li>
        ))}
      </ul>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => scrollToField(missingFields[0])}
        className="bg-white text-red-600 px-4 py-2 rounded-md font-medium shadow-md hover:bg-white/90"
      >
        Completar perfil
      </motion.button>
    </motion.div>
  );
};

export default function ProfileForm({ profile: initialProfile, onSuccess }: ProfileFormProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // Referencias para scrolling a campos específicos
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Función para scrollear a un campo específico
  const scrollToField = (fieldId: string) => {
    if (fieldRefs.current[fieldId]) {
      fieldRefs.current[fieldId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Resaltar visualmente el campo
      const input = fieldRefs.current[fieldId]?.querySelector('input, select, textarea');
      if (input) {
        input.classList.add('ring-2', 'ring-warning', 'ring-offset-2', 'ring-offset-background');
        setTimeout(() => {
          input.classList.remove('ring-2', 'ring-warning', 'ring-offset-2', 'ring-offset-background');
        }, 2000);
      }
    }
  };
  
  // Función para verificar si el perfil está completo
  const checkProfileCompletion = (profileData: Profile | null) => {
    if (!profileData) {
      setMissingFields(REQUIRED_FIELDS);
      return false;
    }
    
    const missing = REQUIRED_FIELDS.filter(field => !profileData[field as keyof Profile]);
    setMissingFields(missing);
    return missing.length === 0;
  };
  
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      checkProfileCompletion(initialProfile);
    }
  }, [initialProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }
      
      // Prepare data to save
      const updates = {
        ...profile,
        user_id: user.id
      };
      
      // Save to profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      setMessage({ text: 'Perfil guardado correctamente', type: 'success' });
      
      // Check if profile is complete
      checkProfileCompletion(updates);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Error al guardar el perfil', type: 'error' });
    } finally {
      setLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleArrayChange = (name: string, value: string[]) => {
    setProfile(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const languages = e.target.value.split(',').map(lang => lang.trim());
    handleArrayChange('languages', languages);
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    handleArrayChange('skills', skills);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Debe seleccionar una imagen.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update profile
      setProfile(prev => {
        if (!prev) return null;
        return { ...prev, avatar_url: data.publicUrl };
      });
      
      setMessage({ text: 'Avatar subido correctamente', type: 'success' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ text: 'Error al subir el avatar', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Si no hay perfil, mostrar mensaje
  if (!profile) {
    return (
      <div className="text-center p-6 bg-background-light rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Perfil no encontrado</h2>
        <p className="text-text-secondary mb-2">No se ha encontrado un perfil asociado a tu cuenta.</p>
        <p className="text-text-secondary">Por favor, contacta al administrador si crees que esto es un error.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Banner de campos faltantes */}
      <CompletionBanner missingFields={missingFields} scrollToField={scrollToField} />
      
      {/* Mensajes de estado */}
      {message && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background-light p-5 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Información Personal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="col-span-1">
              <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                Nombre <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profile.first_name || ''}
                onChange={handleChange}
                className="w-full"
                placeholder="Ingresa tu nombre"
                required
              />
            </div>
            
            {/* Apellido */}
            <div className="col-span-1">
              <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                Apellido <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profile.last_name || ''}
                onChange={handleChange}
                className="w-full"
                placeholder="Ingresa tu apellido"
                required
              />
            </div>
            
            {/* Email */}
            <div className="col-span-1">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email || ''}
                onChange={handleChange}
                className="w-full"
                placeholder="tu@email.com"
                required
              />
            </div>
            
            {/* Rol */}
            <div className="col-span-1">
              <label htmlFor="role" className="block text-sm font-medium mb-1">
                Rol <span className="text-error">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={profile.role || ''}
                onChange={handleChange}
                className="w-full"
                required
              >
                <option value="">Selecciona un rol</option>
                <option value="candidate">Candidato</option>
                <option value="recruiter">Reclutador</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            
            {/* País */}
            <div className="col-span-1">
              <label htmlFor="country" className="block text-sm font-medium mb-1">
                País <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={profile.country || ''}
                onChange={handleChange}
                className="w-full"
                placeholder="España"
                required
              />
            </div>
            
            {/* Ciudad */}
            <div className="col-span-1">
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                Ciudad <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={profile.city || ''}
                onChange={handleChange}
                className="w-full"
                placeholder="Madrid"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Botón de guardar */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md font-medium"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Perfil'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
