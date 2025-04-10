import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { testSupabaseConnection, testSupabaseInsert } from '../utils/testSupabase';
import Head from 'next/head';

export default function TestSupabase() {
  const [user, setUser] = useState<any>(null);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [insertResult, setInsertResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rawResult, setRawResult] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  const handleTestConnection = async () => {
    const result = await testSupabaseConnection();
    setConnectionResult(result);
  };

  const handleTestInsert = async () => {
    if (!user) {
      setInsertResult({ success: false, error: 'No hay usuario autenticado' });
      return;
    }

    const result = await testSupabaseInsert(user.id);
    setInsertResult(result);
  };

  const handleRawInsert = async () => {
    if (!user) {
      setRawResult({ success: false, error: 'No hay usuario autenticado' });
      return;
    }

    try {
      // Datos de prueba muy simples
      const testData = {
        user_id: user.id,
        email: user.email,
        role: 'candidate'
      };

      // Intento directo de inserción sin validación ni procesamiento
      const { data, error } = await supabase
        .from('profiles')
        .upsert(testData)
        .select();

      if (error) {
        setRawResult({ success: false, error });
      } else {
        setRawResult({ success: true, data });
      }
    } catch (error) {
      setRawResult({ success: false, error });
    }
  };

  // Función para realizar una prueba usando RPC si está disponible
  const handleRPCTest = async () => {
    if (!user) {
      return;
    }

    try {
      // Intentar usar una función RPC para actualizar el perfil
      // Esto solo funcionará si has definido esta función en Supabase
      const { data, error } = await supabase
        .rpc('update_user_profile', {
          p_user_id: user.id,
          p_first_name: 'Prueba',
          p_last_name: 'RPC',
          p_email: user.email
        });

      setRawResult({ 
        success: !error, 
        data, 
        error,
        note: 'Esta prueba solo funciona si has definido la función update_user_profile en Supabase'
      });
    } catch (error) {
      setRawResult({ success: false, error });
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Prueba de Supabase</title>
      </Head>

      <h1>Prueba de Supabase</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className="user-info">
            <h2>Información del usuario</h2>
            {user ? (
              <div>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            ) : (
              <p>No hay usuario autenticado</p>
            )}
          </div>

          <div className="test-section">
            <h2>Pruebas</h2>
            <button onClick={handleTestConnection}>Probar Conexión</button>
            <button onClick={handleTestInsert}>Probar Insert/Update</button>
            <button onClick={handleRawInsert}>Insert Directo</button>
            <button onClick={handleRPCTest}>Probar RPC</button>

            {connectionResult && (
              <div className="result">
                <h3>Resultado de conexión</h3>
                <pre>{JSON.stringify(connectionResult, null, 2)}</pre>
              </div>
            )}

            {insertResult && (
              <div className="result">
                <h3>Resultado de inserción</h3>
                <pre>{JSON.stringify(insertResult, null, 2)}</pre>
              </div>
            )}

            {rawResult && (
              <div className="result">
                <h3>Resultado raw</h3>
                <pre>{JSON.stringify(rawResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .user-info, .test-section {
          margin-top: 2rem;
          padding: 1rem;
          border: 1px solid #eaeaea;
          border-radius: 8px;
        }
        
        button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          margin-right: 0.5rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .result {
          margin-top: 1rem;
          padding: 1rem;
          background: #f7f7f7;
          border-radius: 4px;
        }
        
        pre {
          white-space: pre-wrap;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
} 