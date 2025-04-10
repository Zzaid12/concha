import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import ProfileForm, { Profile as ProfileType } from '../components/ProfileForm';
import ProfileSummary from '../components/ProfileSummary';
import JobApplications from '../components/JobApplications';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';

const ProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mi Perfil | JobMatch</title>
        <meta name="description" content="Gestiona tu perfil profesional y aplicaciones" />
      </Head>
      
      <div className="profile-page">
        <div className="gradient-bg" style={{ pointerEvents: 'none' }} />
        <motion.div 
          className="profile-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isEditing ? (
            <>
              <h1 className="profile-title">Editar Perfil</h1>
              <p className="profile-subtitle">
                Actualiza tu información para mejorar tus oportunidades.
              </p>
              
              <ProfileForm 
                profile={profile}
                onSuccess={() => {
                  setIsEditing(false);
                  window.location.reload();
                }}
              />
            </>
          ) : (
            <>
              <ProfileSummary 
                profile={profile}
                onEdit={() => setIsEditing(true)} 
              />
              
              <div className="profile-divider" />
              
              <JobApplications userId={user?.id || ''} />
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;
