# Autos Galeria - Marketplace de Vehiculos

Aplicacion web para marketplace de vehiculos construida con Next.js 14, Supabase y Vercel.

## Requisitos Previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (para despliegue)

## Configuracion Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear un nuevo proyecto en [Supabase](https://supabase.com)
2. Ir al **SQL Editor** y ejecutar el contenido del archivo `supabase-setup.sql`
3. Ir a **Storage** y crear un nuevo bucket:
   - Nombre: `vehiculos`
   - Publico: Si
   - Allowed MIME types: `image/*`
   - Max file size: `5242880` (5MB)

### 3. Configurar Variables de Entorno

Editar el archivo `.env.local` con tus credenciales:

```env
# Supabase - Obtener de Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# JWT Secret - Genera una cadena aleatoria segura
JWT_SECRET=tu-jwt-secret-muy-seguro-de-al-menos-32-caracteres

# Contacto Admin (opcional)
ADMIN_WHATSAPP=573001234567
ADMIN_EMAIL=contacto@autosgaleria.com
```

### 4. Generar Hash de Contrasenas

Para crear usuarios con contrasenas seguras:

```bash
node scripts/generate-password-hash.js tu_contrasena
```

Luego actualizar en Supabase:
```sql
UPDATE usuarios SET password_hash = 'hash_generado' WHERE cedula = 'cedula_usuario';
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Usuarios de Prueba

Despues de ejecutar el SQL de setup, tendras estos usuarios:

| Cedula | Password | Rol |
|--------|----------|-----|
| 123456789 | admin123 | Admin |
| 987654321 | user123 | Usuario |

**IMPORTANTE:** Cambiar las contrasenas en produccion usando el script `generate-password-hash.js`

## Estructura del Proyecto

```
src/
├── app/
│   ├── login/           # Pagina de login
│   ├── marketplace/     # Listado de vehiculos
│   │   └── [id]/        # Detalle de vehiculo
│   ├── mis-vehiculos/   # Gestion de vehiculos propios
│   │   ├── nuevo/       # Formulario nuevo vehiculo
│   │   └── [id]/editar/ # Editar vehiculo
│   └── api/             # API Routes
├── components/          # Componentes React
├── lib/                 # Utilidades (Supabase, Auth)
├── hooks/               # React Hooks
└── types/               # TypeScript types
```

## Funcionalidades

### Autenticacion
- Login con cedula y password
- Sesion persistente con JWT en cookies
- Proteccion de rutas con middleware

### Marketplace
- Listado de vehiculos publicados
- Filtros por marca, precio
- Busqueda por marca, linea o placa

### Detalle de Vehiculo
- Galeria de imagenes
- Especificaciones tecnicas completas
- Contacto por WhatsApp (vendedor y admin)

### Gestion de Vehiculos
- CRUD completo de vehiculos
- Consulta RUNT por placa (con fallback manual)
- Subida de imagenes a Supabase Storage
- Administrador puede gestionar todos los vehiculos

## Consulta RUNT

La aplicacion intenta consultar el portal publico del RUNT para obtener datos del vehiculo automaticamente. Si la consulta falla (por CORS, captcha, etc.), muestra el formulario para ingreso manual.

## Despliegue en Vercel

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno
3. Desplegar

```bash
npm run build
```

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticacion**: JWT con jose
- **Almacenamiento**: Supabase Storage
- **Despliegue**: Vercel

## Licencia

MIT
