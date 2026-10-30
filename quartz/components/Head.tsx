import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const fm = (fileData.frontmatter ?? {}) as Record<string, any>
    // seoTitle (frontmatter) replaces the whole <title> for search results; otherwise title + suffix
    const title = fm.seoTitle
      ? String(fm.seoTitle)
      : (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some((e) => e.name === "CustomOgImages")
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    // Structured data (schema.org JSON-LD) so Google understands the show, the site and each episode video
    const siteRoot = url.toString().replace(/\/$/, "") + "/"
    const series = {
      "@type": "TVSeries",
      "@id": siteRoot + "#series",
      name: "D20 Deathmatch",
      description:
        "D20 Deathmatch is a cult classic Dungeons & Dragons actual play series where champions fight to the death in the Grandmaster's arena. D&D PvP battles, live on Twitch.",
      genre: ["Actual play", "Dungeons & Dragons", "Tabletop role-playing game", "Comedy"],
      url: siteRoot + "what-is-d20-deathmatch",
      productionCompany: { "@type": "Organization", name: "Bad Guys Studios", url: "https://ko-fi.com/badguysstudios" },
      sameAs: [
        "https://twitch.tv/D20Deathmatch",
        "https://www.youtube.com/@D20Deathmatch",
        "https://d20deathmatch.com",
        "https://www.patreon.com/c/D20Deathmatch",
        "https://www.tiktok.com/@d20deathmatch",
        "https://www.instagram.com/d20deathmatch",
        "https://bsky.app/profile/d20deathmatch.com",
        "https://x.com/D20Deathmatch",
        "https://www.facebook.com/D20Deathmatch",
      ],
    }
    const graph: Record<string, any>[] = []
    if (fileData.slug === "index") {
      graph.push(
        {
          "@type": "WebSite",
          "@id": siteRoot + "#website",
          name: "The Black Tome: D20 Deathmatch Wiki",
          url: siteRoot,
          description,
          about: { "@id": siteRoot + "#series" },
        },
        series,
      )
    } else if (String(fileData.slug ?? "").toLowerCase() === "what-is-d20-deathmatch") {
      graph.push(series)
    }
    if (fm.video_id && fm.video_upload) {
      const secs = Number(fm.video_duration ?? 0)
      const dur = secs
        ? `PT${Math.floor(secs / 3600)}H${Math.floor((secs % 3600) / 60)}M${secs % 60}S`
        : undefined
      graph.push({
        "@type": "VideoObject",
        name: `${fileData.frontmatter?.title ?? ""} | D20 Deathmatch D&D Actual Play`,
        description,
        thumbnailUrl: `https://i.ytimg.com/vi/${fm.video_id}/hqdefault.jpg`,
        uploadDate: fm.video_upload,
        ...(dur ? { duration: dur } : {}),
        embedUrl: `https://www.youtube.com/embed/${fm.video_id}`,
        contentUrl: `https://www.youtube.com/watch?v=${fm.video_id}`,
        partOfSeries: { "@type": "TVSeries", name: "D20 Deathmatch", "@id": siteRoot + "#series" },
      })
    }
    const jsonLd = graph.length
      ? JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")
      : null

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        {cfg.baseUrl && fileData.slug !== "404" && <link rel="canonical" href={fileData.slug === "index" ? siteRoot : socialUrl} />}
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
