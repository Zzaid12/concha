import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import ProfileForm from '../components/ProfileForm';
import ProfileSummary from '../components/ProfileSummary';
import JobApplications from '../components/JobApplications';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
    } catch (error) {
      console.error('Error:', error);
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
                userId={user?.id || ''}
                onSuccess={() => {
                  setIsEditing(false);
                  window.location.reload();
                }}
              />
            </>
          ) : (
            <>
              <ProfileSummary 
                userId={user?.id || ''} 
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
