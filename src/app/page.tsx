import Link from 'next/link'
import { getAllPosts, getWorks } from '@/lib/posts'
import { PostIndexTable } from '@/components/post-index-table'

export const metadata = {
  title: 'yukyu.net',
  description: '技術と表現のあいだで、インターネット上の創作体験を形にする。'
}

const RECENT_POSTS = 8

const SOCIAL_LINKS: Array<{ name: string; url: string }> = [
  { name: 'X', url: 'https://x.com/yukyu30' },
  { name: 'BlueSky', url: 'https://bsky.app/profile/yukyu.net' },
  { name: 'GitHub', url: 'https://github.com/yukyu30' },
  { name: 'Zenn', url: 'https://zenn.dev/yu_9' },
  { name: 'Instagram', url: 'https://instagram.com/ugo_kun_930' },
  { name: 'SUZURI', url: 'https://suzuri.jp/yukyu30' },
  { name: 'Portfolio', url: 'https://foriio.com/yukyu30' },
  { name: 'YouTube', url: 'https://www.youtube.com/@yukyu30' },
  { name: 'VRChat', url: 'https://vrchat.com/home/user/usr_c3a3cf58-fbf3-420b-9eb2-c9b69d46b5d6' },
  { name: 'RSS', url: '/rss.xml' }
]

const WHAT: string[] = [
  'Web',
  '3D',
  'VR / VRChat',
  'メタバース',
  'AI',
  'デザイン',
  '動画',
  '創作'
]

const HOW: string[] = [
  '実装',
  '研究',
  'デザイン',
  '3D制作',
  'R&D',
  '業務効率化'
]

const WHERE: string[] = [
  'クリエイターEC',
  'Webサービス',
  'メタバース',
  'VRChat',
  '3Dコンテンツ',
  '事業開発'
]

export default function Home() {
  const posts = getAllPosts()
  const recent = posts.slice(0, RECENT_POSTS)
  const works = getWorks()
  const recentWorks = works.filter(p => p.frontMatter.thumbnail).slice(0, 3)
  const total = posts.length

  return (
    <div className="page">
      <section className="lp-hero">
        <p className="lp-hero__caption">// yukyu.net</p>
        <h1 className="lp-hero__title">
          <span className="lp-hero__title-slash">/</span>yukyu
        </h1>
        <p className="lp-hero__lead">
          技術と表現のあいだで、インターネット上の創作体験を形にする。
        </p>
      </section>

      <section className="axes">
        <div className="axes__row">
          <div className="axes__label">// what</div>
          <div className="axes__body">
            <ul className="axes__list">
              {WHAT.map(w => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </div>

        <div className="axes__row">
          <div className="axes__label">// why</div>
          <div className="axes__body">
            <p className="axes__text">
              中学生のころ、父親の古いノートパソコンを譲り受けて、VocaloidやUTAUを使った動画をインターネットに投稿しはじめた。
              創作や表現が技術を介して人に届くことに、ずっと関心を持っている。
            </p>
          </div>
        </div>

        <div className="axes__row">
          <div className="axes__label">// how</div>
          <div className="axes__body">
            <ul className="axes__list">
              {HOW.map(h => <li key={h}>{h}</li>)}
            </ul>
            <p className="axes__text axes__text--muted">
              ひとつの専門に閉じず、つくりたい体験に合わせて領域を行き来する。
            </p>
          </div>
        </div>

        <div className="axes__row">
          <div className="axes__label">// where</div>
          <div className="axes__body">
            <ul className="axes__list">
              {WHERE.map(w => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </div>

        <div className="axes__row">
          <div className="axes__label">// who</div>
          <div className="axes__body">
            <p className="axes__text axes__text--strong">
              技術と表現のあいだで、創作体験を形にするエンジニア。
            </p>
            <Link href="/posts/me" className="axes__more">もっと見る →</Link>
          </div>
        </div>
      </section>

      <section className="lp-links">
        <div className="lp-links__head">// links</div>
        <ul className="lp-links__list">
          {SOCIAL_LINKS.map(l => (
            <li key={l.name}>
              <a
                href={l.url}
                target={l.url.startsWith('http') ? '_blank' : undefined}
                rel={l.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="lp-links__item"
              >
                {l.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {recentWorks.length > 0 && (
        <section className="lp-works">
          <div className="lp-works__head">
            <span>// recent works</span>
            <Link href="/tags/work" className="lp-works__more">all works →</Link>
          </div>
          <div className="lp-works__grid">
            {recentWorks.map(p => (
              <Link key={p.slug} href={`/posts/${p.slug}`} className="lp-works__card">
                <span className="lp-works__thumb">
                  <img src={p.frontMatter.thumbnail} alt="" loading="lazy" />
                </span>
                <span className="lp-works__date">{p.frontMatter.date}</span>
                <span className="lp-works__title">{p.frontMatter.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="lp-recent">
        <div className="lp-recent__head">
          <span>// recent posts</span>
          <Link href="/posts" className="lp-recent__more">all posts ({total}) →</Link>
        </div>
        <PostIndexTable posts={recent} total={total} startNo={total} />
      </section>
    </div>
  )
}
