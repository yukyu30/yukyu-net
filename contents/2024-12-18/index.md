---
id: 6730a36712314a225c946122
title: 2024年の"推し"本 (18日目) ~アーキテクチャの生態系~
created_at: 2024-12-17T16:07:40.817Z
updated_at: 2024-12-29T16:28:08.288Z
tags: ["Advent Calendar", "読書"]
---

この記事は[2024年の"推し"本 Advent Calendar 2024](https://adventar.org/calendars/10126)の18日目です。

<div class="iframely-embed" data-embedded-url="https://adventar.org/calendars/10126"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://adventar.org/calendars/10126/embed" data-iframely-url="//cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fadventar.org%2Fcalendars%2F10126&key=878c5bef402f0b2911bf6d4ce6261abd">2024年の&#34;推し&#34;本 Advent Calendar 2024 - Adventar</a></div></div><script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>


[自分のブクログ](https://booklog.jp/users/ugokun)で2024年で読了になっている本は以下のとおりでした。
![SCR-20241110-sntp.png](SCR-20241110-sntp.png)

この中から推したい本は**「アーキテクチャの生態系」**です。
　
## アーキテクチャ は、人に何かを強制的に従わせるもの
本のタイトルに含まれる、アーキテクチャは建造物やWebアプリケーションの構成のことではなく、「無意識のうちに、人に何かを強制的に従わせるもの」を示します。

一例を挙げると、
飲酒運転を規制するため法律を制定しても、規制される側が「お酒を飲んだ後に車を運転しても良い」という価値観を持っていた場合この法律は有効に機能しません。そこで、車自体にアルコール検出機をつけて、飲酒をしている場合にはエンジンがかからないというにすることで、飲酒運転ができないように強制的に従わせることができます。

この本では、アーキテクチャの「ルールや価値観を内面化する必要がない」「人を無意識のうちに操作できる」といった特徴を肯定的に捉え、Googleやニコニコ動画、はてなダイアリー、mixi、2ちゃんねる、ボーカロイド、Winnyなどにあるアーキテクチャについて読み解いていきます。

最近話題のmixi2の、「招待コードを含むURLからアクセスしないと、登録できない」という仕様も、人々にmixi2を他のSNSでシェアさせるというアーキテクチャですね。

## 推しポイント「考え方が観点が一つ増えた」
物事をアーキテクチャとして捉えることで今までとは違う見方ができるようになりました。

### Webアプリケーションの構成、フレームワークも、結局はアーキテクチャ
Webアプリケーションの構成図・システム構成図により、ユーザー・アプリケーションができることが決まります。システム構成は、いかに拡張性があり柔軟性があるものにするかという観点で見ていましたが、考えなくて良いことが決まり、開発を円滑に進めるために決めるという観点があるということに気づきました。

Ruby on Railsも、モデルにcreated_at, updated_atカラムを追加するかどうかなどを考えず、一般的なベストプラクティスが自動で適用されることから、一種のアーキテクチャだなと考えられるようになりました。


### プロダクト開発・施策立案をアーキテクチャという観点から考える
プロダクトに新しい機能をつくったので、お知らせして使ってもらおうと考えますが、ユーザが能動的にアクションをしなくても使ってしまうということをできないかなどを考えることがありました。

たとえば、画像をアップロードしてTシャツが作れるサイトで、Xアカウントで新規登録したら、最新ポストの画像でTシャツをプレビューしてみせるなど、使おうとしなくても試してしまうという手法はないかなといったことを考えることができるようになりました。

## 終わりに
<div class="iframely-embed" data-embedded-url="https://www.amazon.co.jp/%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E3%81%AE%E7%94%9F%E6%85%8B%E7%B3%BB-%E6%83%85%E5%A0%B1%E7%92%B0%E5%A2%83%E3%81%AF%E3%81%84%E3%81%8B%E3%81%AB%E8%A8%AD%E8%A8%88%E3%81%95%E3%82%8C%E3%81%A6%E3%81%8D%E3%81%9F%E3%81%8B-%E3%81%A1%E3%81%8F%E3%81%BE%E6%96%87%E5%BA%AB-%E6%BF%B1%E9%87%8E-%E6%99%BA%E5%8F%B2/dp/4480431837/ref=sr_1_1?crid=3R3MXQGCVVLIM&dib=eyJ2IjoiMSJ9.F9TiZIKrd7IgGuswSkZLBfG2zPizRBQcSJnsK1i9LkYkx3sxscjKfsetWp2p8GMEr8h5N2E2XfsI3IImFHp7_fP9inzmlC7ReG9awoeC0yu3QzLkQKb_tRqtd-VK708V6waXm352VyfBlSHPjhqbErWEQnB2y2XisZ5UOJjlvwc9-LdbZwJcIemCrE33RUlHLFS8p9wU7eqUUmiB1GyVVKOHDUPq6ZMgAfrbU10ZWfTHzdt-DNNYxhN864QlJGvwxOiRCKeePFiKlG2k6LpCgg.1KJ83yGVDvf2kg_9wgHLy63lBw2200FNZ3IEWaM9mwg&dib_tag=se&keywords=%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E3%81%AE%E7%94%9F%E6%85%8B%E7%B3%BB&qid=1734451574&sprefix=%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E3%81%AE,aps,203&sr=8-1"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://www.amazon.co.jp/%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E3%81%AE%E7%94%9F%E6%85%8B%E7%B3%BB-%E6%83%85%E5%A0%B1%E7%92%B0%E5%A2%83%E3%81%AF%E3%81%84%E3%81%8B%E3%81%AB%E8%A8%AD%E8%A8%88%E3%81%95%E3%82%8C%E3%81%A6%E3%81%8D%E3%81%9F%E3%81%8B-%E3%81%A1%E3%81%8F%E3%81%BE%E6%96%87%E5%BA%AB-%E6%BF%B1%E9%87%8E-%E6%99%BA%E5%8F%B2/dp/4480431837" data-iframely-url="//cdn.iframe.ly/api/iframe?card=small&url=https%3A%2F%2Fwww.amazon.co.jp%2F%25E3%2582%25A2%25E3%2583%25BC%25E3%2582%25AD%25E3%2583%2586%25E3%2582%25AF%25E3%2583%2581%25E3%2583%25A3%25E3%2581%25AE%25E7%2594%259F%25E6%2585%258B%25E7%25B3%25BB-%25E6%2583%2585%25E5%25A0%25B1%25E7%2592%25B0%25E5%25A2%2583%25E3%2581%25AF%25E3%2581%2584%25E3%2581%258B%25E3%2581%25AB%25E8%25A8%25AD%25E8%25A8%2588%25E3%2581%2595%25E3%2582%258C%25E3%2581%25A6%25E3%2581%258D%25E3%2581%259F%25E3%2581%258B-%25E3%2581%25A1%25E3%2581%258F%25E3%2581%25BE%25E6%2596%2587%25E5%25BA%25AB-%25E6%25BF%25B1%25E9%2587%258E-%25E6%2599%25BA%25E5%258F%25B2%2Fdp%2F4480431837%2Fref%3Dsr_1_1%3Fcrid%3D3R3MXQGCVVLIM%26dib%3DeyJ2IjoiMSJ9.F9TiZIKrd7IgGuswSkZLBfG2zPizRBQcSJnsK1i9LkYkx3sxscjKfsetWp2p8GMEr8h5N2E2XfsI3IImFHp7_fP9inzmlC7ReG9awoeC0yu3QzLkQKb_tRqtd-VK708V6waXm352VyfBlSHPjhqbErWEQnB2y2XisZ5UOJjlvwc9-LdbZwJcIemCrE33RUlHLFS8p9wU7eqUUmiB1GyVVKOHDUPq6ZMgAfrbU10ZWfTHzdt-DNNYxhN864QlJGvwxOiRCKeePFiKlG2k6LpCgg.1KJ83yGVDvf2kg_9wgHLy63lBw2200FNZ3IEWaM9mwg%26dib_tag%3Dse%26keywords%3D%25E3%2582%25A2%25E3%2583%25BC%25E3%2582%25AD%25E3%2583%2586%25E3%2582%25AF%25E3%2583%2581%25E3%2583%25A3%25E3%2581%25AE%25E7%2594%259F%25E6%2585%258B%25E7%25B3%25BB%26qid%3D1734451574%26sprefix%3D%25E3%2582%25A2%25E3%2583%25BC%25E3%2582%25AD%25E3%2583%2586%25E3%2582%25AF%25E3%2583%2581%25E3%2583%25A3%25E3%2581%25AE%2Caps%2C203%26sr%3D8-1&key=878c5bef402f0b2911bf6d4ce6261abd">アーキテクチャの生態系: 情報環境はいかに設計されてきたか (ちくま文庫)</a></div></div><script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>

この本の元になったブログ[濱野智史の「情報環境研究ノート」 | ワイアードビジョン アーカイブ](https://archive.wiredvision.co.jp/blog/hamano/)は無料で読めます

明日は**hiroki_saito_**さんです！お楽しみ！




