export const SEMESTERS = [
  { id: '12', label: 'Semestre 12', color: 'blue' },
  { id: '13', label: 'Semestre 13', color: 'indigo' },
  { id: '14', label: 'Semestre 14', color: 'violet' },
  { id: '15', label: 'Semestre 15', color: 'sky' },
  { id: '16', label: 'Semestre 16', color: 'cyan' },
]

export const VALID_SEMESTERS = SEMESTERS.map(s => s.id)

export function getSemester(id) {
  return SEMESTERS.find(s => s.id === id)
}
