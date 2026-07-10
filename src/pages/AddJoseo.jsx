import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import JoseoForm from '../components/JoseoForm'
import { Zap } from 'lucide-react'

export default function AddJoseo() {
  const [params] = useSearchParams()
  const semester    = params.get('semester')    || ''
  const subjectId   = params.get('subject')     || ''
  const subjectName = params.get('subjectName') || ''

  return (
    <Layout>
      <Breadcrumbs items={[{ label: 'Publicar Joseo' }]} />
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Publicar Joseo ⚡</h1>
            <p className="text-sm text-gray-400">Comparte oportunidades, becas, contactos o cualquier info útil</p>
          </div>
        </div>
        <JoseoForm
          defaultSemester={semester}
          defaultSubjectId={subjectId}
          defaultSubjectName={subjectName}
        />
      </div>
    </Layout>
  )
}
