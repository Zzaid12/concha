import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  job: {
    title: string;
    company: string;
    location: string;
  };
}

interface JobApplicationsProps {
  userId: string;
}

const JobApplications = ({ userId }: JobApplicationsProps) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs (
            title,
            company,
            location
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'var(--success)';
      case 'rejected':
        return 'var(--error)';
      default:
        return 'var(--warning)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <h3>No hay aplicaciones</h3>
        <p>Aún no has aplicado a ningún trabajo.</p>
        <motion.button
          className="primary-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/jobs'}
        >
          Ver Ofertas
        </motion.button>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <h2>Mis Aplicaciones</h2>
      <div className="applications-grid">
        {applications.map((application) => (
          <motion.div
            key={application.id}
            className="application-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
          >
            <div className="application-header">
              <h3>{application.job.title}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(application.status) }}
              >
                {getStatusText(application.status)}
              </span>
            </div>
            <div className="application-details">
              <p><strong>Empresa:</strong> {application.job.company}</p>
              <p><strong>Ubicación:</strong> {application.job.location}</p>
              <p><strong>Fecha:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JobApplications; 