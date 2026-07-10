import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import LinkForm from '../components/LinkForm'
import { Link2 } from 'lucide-react'

export default function AddLink() {
  const [params] = useSearchParams()
  const semester    = params.get('semester')    || ''
  const subjectId   = params.get('subject')     || ''
  const subjectName = params.get('subjectName') || ''

  return (
    <Layout>
      <Breadcrumbs items={[{ label: 'Agregar link' }]} />
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Agregar link</h1>
            <p className="text-sm text-gray-400">Guarda un enlace en la materia correspondiente</p>
          </div>
        </div>
        <LinkForm
          defaultSemester={semester}
          defaultSubjectId={subjectId}
          defaultSubjectName={subjectName}
        />
      </div>
    </Layout>
  )
}
