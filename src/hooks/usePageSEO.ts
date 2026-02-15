import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
}

export function usePageSEO({ title, description }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes("Snag") ? title : `${title} | Snag`;
    document.title = fullTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    // OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    // Twitter tags
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", fullTitle);
    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", description);

    return () => {
      document.title = "Snag — Find the flaw before reality does";
    };
  }, [title, description]);
}
