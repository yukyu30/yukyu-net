export const metadata = {
  title: 'About | yukyu.net',
  description: 'yukyu.netについて'
}

export default function About() {
  return (
    <main className="prose">
      <h1>About</h1>
      <p>yukyu.netは、yukyuの個人サイトです。</p>
      <p>
        日々考えたことや作ったもの、技術メモなどを書いています。
      </p>
      <h2>Contact</h2>
      <ul>
        <li>
          GitHub: <a href="https://github.com/yukyu30">@yukyu30</a>
        </li>
      </ul>
    </main>
  )
}
