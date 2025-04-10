import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Head from 'next/head';

export default function TestSaveProfile() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('creador_ugc');
  const [formData, setFormData] = useState({
    first_name: 'Test',
    last_name: 'User',
    email: '',
    phone: '123456789',
    country: 'España',
    city: 'Madrid'
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveTest = async () => {
    if (!user) {
      setResult({
        success: false,
        error: 'No hay usuario autenticado'
      });
      return;
    }

    setSaving(true);
    setResult(null);

    try {
      // Probar directamente con el valor de role seleccionado
      const profileData = {
        user_id: user.id,
        email: formData.email,
        role: selectedRole,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        country: formData.country,
        city: formData.city
      };

      console.log('Intentando guardar con role =', selectedRole);
      
      // Probamos con UPDATE primero
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select();

      if (updateError) {
        console.error('Error al actualizar:', updateError);
        
        // Si falla update, intentamos con INSERT
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select();
          
        if (insertError) {
          console.error('Error al insertar:', insertError);
          setResult({
            success: false,
            error: insertError,
            message: 'Falló tanto UPDATE como INSERT. Ver detalles del error.'
          });
        } else {
          setResult({
            success: true,
            data: insertData,
            message: 'INSERT exitoso con role = ' + selectedRole
          });
        }
      } else {
        setResult({
          success: true,
          data: updateData,
          message: 'UPDATE exitoso con role = ' + selectedRole
        });
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setResult({
        success: false,
        error: error
      });
    } finally {
      setSaving(false);
    }
  };

  // Consulta para verificar los valores permitidos de role
  const checkAllowedRoles = async () => {
    setSaving(true);
    setResult(null);
    
    try {
      // Esta consulta intenta obtener información sobre el check constraint
      const { data, error } = await supabase.rpc('get_role_check_constraint');
      
      if (error) {
        // Si la función RPC no existe, mostrar instrucción alternativa
        console.error('Error al consultar restricciones:', error);
        setResult({
          success: false,
          error: error,
          message: 'Para verificar los valores permitidos, ejecuta esta consulta en SQL Editor de Supabase:\n\nSELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = \'profiles_role_check\';'
        });
      } else {
        setResult({
          success: true,
          data: data,
          message: 'Valores permitidos para role:'
        });
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setResult({
        success: false,
        error: error
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Prueba de Guardado de Perfil</title>
      </Head>

      <h1>Prueba de Diferentes Valores para Role</h1>

      {user ? (
        <>
          <div className="user-info">
            <p><strong>Usuario:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>

          <div className="form-container">
            <div className="form-group">
              <label>Seleccionar Valor de Role</label>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-select"
              >
                <option value="cliente">cliente</option>
                <option value="creador_ugc">creador_ugc</option>
                <option value="candidate">candidate</option>
                <option value="admin">admin</option>
                <option value="recruiter">recruiter</option>
                <option value="user">user</option>
              </select>
            </div>

            <div className="buttons">
              <button 
                onClick={handleSaveTest} 
                disabled={saving}
                className="button primary"
              >
                {saving ? 'Guardando...' : 'Probar Guardar con Role Seleccionado'}
              </button>
              
              <button 
                onClick={checkAllowedRoles} 
                disabled={saving}
                className="button secondary"
              >
                Verificar Valores Permitidos para Role
              </button>
            </div>
          </div>

          {result && (
            <div className={`result ${result.success ? 'success' : 'error'}`}>
              <h3>{result.success ? 'Éxito!' : 'Error'}</h3>
              {result.message && <p>{result.message}</p>}
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </>
      ) : (
        <p>Por favor, inicia sesión para probar el guardado de perfil.</p>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h1 {
          margin-bottom: 2rem;
        }
        
        .user-info {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        
        .form-container {
          margin-bottom: 2rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .role-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .button {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .button.primary {
          background: #1890ff;
          color: white;
        }
        
        .button.secondary {
          background: #52c41a;
          color: white;
        }
        
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .result {
          margin-top: 2rem;
          padding: 1rem;
          border-radius: 8px;
        }
        
        .success {
          background: rgba(82, 196, 26, 0.1);
          border: 1px solid #52c41a;
        }
        
        .error {
          background: rgba(255, 77, 79, 0.1);
          border: 1px solid #ff4d4f;
        }
        
        pre {
          white-space: pre-wrap;
          overflow-x: auto;
          background: rgba(0, 0, 0, 0.03);
          padding: 1rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 