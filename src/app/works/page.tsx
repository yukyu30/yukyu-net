import { getWorks } from '@/lib/posts'
import { WorksGrid } from '@/components/works-grid'

export const metadata = {
  title: 'works | yukyu.net',
  description: 'これまでにつくったもの'
}

export default function WorksPage() {
  const works = getWorks()

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>works
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">{works.length}</div>
            <div className="hero__meta-sub">entries</div>
          </div>
        </div>
      </section>

      <WorksGrid posts={works} />
    </div>
  )
}
