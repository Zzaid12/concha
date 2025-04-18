import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  expires_at: string | null;
  status: 'active' | 'proceso de seleccion';
}

const JobListings = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .order('expires_at', { ascending: true });

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        setJobs(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(6, 102, 235, 0.1)', 
          borderTop: '4px solid var(--primary-color)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
    );
  }

  return (
    <div className="container">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Ofertas de Trabajo
      </motion.h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 style={{ 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {job.title}
            </h3>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{job.description}</p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 'auto'
            }}>
              <span style={{ 
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--primary-color), #0555c4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {job.salary_range}
              </span>
              <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : 'Sin fecha de expiración'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JobListings;
