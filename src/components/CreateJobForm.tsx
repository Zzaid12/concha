// components/CreateJobForm.tsx
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface Job {
  id: number;
  title: string;
  description: string;
  salary_range: string;
  expires_at: string | null;
  status: 'active' | 'proceso de seleccion';
}

interface CreateJobFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editJob?: Job | null;
}

export default function CreateJobForm({ onClose, onSuccess, editJob }: CreateJobFormProps) {
  const [title, setTitle] = useState(editJob?.title || '');
  const [description, setDescription] = useState(editJob?.description || '');
  const [salaryRange, setSalaryRange] = useState(editJob?.salary_range || '');
  const [expiresAt, setExpiresAt] = useState(
    editJob?.expires_at ? new Date(editJob.expires_at).toISOString().split('T')[0] : ''
  );
  const [status, setStatus] = useState<'active' | 'proceso de seleccion'>(editJob?.status || 'active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validación
      if (!title.trim() || !description.trim() || !salaryRange.trim() || !expiresAt) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      const jobData = {
        title: title.trim(),
        description: description.trim(),
        salary_range: salaryRange.trim(),
        expires_at: new Date(expiresAt).toISOString(),
        status,
        updated_at: new Date().toISOString()
      };

      let error;

      if (editJob) {
        // Actualizar oferta existente
        const { error: updateError } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editJob.id);
        error = updateError;
      } else {
        // Crear nueva oferta
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([jobData]);
        error = insertError;
      }

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{editJob ? 'Editar Oferta' : 'Crear Nueva Oferta'}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título*</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ej: Desarrollador Frontend Senior"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción*</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe los requisitos y responsabilidades del puesto"
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="salary">Rango Salarial*</label>
          <input
            id="salary"
            type="text"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            placeholder="ej: 40,000€ - 50,000€"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expires">Fecha de Expiración*</label>
            <input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'proceso de seleccion')}
            >
              <option value="active">Activa</option>
              <option value="proceso de seleccion">Proceso de selección</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancelar
          </button>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {editJob ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              editJob ? 'Actualizar Oferta' : 'Crear Oferta'
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
        }

        .close-button:hover {
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        input[type="text"],
        input[type="date"],
        textarea,
        select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.1);
        }

        textarea {
          resize: vertical;
          min-height: 100px;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .cancel-button {
          background: transparent;
          border: 1px solid #ddd;
          color: #666;
        }

        .cancel-button:hover {
          background: #f5f5f5;
        }

        .submit-button {
          background: #0070f3;
          color: white;
          border: none;
        }

        .submit-button:hover {
          background: #0051cc;
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}