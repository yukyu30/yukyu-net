// @ts-check
/**
 * remark プラグイン: 単独行のベタ貼り URL を <LinkCard url="..." /> に変換する。
 *
 * - `[text](url)` のリンク記法はそのまま（テキストと URL が異なるため対象外）。
 * - 段落の唯一の子が URL のときだけ変換する（文中インラインの URL は対象外）。
 *
 * Nextra ではユーザー指定の remarkPlugins が remark-gfm より前に実行されるため、
 * 通常はベタ貼り URL は `text` ノードのまま渡ってくる。ただし将来的な
 * オートリンク（`link` ノード）にも備えて両方を扱う。
 */

const URL_RE = /^https?:\/\/[^\s<>]+$/

/**
 * 段落ノードがベタ貼り URL 単独なら、その URL を返す。違えば null。
 * @param {any} node
 * @returns {string | null}
 */
export function bareUrlFromParagraph(node) {
  if (
    !node ||
    node.type !== 'paragraph' ||
    !Array.isArray(node.children) ||
    node.children.length !== 1
  ) {
    return null
  }

  const child = node.children[0]

  // remark-gfm より前: ベタ貼り URL はただの text ノード
  if (child.type === 'text' && typeof child.value === 'string') {
    const value = child.value.trim()
    if (URL_RE.test(value)) return value
  }

  // gfm オートリンク後: text と url が一致する link ノード
  if (
    child.type === 'link' &&
    typeof child.url === 'string' &&
    URL_RE.test(child.url) &&
    Array.isArray(child.children) &&
    child.children.length === 1 &&
    child.children[0].type === 'text' &&
    typeof child.children[0].value === 'string' &&
    child.children[0].value.trim() === child.url
  ) {
    return child.url
  }

  return null
}

/**
 * @param {string} url
 * @returns {any} mdxJsxFlowElement ノード
 */
function createLinkCardNode(url) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'LinkCard',
    attributes: [{ type: 'mdxJsxAttribute', name: 'url', value: url }],
    children: []
  }
}

/**
 * コンテナノードの children を走査して置換する。
 * @param {any} node
 */
function walk(node) {
  if (!node || !Array.isArray(node.children)) return
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const url = bareUrlFromParagraph(child)
    if (url) {
      node.children[i] = createLinkCardNode(url)
      continue
    }
    walk(child)
  }
}

/**
 * @returns {(tree: any) => void}
 */
export default function remarkLinkCard() {
  return tree => {
    walk(tree)
  }
}
