import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range: string;
  contact_email: string;
  created_at: string;
  is_remote: boolean;
  status: string;
};

const JobDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Oferta de trabajo no encontrada');
      }
      
      setJob(data);
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      setError('No se pudo cargar la oferta de trabajo. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando detalles de la oferta...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 200px);
            padding: 2rem;
          }
          
          .loading-spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid #0070f3;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Oferta de trabajo no encontrada'}</p>
        <Link href="/jobs" className="back-button">
          Volver a ofertas
        </Link>
        
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 4rem 2rem;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .back-button {
            display: inline-block;
            background: #0070f3;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            text-decoration: none;
            margin-top: 1rem;
          }
          
          .back-button:hover {
            background: #0060df;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{job.title} | {job.company}</title>
        <meta name="description" content={`Oferta de trabajo: ${job.title} en ${job.company}`} />
      </Head>
      
      <div className="job-detail-page">
        <div className="container">
          <div className="back-link">
            <Link href="/jobs">
              ← Volver a ofertas
            </Link>
          </div>
          
          <div className="job-detail-card">
            <div className="job-header">
              <h1>{job.title}</h1>
              <div className="company-name">{job.company}</div>
              
              <div className="job-meta">
                <div className="meta-item">
                  <span className="meta-label">Ubicación:</span> 
                  {job.location}
                  {job.is_remote && <span className="remote-badge">Remoto</span>}
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Salario:</span> 
                  {job.salary_range}
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Publicado:</span> 
                  {formatDate(job.created_at)}
                </div>
              </div>
            </div>
            
            <div className="job-content">
              <div className="content-section">
                <h2>Descripción</h2>
                <div className="description">
                  {job.description.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div className="content-section">
                <h2>Requisitos</h2>
                <div className="requirements">
                  {job.requirements.split('\n').map((req, i) => (
                    <p key={i}>{req}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="job-footer">
              <h3>¿Interesado en esta oferta?</h3>
              <p>Envía tu CV y carta de presentación a: <a href={`mailto:${job.contact_email}`} className="email-link">{job.contact_email}</a></p>
              
              <div className="action-buttons">
                <a href={`mailto:${job.contact_email}?subject=Aplicación para ${job.title}`} className="apply-button">
                  Aplicar ahora
                </a>
                
                <button 
                  onClick={() => window.print()} 
                  className="print-button"
                >
                  Imprimir oferta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .job-detail-page {
          padding: 2rem 0 4rem;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        .back-link {
          margin-bottom: 1.5rem;
        }
        
        .back-link a {
          color: #0070f3;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
        }
        
        .back-link a:hover {
          text-decoration: underline;
        }
        
        .job-detail-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .job-header {
          padding: 2rem;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .job-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .company-name {
          font-size: 1.25rem;
          font-weight: 500;
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
        }
        
        .meta-label {
          font-weight: 600;
          color: #333;
        }
        
        .remote-badge {
          background: #e6f7ff;
          color: #0070f3;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }
        
        .job-content {
          padding: 2rem;
        }
        
        .content-section {
          margin-bottom: 2rem;
        }
        
        .content-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #333;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .description p, .requirements p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #555;
        }
        
        .job-footer {
          background: #f9f9f9;
          padding: 2rem;
          text-align: center;
          border-top: 1px solid #f0f0f0;
        }
        
        .job-footer h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .email-link {
          color: #0070f3;
          font-weight: 500;
          text-decoration: none;
        }
        
        .email-link:hover {
          text-decoration: underline;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .apply-button, .print-button {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
        }
        
        .apply-button {
          background: #0070f3;
          color: white;
          border: none;
          text-decoration: none;
        }
        
        .apply-button:hover {
          background: #0060df;
        }
        
        .print-button {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
        }
        
        .print-button:hover {
          background: #f5f5f5;
        }
        
        @media (max-width: 768px) {
          .job-meta {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .apply-button, .print-button {
            width: 100%;
          }
        }
        
        @media print {
          .back-link, .job-footer, .action-buttons {
            display: none;
          }
          
          .job-detail-card {
            box-shadow: none;
            border: 1px solid #e0e0e0;
          }
        }
      `}</style>
    </>
  );
};

export default JobDetailPage;
