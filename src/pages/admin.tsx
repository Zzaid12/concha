import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  expires_at: string | null;
  status: 'active' | 'proceso de seleccion';
}

interface User {
  id: string;
  // Add any other necessary properties
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'active' | 'proceso de seleccion'>('active');

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdmin();
    fetchJobs();
  }, [checkAdmin, fetchJobs]);

  const handleEdit = (job: Job) => {
    setEditJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setSalaryRange(job.salary_range);
    setStatus(job.status);
    setExpiresAt(job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : '');
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !salaryRange || !expiresAt) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const jobData = {
        title,
        description,
        salary_range: salaryRange,
        expires_at: expiresAt,
        status
      };

      if (editJob) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editJob.id);

        if (error) throw error;
        alert('Oferta actualizada con éxito');
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert([jobData]);

        if (error) throw error;
        alert('Oferta creada con éxito');
      }

      // Reset form and refresh jobs
      setShowCreateForm(false);
      setEditJob(null);
      resetForm();
      fetchJobs();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al guardar la oferta: ' + error.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSalaryRange('');
    setExpiresAt('');
    setStatus('active');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDelete = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  if (!isAdmin) {
    return <div>No tienes permisos para acceder a esta página</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-left">
          <h1>Panel de Administración</h1>
          <button className="view-main-button" onClick={() => router.push('/')}>
            Ver página principal
          </button>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin-content">
        <button 
          className="create-button"
          onClick={() => {
            setEditJob(null);
            resetForm();
            setShowCreateForm(!showCreateForm);
          }}
        >
          {showCreateForm ? 'Cancelar' : 'Crear nueva oferta'}
        </button>

        {showCreateForm && (
          <form className="job-form" onSubmit={handleSubmit}>
            <h2>{editJob ? 'Editar Oferta' : 'Crear Nueva Oferta'}</h2>
            <div className="form-group">
              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Rango Salarial"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'proceso de seleccion')}
              >
                <option value="active">Activo</option>
                <option value="proceso de seleccion">Proceso de selección</option>
              </select>
            </div>
            <button type="submit" className="submit-button">
              {editJob ? 'Actualizar Oferta' : 'Crear Oferta'}
            </button>
          </form>
        )}

        <div className="jobs-list">
          <h2>Ofertas Actuales</h2>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <div className="job-actions">
                    <button
                      onClick={() => handleEdit(job)}
                      className="edit-button"
                    >
                      Editar
                    </button>
                    <a
                      href="#"
                      className="delete-button"
                      style={{ 
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: '#ff4444',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Eliminar oferta: ' + job.id);
                        if (confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
                          handleDelete(job.id);
                        }
                      }}
                    >
                      Eliminar
                    </a>
                  </div>
                </div>
                <p className="salary">{job.salary_range}</p>
                <p className="description">{job.description}</p>
                <div className="job-meta">
                  {job.expires_at && (
                    <span className="badge expiry">
                      Expira: {new Date(job.expires_at).toLocaleDateString()}
                    </span>
                  )}
                  <span className={`badge status-${job.status}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .create-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 2rem;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .job-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #eaeaea;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .job-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-button,
        .delete-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .edit-button {
          background: #f0f0f0;
          color: #333;
        }

        .delete-button {
          background: #ff4444;
          color: white;
        }

        .job-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group input[type="text"],
        .form-group textarea,
        .form-group input[type="date"],
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .submit-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          margin-right: 0.5rem;
        }

        .expiry {
          background: #fff3e0;
          color: #f57c00;
        }

        .status-active {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-proceso de seleccion {
          background: #ffebee;
          color: #ff9800;
        }

        .salary {
          color: #0070f3;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .description {
          color: #666;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
