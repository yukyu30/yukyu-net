import { getAllPosts } from '@/lib/posts'

export function SiteFooter() {
  const total = getAllPosts().length
  return (
    <footer className="site-footer">
      <div>
        <div className="site-footer__head">About</div>
        <div className="site-footer__body">yukyu — Tokyo<br />since 2019</div>
      </div>
      <div>
        <div className="site-footer__head">Stats</div>
        <div className="site-footer__body">{total} entries</div>
      </div>
      <div>
        <div className="site-footer__head">Subscribe</div>
        <div className="site-footer__body">RSS · ATOM</div>
      </div>
      <div className="site-footer__col-right">
        <div className="site-footer__head">License</div>
        <div className="site-footer__body">© {new Date().getFullYear()}<br />cc by-nc-sa 4.0</div>
      </div>
    </footer>
  )
}
