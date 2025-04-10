# Marketing Website

Sitio web de marketing con autenticación y gestión de perfiles.

## Características

- Autenticación de usuarios con Supabase
- Gestión de perfiles de usuario
- Interfaz moderna y responsive
- Animaciones con Framer Motion

## Tecnologías

- Next.js
- TypeScript
- Supabase
- Framer Motion
- Tailwind CSS

## Configuración

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env.local` con las variables de entorno de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```
4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue

Este proyecto está configurado para ser desplegado en Vercel. Simplemente conecta tu repositorio de GitHub con Vercel y el despliegue se realizará automáticamente.
