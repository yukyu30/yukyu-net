/**
 * remark plugin: bare URL paragraphs become <LinkCard url="..." /> JSX nodes.
 *
 * Detects:
 *   - paragraph with a single autolink whose text equals its href (remark-gfm output)
 *   - paragraph with a single text node that is just an http(s) URL
 */
export default function remarkLinkCard() {
  return tree => {
    if (!tree || !Array.isArray(tree.children)) return
    const children = tree.children
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      if (!node || node.type !== 'paragraph') continue
      const url = paragraphToCardUrl(node)
      if (!url) continue
      children[i] = {
        type: 'mdxJsxFlowElement',
        name: 'LinkCard',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'url', value: url }
        ],
        children: []
      }
    }
  }
}

function paragraphToCardUrl(paragraph) {
  if (!Array.isArray(paragraph.children) || paragraph.children.length !== 1) {
    return null
  }
  const only = paragraph.children[0]
  if (!only) return null
  if (only.type === 'link') {
    if (!Array.isArray(only.children) || only.children.length !== 1) return null
    const child = only.children[0]
    if (!child || child.type !== 'text') return null
    const text = String(child.value ?? '').trim()
    if (text === only.url && /^https?:\/\//.test(only.url)) return only.url
    return null
  }
  if (only.type === 'text') {
    const text = String(only.value ?? '').trim()
    if (/^https?:\/\/\S+$/.test(text)) return text
  }
  return null
}
