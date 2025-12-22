// icon:receipt-tax | Tabler Icons https://tablericons.com/ | Csaba Kissi
import * as React from "react";

function IconReceiptTax(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M9 14l6-6" />
      <path
        fill="currentColor"
        d="M10 8.5 A0.5 0.5 0 0 1 9.5 9 A0.5 0.5 0 0 1 9 8.5 A0.5 0.5 0 0 1 10 8.5 z"
      />
      <path
        fill="currentColor"
        d="M15 13.5 A0.5 0.5 0 0 1 14.5 14 A0.5 0.5 0 0 1 14 13.5 A0.5 0.5 0 0 1 15 13.5 z"
      />
      <path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-3-2-2 2-2-2-2 2-2-2-3 2" />
    </svg>
  );
}

export default IconReceiptTax;
