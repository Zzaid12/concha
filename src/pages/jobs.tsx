import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';

type Job = {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  expires_at: string | null;
  is_remote: boolean;
  status: string;
  type: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('expires_at', { ascending: true });
      
      if (error) throw error;
      setJobs(data || []);
      setFilteredJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('No se pudieron cargar las ofertas de trabajo. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = useCallback(() => {
    let filtered = jobs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedType]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
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
    } catch (_e) {
      return "Fecha no disponible";
    }
  };

  return (
    <>
      <Head>
        <title>Ofertas de Trabajo | Tu Empresa</title>
        <meta name="description" content="Explora las últimas ofertas de trabajo disponibles" />
      </Head>

      <div className="jobs-page">
        <div className="jobs-header">
          <h1>Ofertas de Trabajo</h1>
          <p>Encuentra las mejores oportunidades profesionales</p>
        </div>

        <div className="search-container">
          <input 
            type="text" 
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          
          <select 
            value={selectedType} 
            onChange={handleTypeChange}
            className="filter-select"
          >
            <option value="">Todos los tipos</option>
            <option value="full-time">Tiempo completo</option>
            <option value="part-time">Tiempo parcial</option>
            <option value="contract">Contrato</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando ofertas de trabajo...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchJobs} className="retry-button">Reintentar</button>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="jobs-container">
            {filteredJobs.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="job-card-link">
                <div className="job-card">
                  <h2>{job.title}</h2>
                  <div className="job-tags">
                    <span className="tag salary-tag">{job.salary_range}</span>
                    {job.is_remote && <span className="tag remote-tag">Remoto</span>}
                    {job.type && <span className="tag type-tag">{job.type}</span>}
                  </div>
                  <p className="job-description">
                    {job.description.length > 180 
                      ? `${job.description.substring(0, 180)}...` 
                      : job.description}
                  </p>
                  <div className="job-footer">
                    <span className="expiry-date">
                      {job.expires_at 
                        ? `Expira el ${new Date(job.expires_at).toLocaleDateString()}` 
                        : 'Sin fecha de expiración'}
                    </span>
                    <span className="view-details">Ver detalles →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No se encontraron ofertas</h3>
            <p>Intenta con una búsqueda diferente o vuelve más tarde.</p>
            {searchTerm && 
              <button onClick={() => setSearchTerm('')} className="clear-search">
                Limpiar búsqueda
              </button>
            }
          </div>
        )}
      </div>

      <style jsx>{`
        .jobs-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .jobs-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .jobs-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #0070f3, #00bcd4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .jobs-header p {
          font-size: 1.1rem;
          color: #666;
        }
        
        .search-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .search-input {
          flex: 1;
          padding: 0.8rem 1.2rem;
          border: 2px solid #eaeaea;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        .search-input:focus {
          border-color: #0070f3;
          outline: none;
        }
        
        .filter-select {
          padding: 0.8rem 1.2rem;
          border: 2px solid #eaeaea;
          border-radius: 8px;
          background-color: white;
          font-size: 1rem;
          min-width: 150px;
        }
        
        .jobs-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .job-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }
        
        .job-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04);
          border: 1px solid #eaeaea;
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0,0,0,0.1);
        }
        
        .job-card h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.3rem;
          color: #333;
        }
        
        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .tag {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .salary-tag {
          background: #ebf5ff;
          color: #0070f3;
        }
        
        .remote-tag {
          background: #f3e5f5;
          color: #9c27b0;
        }
        
        .type-tag {
          background: #f1f8e9;
          color: #689f38;
        }
        
        .job-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex: 1;
        }
        
        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          font-size: 0.9rem;
        }
        
        .expiry-date {
          color: #fb8c00;
        }
        
        .view-details {
          color: #0070f3;
          font-weight: 500;
        }
        
        .loading-container {
          text-align: center;
          padding: 3rem;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #0070f3;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-container {
          text-align: center;
          padding: 2rem;
          background: #ffebee;
          border-radius: 12px;
          color: #d32f2f;
        }
        
        .retry-button {
          background: #d32f2f;
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 1rem;
        }
        
        .no-results {
          text-align: center;
          padding: 3rem;
          background: #f9f9f9;
          border-radius: 12px;
        }
        
        .clear-search {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
}
