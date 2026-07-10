export const RESOURCE_TYPES = [
  { value: 'Clase',              label: 'Clase',              icon: '📖', color: 'bg-blue-100 text-blue-700' },
  { value: 'Resumen',            label: 'Resumen',            icon: '📝', color: 'bg-green-100 text-green-700' },
  { value: 'Banco de preguntas', label: 'Banco de preguntas', icon: '❓', color: 'bg-purple-100 text-purple-700' },
  { value: 'Presentación',       label: 'Presentación',       icon: '📊', color: 'bg-orange-100 text-orange-700' },
  { value: 'Guía',               label: 'Guía',               icon: '📋', color: 'bg-teal-100 text-teal-700' },
  { value: 'Tarea',              label: 'Tarea',              icon: '✅', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Video',              label: 'Video',              icon: '🎬', color: 'bg-red-100 text-red-700' },
  { value: 'Joseo',              label: 'Joseo',              icon: '⚡', color: 'bg-amber-100 text-amber-700' },
  { value: 'Otro',               label: 'Otro',               icon: '📁', color: 'bg-gray-100 text-gray-700' },
]

export const SUBJECT_TABS = [
  { value: 'all',                label: 'Todos' },
  { value: 'Clase',              label: 'Clases' },
  { value: 'Resumen',            label: 'Resúmenes' },
  { value: 'Banco de preguntas', label: 'Banco de preguntas' },
  { value: 'Presentación',       label: 'Presentaciones' },
  { value: 'Guía',               label: 'Guías' },
  { value: 'Tarea',              label: 'Tareas' },
  { value: 'Video',              label: 'Videos' },
  { value: 'Joseo',              label: 'Joseos ⚡' },
  { value: 'Otro',               label: 'Otros' },
]

export function getResourceType(value) {
  return RESOURCE_TYPES.find(t => t.value === value) || RESOURCE_TYPES[RESOURCE_TYPES.length - 1]
}
