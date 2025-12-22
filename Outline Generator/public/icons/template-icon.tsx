// icon:template | Tabler Icons https://tablericons.com/ | Csaba Kissi
import * as React from "react";

function IconTemplate(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M5 4 H19 A1 1 0 0 1 20 5 V7 A1 1 0 0 1 19 8 H5 A1 1 0 0 1 4 7 V5 A1 1 0 0 1 5 4 z" />
      <path d="M5 12 H9 A1 1 0 0 1 10 13 V19 A1 1 0 0 1 9 20 H5 A1 1 0 0 1 4 19 V13 A1 1 0 0 1 5 12 z" />
      <path d="M14 12h6M14 16h6M14 20h6" />
    </svg>
  );
}

export default IconTemplate;
