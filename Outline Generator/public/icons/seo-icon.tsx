// icon:seo | Tabler Icons https://tablericons.com/ | Csaba Kissi
import * as React from "react";

function IconSeo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M7 8H4a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 01-1 1H3M14 16h-4V8h4M11 12h2" />
      <path d="M18 8 H20 A1 1 0 0 1 21 9 V15 A1 1 0 0 1 20 16 H18 A1 1 0 0 1 17 15 V9 A1 1 0 0 1 18 8 z" />
    </svg>
  );
}

export default IconSeo;
