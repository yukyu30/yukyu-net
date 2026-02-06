---
id: 67643b243e1a6e2b1afa36d5
title: 新卒Webエンジニアとしての2年を振り返る
created_at: 2023-12-21T15:33:00.000Z
updated_at: 2025-01-01T15:35:51.505Z
tags: ["日記", "つくったもの", "振り返り", "work"]
---

同僚が振り返り記事を書いていたので、良かったなーと思ったので自分も書いてみます！

- [SUZURI での 5 年間でやったこと](https://tanaken0515.hatenablog.com/entry/2023/12/04/000000)
- [新卒 Web エンジニアとして 3 年間やったこと](https://blog.yuta.run/post/2023-12-12-%E6%96%B0%E5%8D%92web%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2%E3%81%A8%E3%81%97%E3%81%A63%E5%B9%B4%E9%96%93%E3%82%84%E3%81%A3%E3%81%9F%E3%81%93%E3%81%A8/)

## 1 年目(2022 年)

###

入社時

- 新卒で入社
- Rails でアプリケーションは作ったことはある
- React などフロントエンドは知っているが、馴染みはない

### 研修

フロントエンドから k8s まで幅広く行いました。
特に印象に残っているのがフロントエンド研修です。
自分たちのグループは忍者スリスリくんワクワクおえかきランドという Web アプリケーションを作りました。
その後、SUZURI で正式に[忍者スリスリくんワクワクおえかきランド](https://suzuri.jp/surisuri_land)としてリリースされました。
リリースのためブラッシュアップをしたエンジニア、デザイナーさんありがとうございました！

- [新卒研修でデータセンターを見学しました](https://tech.pepabo.com/2022/07/21/12th-datacenter-tour/)
- [新卒研修で最高の Web サービスを作りました](https://tech.pepabo.com/2022/07/14/12th-training-frontend/)

### 発注機能での改良

SUZURI 事業部に配属後は、最初に Good First Issue をいくつかこなしていました。その後、最初に担当した大きな施策が発注機能の改良でした。

発注機能で人的ミスを最小化できるようにするような改良を行いました。
発注に関する機能であるためほとんど表には出ませんが、毎日利用される機能なのでいまでも動いています。

SUZURI で買った商品がどのようなフローで発注され、生産されているか全体像を知ることができました。

### デザイン OG 追加

デザインページ(例: https://suzuri.jp/surisurikun/designs/13021630 )の OG[^1]を追加しました。

![デザインOGの例](Designsfromyukyunextblog.png)

[^1]: URL を Twitter や LINE などでシェアしたときに表示される画像のこと

デザインの色に合わせて、背景のグレーを淡色、濃色に変える処理も実装しました。

### スマホケースの iPhone14 のサイズ追加

自分が配属されて少し経ってから iPhone14 が発売されました。
そこで既存のスマホケース各種に iPhone14 サイズを追加を担当しました。

<blockquote class="twitter-tweet" data-dnt="true" align="center"><p lang="ja" dir="ltr">みなみなサマ大変お待たせ申しマシた！！<br><br>すべてのスマホケースがiPhone 14シリーズに対応しマシた📲✨ <br><br>🆕追加機種<br>・iPhone 14<br>・iPhone 14 Plus<br>・iPhone 14 Pro<br>・iPhone 14 Pro MAX<br><br>▼人気のスマホケースを見に行く🚀<a href="https://t.co/tbcQkff6ef">https://t.co/tbcQkff6ef</a> <a href="https://t.co/QH6BIt8md3">pic.twitter.com/QH6BIt8md3</a></p>&mdash; SUZURI公式忍者 忍者スリスリくん (@suzurijp) <a href="https://twitter.com/suzurijp/status/1594568491092172800?ref_src=twsrc%5Etfw">November 21, 2022</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>



SUZURI には全く新しいアイテムを追加する「アイテム追加」と既存のアイテムにサイズを追加する「サイズ追加」があります。
アイテム追加はアップロードされた画像をアイテムに合成する実装が必要となります。

今回はサイズ追加だったので、画像合成の処理を書くことはせず、合成領域の位置調整などを行いました。
実際のグッズとの合成画像の差異が少なくなるよう調整をシビアにやっていくため、根気が必要な施策でした。

普段の開発とは違う単語が出てくるのでその都度理解していくのが難しいかったです。

### アイテム別クーポン機能

利用できるアイテムを限定したクーポン機能を開発しました。

アイテムを限定することで、利用時に対象アイテムがあるかどうかを判断する処理を入れ、
返金時においては対象アイテムだけでの値引き額の按分を行うなどの実装も行いました。
返金の要件を理解することが大変でした。

最終的に按分の処理は綺麗に実装できたので成長を感じた施策でした。

## 2 年目(2023 年)

### イチオシ機能

自分のショップにてイチオシのグッズを先頭に持ってきて固定できるイチオシ機能の開発を行いました。

![イチオシ機能の例](https://yukyu-net-production.s3.ap-northeast-1.amazonaws.com/d43a3cf8-17cd-4d90-83bb-492c348b2875/Ichioshi(1).png)

今までの開発はサーバーサイドの開発で Rails がメインで、既存のコードがあり、変更を加えることが多かったです。
イチオシ機能では GraphQL と React、Rails を使った開発を行いました。

GraphQL はこの時初めてしっかりと触りましたが、mutation? query?と頭の中が整理ができていませんでした。当時は REST API を利用する機会が多く、GraphQL 自体を概念として理解することが難しかったのだと思います。
この時は苦手意識がありましたが、現在は書籍をよんだり、GraphQL が関わる PR のレビューをしたことで、GraphQL に関する知識は最低限身についたかなと思います。

- [マイショップでアイテムを「イチオシ」できるようになりました](https://suzuri.jp/media/journal_ichioshi/)

### 生成 AI を使った商品文生成機能

OpenAI API を利用して、商品文を生成する機能を開発しました。
SUZURI で OpenAI API を使うのが初めて出会ったため、プロンプトの追加や生成などを行うような API Client を作成しました。
趣味で[ChatGPT を利用した Discord Bot を開発](https://zenn.dev/yu_9/articles/737aca68c7fcd8)していたこともあり、API の仕様を理解して中で施策を始めることができました。

SNS でも面白い商品文がシェアされていて、ユーザーの反応が直に見れる CtoC サービスの良さを実感することができる施策でした。

- [Rust で ChatGPT を利用した Discord Bot 作った](https://zenn.dev/yu_9/articles/737aca68c7fcd8)

### スリスリ AI チャット

2 日間の[開発合宿](https://hr.pepabo.com/report/2023/04/06/8730)で作成したアプリケーションをブラッシュアップして[スリスリ AI チャット](https://chat.suzuri.jp/)としてリリースしました。
SUZURI 公式忍者のスリスリくんとチャットができ、さらに商品検索が行える機能です。

どのように実装されているかなどはテックブログの[AI チャットで商品検索 | GPT-3 と LangChain 活用](https://tech.pepabo.com/2023/09/15/introducing-surisuri-ai-chat/)に書かれています。

LangChain とよばれるライブラリと Python を使い実装しました。LangChain に関する日本語の記事は少なく、アップデートも頻繁にあるためドキュメントを読んで実装を進めていきました。
普段の業務では使わない言語とライブラリを使うので、ドキュメントや Issue を読んだりと普段より多くの情報を漁りながら開発を進めました。

OJT をしてくれたエンジニアの先輩と、同期のディレクターで進めた施策で、思い出深い施策です。

- [テーマは”AI で「人類のアウトプットを増やす」” 過去最多！？の 84 名が参加！「お産合宿 2023」](https://hr.pepabo.com/report/2023/04/06/8730)
- [AI（ChatGPT）を搭載したスリスリくんと会話が楽しめる「スリスリ AI チャット（β）」を公開しました！](https://suzuri.jp/media/journal-surisuri-ai-chat-beta/)
- [AI チャットで商品検索 | GPT-3 と LangChain 活用](https://tech.pepabo.com/2023/09/15/introducing-surisuri-ai-chat/)

### 「じゃがりこ」パッケージコンテスト

じゃがりこパッケージコンテストのアプリケーションの開発を行いました。
![じゃがりこの合成画像](Designsfromyukyunextblog.png)

「じゃがりこ」のパッケージの画像合成機能を中心に、画像をアップロードからコンテスト応募までの全機能の開発を行いました。

画像合成の処理を実装するのは初めてでしたが、画像合成に関するドキュメントが整っていたので、ドキュメントとコードを読み解きながら実装を進めることができました。
画像のアップロード、画像の合成は小さな SUZURI を作っているようなものであるため、SUZURI のエンジニアメンバーに相談や質問をしながら、作り上げることができました。
また、社内外で多くの方とやり取りを行うため、仕事の進め方やコミュニケーションなど技術以外の部分でも多くのことを学ぶことができました。

コンテストは、予想を上回る応募数となりました。受賞作品の一部はパッケージになるため、お店に並ぶのが待ち遠しいです。

- [あたいも有名になりたーい!「じゃがりこ」ドリーム 〜あなたのアイデアが「じゃがりこ」に!?「じゃがりこ」パッケージデザインコンテスト〜](https://suzuri.jp/lp/jagarico-dream)
- [「じゃがりこ」と SUZURI のパッケージデザインコンテストが好調 背景から見えたクリエイターコラボのヒント](https://creatorzine.jp/article/detail/4749)

### デジタルコンテンツ検索機能

デジタルコンテンツを検索する機能を開発しました。
![実際の検索画面](DigitalSearch.png)

デジタルコンテンツでは[Searchkick](https://github.com/ankane/searchkick)を導入して、検索を行えるようにしました。
そのため、Index 作成・更新処理の実装、Index するデータの定義、検索 API の実装、検索ページの追加など 0 から実装を行いました。

自分が欲しいものへアクセスできる体験はとても良いので、検索に関する知識をつけていきたいと思いました。

自分が実装したわけではないですが、Searchkick を導入し、類似検索もリリースしました。詳しくは[Searchkick gem の類似検索を活用した類似商品提案](https://tech.pepabo.com/2023/11/23/use-searchkick-similar-items/)をご覧ください。

### デジコン OG

デジタルコンテンツのの OG[^1]を追加しました。

<blockquote class="twitter-tweet" data-dnt="true" align="center"><p lang="ja" dir="ltr">SUZURIでデジタルコンテンツを<br>販売中のクリエイターさんにお知らせ📣<br><br>アイテムURLをペタっとSNSに貼り付けて投稿すると、「いい感じ」のアイテム画像が表示されるようになりマシた🎉<br><br>ご自身のSNSでアイテムを、ﾋﾞｬｽﾋﾞｬｽ紹介してクレよな👀<br><br>「いい感じ」の画像👇<a href="https://t.co/DV3C0khaBh">https://t.co/DV3C0khaBh</a></p>&mdash; SUZURI公式忍者 忍者スリスリくん (@suzurijp) <a href="https://twitter.com/suzurijp/status/1730829151421034673?ref_src=twsrc%5Etfw">December 2, 2023</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>



施策としてはやる予定がなかったのですが、OG を追加したかったので試しに実装したものを見せたところ、ブラッシュアップして、リリースされることになりました。
X での変更を鑑みて、サムネイルと商品の説明を入れるといったスタイルになりました。

## 振り返り

2 年目は AI、じゃがりこパッケージコンテスト、デジタルコンテンツ検索など様々なチャレンジをした年でした。

4 月までは 2 年目なのでまだまだ頑張っていこうと思います。
特に検索周りはまだまだだと思うので、検索に関する知識をつけて、探しやすくしていきたいと思います。

私や新卒の実際の仕事ぶりが気になりましたら[“ゼロから任される” SUZURI の新卒 2 年目コンビに話を聞いてみました](https://hr.pepabo.com/interview/2023/12/15/9386)もご覧ください！！
