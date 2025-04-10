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

export default function Admin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'active' | 'proceso de seleccion'>('active');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Crear políticas necesarias
        await supabase.rpc('exec_sql', {
          sql_string: `
            -- Política para permitir a los administradores eliminar ofertas
            CREATE POLICY IF NOT EXISTS "Permitir eliminar ofertas a administradores" ON jobs
            FOR DELETE 
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.user_id = auth.uid()
                AND profiles.role = 'admin'
              )
            );

            -- Asegurar que las políticas RLS están activadas
            ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

            -- Política para insertar ofertas
            CREATE POLICY IF NOT EXISTS "Permitir insertar ofertas a administradores" ON jobs
            FOR INSERT 
            TO authenticated
            WITH CHECK (
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.user_id = auth.uid()
                AND profiles.role = 'admin'
              )
            );

            -- Política para actualizar ofertas
            CREATE POLICY IF NOT EXISTS "Permitir actualizar ofertas a administradores" ON jobs
            FOR UPDATE 
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.user_id = auth.uid()
                AND profiles.role = 'admin'
              )
            );

            -- Añadir columnas faltantes
            ALTER TABLE jobs
            ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

            UPDATE jobs
            SET status = 'active'
            WHERE status IS NULL;
          `
        });
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
    checkAdmin();
    fetchJobs();
  }, []);

  const checkAdmin = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      router.push('/');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== 'admin') {
      router.push('/');
      return;
    }

    setUserRole(profile.role);
    setLoading(false);
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return;
    }

    setJobs(data || []);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setSalaryRange(job.salary_range);
    setStatus(job.status);
    setExpiresAt(job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

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

      if (editingJob) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editingJob.id);

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
      setShowForm(false);
      setEditingJob(null);
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
      alert('Función handleDelete llamada con ID: ' + jobId);
      
      if (!confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
        return;
      }

      console.log('Intentando eliminar oferta con ID:', jobId, typeof jobId);

      // Eliminar directamente con SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql_string: `DELETE FROM public.jobs WHERE id = $1`,
        params: [jobId]
      });

      if (error) {
        console.error('Error al eliminar la oferta:', error);
        alert('Error al eliminar la oferta: ' + error.message);
        return;
      }

      alert('Oferta eliminada con éxito');
      fetchJobs(); // Recargar la lista de ofertas
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Ha ocurrido un error inesperado');
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
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
            setEditingJob(null);
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancelar' : 'Crear nueva oferta'}
        </button>

        {showForm && (
          <form className="job-form" onSubmit={handleSubmit}>
            <h2>{editingJob ? 'Editar Oferta' : 'Crear Nueva Oferta'}</h2>
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
              {editingJob ? 'Actualizar Oferta' : 'Crear Oferta'}
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
                          supabase
                            .from('jobs')
                            .delete()
                            .eq('id', job.id)
                            .then(({ error }) => {
                              if (error) {
                                console.error('Error al eliminar:', error);
                                alert('Error: ' + error.message);
                              } else {
                                alert('Oferta eliminada con éxito');
                                fetchJobs();
                              }
                            });
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
