export const metadata = {
  title: 'About | yukyu.net',
  description: 'yukyu.netについて'
}

export default function About() {
  return (
    <main className="about-page">
      <h1>
        <span className="slash">/</span>about
      </h1>
      <p>yukyu.netは、yukyuの個人サイトです。</p>
      <p>日々考えたこと、作ったもの、技術的なメモなどを書いています。</p>

      <h2>Contact</h2>
      <ul>
        <li>
          GitHub: <a href="https://github.com/yukyu30">@yukyu30</a>
        </li>
      </ul>

      <h2>Feed</h2>
      <ul>
        <li>
          RSS: <a href="/rss.xml">/rss.xml</a>
        </li>
      </ul>
    </main>
  )
}
