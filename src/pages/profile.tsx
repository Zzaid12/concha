import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import ProfileForm, { Profile as ProfileType, REQUIRED_FIELDS } from '../components/ProfileForm';
import ProfileSummary from '../components/ProfileSummary';
import JobApplications from '../components/JobApplications';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';

const ProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const checkUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          const newProfile: ProfileType = {
            user_id: currentUser.id,
            first_name: '',
            last_name: '',
            email: currentUser.email || '',
            role: 'cliente',
            languages: []
          };
          setProfile(newProfile);
          setIsComplete(false);
          setIsEditing(true);
        } else {
          throw profileError;
        }
      } else {
        setProfile(profileData);
        
        const missing = REQUIRED_FIELDS.filter(field => {
          const value = profileData[field as keyof ProfileType];
          if (Array.isArray(value)) return value.length === 0;
          return !value;
        });
        
        const profileComplete = missing.length === 0;
        setIsComplete(profileComplete);
        
        if (!profileComplete && !isEditing) {
          setIsEditing(true);
        }
      }
    } catch (err) {
      console.error('Error checking user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [router, isEditing]);

  useEffect(() => {
    checkUserProfile();
  }, [checkUserProfile]);

  const handleProfileUpdate = () => {
    checkUserProfile().then(() => {
      setIsEditing(false);
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const shouldShowForm = !isComplete || isEditing;

  return (
    <>
      <Head>
        <title>Mi Perfil | Proyecto Marketing</title>
        <meta name="description" content="Gestiona tu perfil profesional y aplicaciones" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="profile-page">
        <div className="gradient-bg" style={{ pointerEvents: 'none' }} />
        <motion.div 
          className="profile-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {shouldShowForm ? (
            <>
              <h1 className="profile-title">
                {isEditing ? 'Editar Perfil' : 'Completa tu Perfil'}
              </h1>
              <p className="profile-subtitle">
                {isEditing 
                  ? 'Actualiza tu información para mejorar tus oportunidades.'
                  : 'Necesitamos algunos datos más para activar todas las funcionalidades.'}
              </p>
              
              <ProfileForm 
                profile={profile}
                onSuccess={handleProfileUpdate}
              />
            </>
          ) : (
            <>
              <ProfileSummary 
                profile={profile}
                onEdit={() => setIsEditing(true)}
              />
              
              <div className="profile-divider" />
              
              {user && <JobApplications userId={user.id} />}
            </>
          )}
        </motion.div>

        <style jsx>{`
          .profile-page {
            min-height: 100vh;
            padding: 1rem;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          @media (min-width: 768px) {
            .profile-page {
              padding: 2rem;
            }
          }

          .gradient-bg {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50vh;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            z-index: -1;
          }

          .profile-container {
            width: 100%;
            max-width: 1200px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 1rem;
            margin-top: 1rem;
            backdrop-filter: blur(10px);
          }

          @media (min-width: 640px) {
            .profile-container {
              padding: 1.5rem;
              margin-top: 2rem;
            }
          }

          @media (min-width: 768px) {
            .profile-container {
              padding: 2rem;
              margin-top: 3rem;
            }
          }

          .profile-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #1a202c;
            text-align: center;
          }

          @media (min-width: 768px) {
            .profile-title {
              font-size: 2rem;
              text-align: left;
            }
          }

          .profile-subtitle {
            font-size: 0.9rem;
            color: #4a5568;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          @media (min-width: 768px) {
            .profile-subtitle {
              font-size: 1rem;
              margin-bottom: 2rem;
              text-align: left;
            }
          }

          .profile-divider {
            height: 1px;
            background: rgba(0, 0, 0, 0.1);
            margin: 2rem 0;
            width: 100%;
          }

          .loading-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .loading-spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ProfilePage;
