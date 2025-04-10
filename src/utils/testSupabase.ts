import { supabase } from './supabaseClient';

/**
 * Función de prueba para verificar la conexión con Supabase
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return { success: false, error };
    }
    
    console.log('Conexión exitosa con Supabase:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error };
  }
}

/**
 * Función para intentar insertar datos de prueba
 */
export async function testSupabaseInsert(userId: string) {
  try {
    // Datos de prueba
    const testData = {
      user_id: userId,
      email: 'test@example.com',
      role: 'candidate',
      first_name: 'Test',
      last_name: 'User'
    };
    
    // Primero intentamos con update
    const { error: updateError } = await supabase
      .from('profiles')
      .update(testData)
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error al actualizar:', updateError);
      
      // Si falla el update, intentamos insert
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert(testData)
        .select();
        
      if (insertError) {
        console.error('Error al insertar:', insertError);
        return { success: false, error: insertError };
      }
      
      return { success: true, data };
    }
    
    return { success: true, message: 'Actualización exitosa' };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error };
  }
}

/**
 * Función para verificar la estructura de la tabla profiles
 */
export async function getProfilesTableStructure() {
  try {
    // Esto solo funcionará si tienes permisos para acceder a information_schema
    // Si no funciona, no es un problema crítico
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'profiles');
      
    if (error) {
      console.error('No se pudo obtener la estructura de la tabla:', error);
      return { success: false, error };
    }
    
    return { success: true, structure: data };
  } catch (error) {
    console.error('Error al verificar la estructura:', error);
    return { success: false, error };
  }
} 