// Per-page SEO tags. Drop <SEO ... /> at the top of any page component to
// override the global <title>, meta description, canonical URL, and OG/
// Twitter cards. Helmet hoists these into the document <head> at runtime
// (and at build time once we add prerendering — same component, no rewrite).

import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://ads.managingseo.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/lovable-uploads/ads-analysis-by-managingseo.png`;

interface SEOProps {
  title: string;
  description: string;
  /** Override canonical (defaults to current route on SITE_URL). */
  canonical?: string;
  /** Override OG image (absolute URL). */
  ogImage?: string;
  /** "article" for guides/case studies, "website" otherwise. */
  ogType?: "website" | "article";
  /** Set to true on pages that should NOT be indexed (auth pages, etc.). */
  noindex?: boolean;
  /** Optional JSON-LD structured data. */
  schema?: Record<string, unknown>;
}

export default function SEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  schema,
}: SEOProps) {
  const location = useLocation();
  const url = canonical || `${SITE_URL}${location.pathname}`;
  const fullTitle = title.includes("ManagingSEO") ? title : `${title} | Ads Analysis by ManagingSEO`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Ads Analysis by ManagingSEO" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
