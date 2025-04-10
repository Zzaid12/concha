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

// Eliminar interfaz User si no se usa
// interface User {
//   id: string;
//   // Add any other necessary properties
// }

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
  const [formError, setFormError] = useState('');

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No hay usuario autenticado");
        return;
      }
      
      console.log("Usuario autenticado:", user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error al obtener el perfil:', error);
        
        // Si el error es porque no se encontró el perfil, podemos intentar crear uno
        if (error.code === 'PGRST116') {
          console.log("Perfil no encontrado, creando perfil de administrador...");
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              role: 'admin',
              is_complete: true
            });
          
          if (insertError) {
            console.error('Error al crear perfil de administrador:', insertError);
          } else {
            console.log("Perfil de administrador creado correctamente");
            setIsAdmin(true);
          }
        }
        return;
      }
      
      console.log("Perfil obtenido:", profile);
      const isUserAdmin = profile?.role === 'admin';
      console.log("¿Es administrador?:", isUserAdmin);
      setIsAdmin(isUserAdmin);
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('expires_at', { ascending: true });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await checkAdmin();
      fetchJobs();
    };
    
    initPage();
  }, []);

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
    setFormError('');

    if (!title.trim()) {
      setFormError('El título es obligatorio');
      return;
    }

    if (!description.trim()) {
      setFormError('La descripción es obligatoria');
      return;
    }

    if (!salaryRange.trim()) {
      setFormError('El rango salarial es obligatorio');
      return;
    }

    if (!expiresAt) {
      setFormError('La fecha de expiración es obligatoria');
      return;
    }

    try {
      const jobData = {
        title: title.trim(),
        description: description.trim(),
        salary_range: salaryRange.trim(),
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
      setFormError('Error al guardar la oferta: ' + error.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSalaryRange('');
    setExpiresAt('');
    setStatus('active');
    setFormError('');
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
          <button className="secondary-button" onClick={() => router.push('/')}>
            Ver página principal
          </button>
        </div>
        <button className="secondary-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin-content">
        <div className="section-header">
          <h2>Gestión de Ofertas</h2>
          <button 
            className="primary-button"
            onClick={() => {
              setEditJob(null);
              resetForm();
              setShowCreateForm(!showCreateForm);
            }}
          >
            {showCreateForm ? 'Cancelar' : 'Crear nueva oferta'}
          </button>
        </div>

        {formError && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {formError}
          </div>
        )}

        {showCreateForm && (
          <form className="job-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="job-title">Título de la oferta<span className="required">*</span></label>
              <input
                id="job-title"
                type="text"
                placeholder="Ej: Desarrollador Frontend Senior"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="job-description">Descripción<span className="required">*</span></label>
              <textarea
                id="job-description"
                placeholder="Describe las responsabilidades y requisitos del puesto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
              />
              <small>Puedes usar formato de lista con guiones (-) al inicio de cada línea</small>
            </div>

            <div className="form-group">
              <label htmlFor="salary-range">Rango Salarial<span className="required">*</span></label>
              <input
                id="salary-range"
                type="text"
                placeholder="Ej: 30.000€ - 45.000€ brutos anuales"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="expires-at">Fecha de Expiración<span className="required">*</span></label>
                <input
                  id="expires-at"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group half">
                <label htmlFor="job-status">Estado</label>
                <select
                  id="job-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'proceso de seleccion')}
                >
                  <option value="active">Activo</option>
                  <option value="proceso de seleccion">Proceso de selección</option>
                </select>
                <small>Determina si la oferta es visible para los usuarios</small>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}>
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                {editJob ? 'Actualizar Oferta' : 'Crear Oferta'}
              </button>
            </div>
          </form>
        )}

        <div className="jobs-section">
          <h3>Ofertas Actuales ({jobs.length})</h3>
          
          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>No hay ofertas de trabajo disponibles</p>
              <button 
                className="primary-button"
                onClick={() => {
                  setEditJob(null);
                  resetForm();
                  setShowCreateForm(true);
                }}
              >
                Crear primera oferta
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <div className="job-actions">
                      <button
                        onClick={() => handleEdit(job)}
                        className="action-button edit"
                        title="Editar oferta"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="action-button delete"
                        title="Eliminar oferta"
                        onClick={() => {
                          if (confirm(`¿Estás seguro de que deseas eliminar la oferta "${job.title}"?`)) {
                            handleDelete(job.id);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="job-salary">{job.salary_range}</div>
                  
                  <div className="job-description">
                    {job.description.length > 150
                      ? `${job.description.substring(0, 150)}...`
                      : job.description}
                  </div>
                  
                  <div className="job-meta">
                    {job.expires_at && (
                      <span className="badge expiry">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Expira: {new Date(job.expires_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`badge status-${job.status.replace(' ', '-')}`}>
                      {job.status === 'active' ? 'Activo' : 'Proceso de selección'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          color: #333;
          background-color: #f9fafb;
        }

        h1, h2, h3, h4 {
          margin-top: 0;
          color: #222;
        }

        h1 {
          font-size: 1.8rem;
          margin-bottom: 0;
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        h3 {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
        }

        h4 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #ddd;
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .primary-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: background-color 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .primary-button:hover {
          background: #005cc5;
        }

        .secondary-button {
          background: #e9ecef;
          color: #495057;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: background-color 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .secondary-button:hover {
          background: #e0e0e0;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #ffebee;
          color: #d32f2f;
          padding: 0.8rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          border-left: 4px solid #d32f2f;
        }

        .jobs-section {
          margin-top: 2rem;
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #ddd;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .job-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.8rem;
        }

        .job-actions {
          display: flex;
          gap: 0.4rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 4px;
          width: 32px;
          height: 32px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .action-button.edit {
          background: #f0f8ff;
          color: #0070f3;
        }

        .action-button.edit:hover {
          background: #e0f0ff;
        }

        .action-button.delete {
          background: #fff5f5;
          color: #e53935;
        }

        .action-button.delete:hover {
          background: #ffe0e0;
        }

        .job-salary {
          color: #0070f3;
          font-weight: 600;
          margin-bottom: 0.8rem;
          font-size: 1rem;
        }

        .job-description {
          color: #555;
          margin-bottom: 1.2rem;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.7rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .expiry {
          background: #fff8e1;
          color: #ff8f00;
        }

        .status-active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-proceso-de-seleccion {
          background: #e3f2fd;
          color: #0d47a1;
        }

        .job-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          margin-bottom: 2rem;
          border: 1px solid #ddd;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group.half {
          flex: 1;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #222;
        }

        .form-group small {
          display: block;
          color: #555;
          margin-top: 0.4rem;
          font-size: 0.8rem;
        }

        .required {
          color: #d32f2f;
          margin-left: 0.2rem;
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
          font-family: inherit;
          transition: border-color 0.2s;
          color: #333;
          background-color: #fff;
        }

        .form-group input[type="text"]::placeholder,
        .form-group textarea::placeholder {
          color: #999;
        }

        .form-group input[type="text"]:focus,
        .form-group textarea:focus,
        .form-group input[type="date"]:focus,
        .form-group select:focus {
          border-color: #0070f3;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: #f9f9f9;
          border-radius: 12px;
        }

        .empty-state p {
          margin-bottom: 1.5rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }

          .form-row {
            flex-direction: column;
            gap: 1rem;
          }

          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
