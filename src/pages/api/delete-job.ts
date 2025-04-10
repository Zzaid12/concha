import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Usar la clave de servicio para bypass de RLS

// Cliente con la clave de servicio (tiene permisos completos)
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Cliente normal para verificación de autenticación
const supabase = createClient(
  supabaseUrl, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { jobId } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Se requiere el ID de la oferta' });
    }

    // Verificar que el usuario es admin
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Eliminar la oferta usando el cliente admin (bypass RLS)
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error al eliminar la oferta:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error('Error inesperado:', error);
    return res.status(500).json({ error: 'Error inesperado' });
  }
}
