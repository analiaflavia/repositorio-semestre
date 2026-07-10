# Derecho Médico — Repositorio del Semestre

Plataforma web para estudiantes donde pueden guardar, subir, descargar y organizar todos los archivos del semestre: materiales de estudio, documentos, enlaces, bancos de preguntas, presentaciones, guías, videos y Joseos.

---

## Tecnologías

- **Frontend:** React 18 + Vite
- **Estilos:** Tailwind CSS
- **Backend / DB:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Routing:** React Router v6

---

## Pasos para correr el proyecto

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo>
cd derecho-medico-repositorio
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta.
2. Clic en **New Project**.
3. Elige nombre, contraseña de DB y región (la más cercana a ti).
4. Espera ~2 minutos a que el proyecto se inicialice.

### 3. Ejecutar el SQL

1. En Supabase, ve a **SQL Editor → New Query**.
2. Copia y pega el contenido de `supabase/schema.sql`.
3. Clic en **Run** (▶).

> Esto crea las tablas `profiles`, `subjects`, `resources`, el bucket `semester-files`, las políticas RLS y el trigger de auto-perfil.

### 4. Activar Email Auth

1. Ve a **Authentication → Providers**.
2. Asegúrate de que **Email** está habilitado.
3. Opcional: desactiva "Confirm email" para pruebas rápidas (Authentication → Settings → Disable email confirmations).

### 5. Verificar bucket de Storage

1. Ve a **Storage**.
2. Confirma que el bucket `semester-files` fue creado por el SQL.
3. Si no aparece, créalo manualmente: **New Bucket → nombre: `semester-files` → privado (no público)**.

### 6. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y rellena con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Encuentra estas credenciales en: **Supabase → Settings → API**.

### 7. Correr el proyecto localmente

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### 8. Build para producción

```bash
npm run build
npm run preview
```

---

## Estructura del proyecto

```
src/
  components/
    Navbar.jsx            # Barra superior con búsqueda y usuario
    Sidebar.jsx           # Menú lateral con semestres
    Layout.jsx            # Wrapper con navbar + sidebar
    SemesterCard.jsx      # Tarjeta de semestre en Dashboard
    SubjectCard.jsx       # Tarjeta de materia en SemesterPage
    ResourceCard.jsx      # Tarjeta de recurso en SubjectPage
    FileUploadForm.jsx    # Formulario de subida de archivos
    LinkForm.jsx          # Formulario para agregar links
    JoseoForm.jsx         # Formulario para agregar Joseos
    SearchBar.jsx         # Barra de búsqueda global
    FilterBar.jsx         # Filtros por tipo/semestre/materia
    ProtectedRoute.jsx    # Ruta protegida (requiere auth)
    LoadingSpinner.jsx    # Spinner de carga
    EmptyState.jsx        # Estado vacío
    Breadcrumbs.jsx       # Migas de pan
    ConfirmDeleteModal.jsx# Modal de confirmación de borrado

  pages/
    Login.jsx             # Inicio de sesión
    Register.jsx          # Registro de cuenta
    Dashboard.jsx         # Vista principal con semestres
    SemesterPage.jsx      # Materias de un semestre
    SubjectPage.jsx       # Recursos de una materia
    UploadFile.jsx        # Subir archivo
    AddLink.jsx           # Agregar link
    AddJoseo.jsx          # Agregar joseo
    Recents.jsx           # Últimas subidas
    Profile.jsx           # Perfil del usuario
    NotFound.jsx          # 404

  lib/
    supabaseClient.js     # Instancia de Supabase

  services/
    authService.js        # Login, registro, logout
    resourceService.js    # CRUD de recursos
    subjectService.js     # CRUD de materias
    storageService.js     # Subida/descarga de archivos

  constants/
    semesters.js          # Lista de semestres 12-16
    resourceTypes.js      # Tipos de material

  App.jsx                 # Rutas principales
  main.jsx                # Entry point
  index.css               # Tailwind imports
```

---

## Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Redirige a `/dashboard` o `/login` |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/dashboard` | Vista principal |
| `/semester/12` | Materias del semestre 12 |
| `/semester/:id` | Materias de cualquier semestre |
| `/semester/:semester/subject/:subjectId` | Recursos de una materia |
| `/upload` | Subir archivo |
| `/add-link` | Agregar link |
| `/add-joseo` | Agregar joseo |
| `/recents` | Recursos recientes |
| `/profile` | Perfil del usuario |
| `*` | 404 Not Found |

---

## Despliegue (Vercel)

```bash
npm run build
# Subir carpeta dist/ a Vercel, Netlify o cualquier CDN estático
```

En Vercel: agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el panel de configuración.

---

## Notas importantes

- El límite de archivos es **200 MB** por archivo.
- Solo usuarios autenticados pueden ver, subir o eliminar recursos.
- Solo el creador de un recurso o materia puede eliminarlo.
- Los Joseos son un tipo de recurso con `type = 'Joseo'`.
