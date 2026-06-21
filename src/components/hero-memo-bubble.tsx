import { Link } from "next-view-transitions";
import { fetchLatestMemos } from "@/lib/memos-feed";

// トップのヒーローに最新の memo を吹き出しで載せる（PC は3つ・モバイルは2つ）。
// 公開 RSS（/u/ugo/rss.xml）から取得するため API トークンは不要。
export async function HeroMemoBubbles() {
  const memos = await fetchLatestMemos(3);
  if (memos.length === 0) return null;

  return (
    <div className="hero-bubbles">
      {memos.map((memo, i) => (
        <Link
          key={memo.id}
          href="/memos"
          // 3つめ(index 2)はモバイルでは隠す
          className={`hero-bubble${i === 2 ? " hero-bubble--pc-only" : ""}`}
          aria-label="memo を読む"
        >
          <div className="hero-bubble__body">
            <p className="hero-bubble__text">{memo.text}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
