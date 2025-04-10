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
        .from('applications')
        .select(`
          *,
          job:jobs (
            title
          )
        `)
        .eq('user_id', userId);

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
              <p><strong>Fecha:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <style jsx>{`
        .applications-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        
        h2 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: #333;
          font-weight: 600;
        }
        
        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .application-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #eaeaea;
          height: 100%;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .application-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .application-header h3 {
          font-size: 1.2rem;
          margin: 0;
          color: #333;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.4rem 0.7rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
        }
        
        .application-details {
          color: #555;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .application-details p {
          margin: 0.5rem 0;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: #f9f9f9;
          border-radius: 12px;
          margin-top: 2rem;
        }
        
        .empty-state h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .empty-state p {
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .primary-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        
        .primary-button:hover {
          background: #005cc5;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #0070f3;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .applications-container {
            padding: 1rem;
          }
          
          .applications-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default JobApplications; 