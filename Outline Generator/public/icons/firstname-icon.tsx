import * as React from "react";

function IconFirstName(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M512 512a256 256 0 110-512 256 256 0 010 512zm0-64a192 192 0 100-384 192 192 0 000 384zM85.333 938.667c0-131.733 106.667-238.4 238.4-238.4h380.534c131.733 0 238.4 106.667 238.4 238.4V960H85.333v-21.333zm64-21.334h725.334v-21.333c0-96.107-77.96-174.4-174.4-174.4H324.267c-96.107 0-174.4 77.96-174.4 174.4v21.333z" />
    </svg>
  );
}

export default IconFirstName;
