import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import FileUploadForm from '../components/FileUploadForm'

export default function UploadFile() {
  const [params] = useSearchParams()
  const semester    = params.get('semester') || ''
  const subjectId   = params.get('subject')  || ''
  const subjectName = params.get('subjectName') || ''

  return (
    <Layout>
      <Breadcrumbs items={[{ label: 'Subir archivo' }]} />

      <div className="max-w-2xl">
        <div className="mt-4 mb-8 pb-6 border-b border-paper-rule">
          <p className="eyebrow mb-2">Nuevo recurso</p>
          <h1 className="font-display text-[32px] leading-none font-semibold tracking-tight text-ink-900">
            Subir archivo
          </h1>
          {subjectName && (
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300 mt-3">
              {subjectName}
            </p>
          )}
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