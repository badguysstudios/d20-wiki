// Wraps @quartz-community/folder-page so folder listings follow show order.
// Pages with a numeric canon_order (episodes) sort ascending by it; everything
// else keeps the stock order (folders first, newest first, then title).
import { FolderPage as BaseFolderPage, FolderContent } from "@quartz-community/folder-page"

const isFolder = (slug) => (slug ?? "").endsWith("/index") || (slug ?? "").endsWith("/")
const order = (d) => {
  const v = Number(d?.frontmatter?.canon_order)
  return Number.isFinite(v) ? v : null
}
const dateOf = (d) => {
  const t = d?.defaultDateType
  const v = t ? d?.dates?.[t] : undefined
  return v ? new Date(v).getTime() : null
}
const title = (d) => String(d?.frontmatter?.title ?? "").toLowerCase()

export function byShowOrder() {
  return (a, b) => {
    const af = isFolder(a.slug), bf = isFolder(b.slug)
    if (af !== bf) return af ? -1 : 1
    const ao = order(a), bo = order(b)
    if (ao !== null && bo !== null && ao !== bo) return ao - bo
    if (ao !== null && bo === null) return -1
    if (ao === null && bo !== null) return 1
    const ad = dateOf(a), bd = dateOf(b)
    if (ad !== null && bd !== null && ad !== bd) return bd - ad
    if (ad !== null && bd === null) return -1
    if (ad === null && bd !== null) return 1
    return title(a).localeCompare(title(b), undefined, { numeric: true })
  }
}

export const FolderPage = (opts) => BaseFolderPage({ ...(opts ?? {}), sort: byShowOrder() })
export { FolderContent }
