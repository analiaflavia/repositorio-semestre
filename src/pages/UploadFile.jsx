import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import FileUploadForm from '../components/FileUploadForm'
import { Upload } from 'lucide-react'

export default function UploadFile() {
  const [params] = useSearchParams()
  const semester    = params.get('semester') || ''
  const subjectId   = params.get('subject')  || ''
  const subjectName = params.get('subjectName') || ''

  return (
    <Layout>
      <Breadcrumbs items={[{ label: 'Subir archivo' }]} />
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Upload className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Subir archivo</h1>
            <p className="text-sm text-gray-400">PDF, Word, PPT, Excel, imágenes, videos — máx. 200 MB</p>
          </div>
        </div>
        <FileUploadForm
          defaultSemester={semester}
          defaultSubjectId={subjectId}
          defaultSubjectName={subjectName}
        />
      </div>
    </Layout>
  )
}
