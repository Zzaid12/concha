import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range: string;
  contact_email: string;
  created_at?: string; 
  is_remote: boolean;
  status: string;
};

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Actualizar los trabajos filtrados cuando cambia el término de búsqueda o los trabajos
  useEffect(() => {
    filterJobs();
  }, [searchTerm, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active');
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setJobs(data || []);
      setFilteredJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setError('No se pudieron cargar las ofertas de trabajo. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = jobs.filter(job => 
      (job.title && job.title.toLowerCase().includes(term)) ||
      (job.company && job.company.toLowerCase().includes(term)) ||
      (job.location && job.location.toLowerCase().includes(term)) ||
      (job.description && job.description.toLowerCase().includes(term))
    );
    
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Fecha no disponible";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return "Fecha no disponible";
    }
  };

  return (
    <>
      <Head>
        <title>Ofertas de Trabajo | Marketing Website</title>
        <meta name="description" content="Explora las últimas ofertas de trabajo en marketing digital" />
      </Head>
      
      <div className="jobs-page">
        <div className="jobs-header">
          <h1>Ofertas de Trabajo</h1>
          <p>Encuentra las mejores oportunidades en marketing digital</p>
        </div>
        
        <div className="container">
          <div className="jobs-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar por título, empresa o ubicación..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando ofertas...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              {error}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="no-jobs-message">
              <h3>No se encontraron ofertas</h3>
              <p>No hay ofertas que coincidan con tus criterios de búsqueda. Intenta con otros términos.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-title">{job.title}</div>
                  <div className="job-details">
                    <div className="job-company">{job.company}</div>
                    
                    <div className="job-meta">
                      <div className="job-location">
                        📍 {job.location}
                        {job.is_remote && <span className="remote-badge">Remoto</span>}
                      </div>
                      
                      <div className="job-salary">
                        💰 {job.salary_range}
                      </div>
                    </div>
                    
                    <div className="job-description">
                      {job.description && job.description.length > 150 
                        ? `${job.description.substring(0, 150)}...` 
                        : job.description}
                    </div>
                    
                    <div className="job-footer">
                      {job.created_at && (
                        <div className="job-date">
                          Publicado el {formatDate(job.created_at)}
                        </div>
                      )}
                      
                      <Link href={`/jobs/${job.id}`} className="view-job-button">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .jobs-page {
          padding-bottom: 4rem;
        }
        
        .jobs-header {
          background: #0070f3;
          color: white;
          padding: 3rem 0;
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .jobs-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .jobs-header p {
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto;
          opacity: 0.9;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .jobs-filters {
          margin-bottom: 2rem;
        }
        
        .search-container {
          width: 100%;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .search-input:focus {
          border-color: #0070f3;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
        }
        
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .job-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease;
          cursor: pointer;
          position: relative;
          height: 60px;
        }
        
        .job-card:hover {
          transform: translateY(-5px);
          height: auto;
        }
        
        .job-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0070f3;
          padding: 1.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .job-details {
          padding: 0 1.25rem 1.25rem;
          display: none;
        }
        
        .job-card:hover .job-details {
          display: block;
        }
        
        .job-company {
          font-weight: 500;
          color: #333;
          margin-bottom: 1rem;
        }
        
        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          color: #666;
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
        
        .job-description {
          margin-bottom: 1.5rem;
          color: #666;
        }
        
        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
        }
        
        .job-date {
          font-size: 0.875rem;
          color: #666;
        }
        
        .view-job-button {
          background: #e6f7ff;
          color: #0070f3;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
        }
        
        .view-job-button:hover {
          background: #0070f3;
          color: white;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
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
        
        .error-message {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
          margin: 2rem 0;
        }
        
        .no-jobs-message {
          text-align: center;
          padding: 4rem 0;
          color: #666;
        }
        
        .no-jobs-message h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        @media (max-width: 768px) {
          .jobs-header {
            padding: 2rem 0;
          }
          
          .jobs-header h1 {
            font-size: 2rem;
          }
          
          .jobs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default JobsPage;
