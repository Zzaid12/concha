import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Manejar DELETE para eliminar una oferta
  if (req.method === 'DELETE') {
    try {
      console.log('API: Intentando eliminar oferta con ID:', id);

      // Verificar que el usuario es admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      // Eliminar la oferta usando SQL directo para evitar problemas con RLS
      const { error } = await supabase.rpc('exec_sql', {
        sql_string: `DELETE FROM jobs WHERE id = '${id}'`
      });

      if (error) {
        console.error('Error al eliminar la oferta:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error inesperado:', error);
      return res.status(500).json({ error: error.message || 'Error inesperado' });
    }
  }

  // Manejar GET para obtener una oferta específica
  else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Oferta no encontrada' });
      }

      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error inesperado' });
    }
  }

  // Método no permitido
  else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
