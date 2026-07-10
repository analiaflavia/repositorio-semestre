import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SemesterCard from '../components/SemesterCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { SEMESTERS } from '../constants/semesters'
import { getSubjects } from '../services/subjectService'
import { getSemesterStats } from '../services/resourceService'
import { useAuth } from '../hooks/useAuth'
import { Upload, Link2, Zap } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const [semesterData, setSemesterData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        SEMESTERS.map(async s => {
          const [subjects, stats] = await Promise.all([
            getSubjects(s.id),
            getSemesterStats(s.id),
          ])
          return { id: s.id, subjectCount: subjects.length, stats }
        })
      )
      const map = {}
      results.forEach(r => { map[r.id] = r })
      setSemesterData(map)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {profile?.full_name?.split(' ')[0] || 'estudiante'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Repositorio del Semestre — DERECHO MÉDICO</p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 flex-wrap">
          <Link to="/upload"
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Upload className="w-3.5 h-3.5" /> Subir archivo
          </Link>
          <Link to="/add-link"
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Link2 className="w-3.5 h-3.5" /> Agregar link
          </Link>
          <Link to="/add-joseo"
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors">
            <Zap className="w-3.5 h-3.5" /> Joseo
          </Link>
        </div>
      </div>

      {/* Semester cards */}
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {SEMESTERS.map(s => (
            <SemesterCard
              key={s.id}
              semester={s}
              subjectCount={semesterData[s.id]?.subjectCount || 0}
              stats={semesterData[s.id]?.stats || {}}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
