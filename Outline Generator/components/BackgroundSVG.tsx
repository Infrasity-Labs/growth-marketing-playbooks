 const BackgroundSVG = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 944 564"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full object-cover"
      preserveAspectRatio="xMidYMid slice"
      style={{
        animation: 'pulse-slow 4s ease-in-out infinite'
      }}
    >
      <g filter="url(#filter0_f_913_2290)">
        <path
          d="M472 369.154C624.983 369.154 749 330.255 749 282.272C749 234.289 624.983 195.39 472 195.39C319.017 195.39 195 234.289 195 282.272C195 330.255 319.017 369.154 472 369.154Z"
          fill="#232DE3"
          style={{
            animation: 'glow 6s ease-in-out infinite',
            transformOrigin: 'center'
          }}
        />
      </g>
      <defs>
        <filter id="filter0_f_913_2290" x="0.240005" y="0.630386" width="943.52" height="563.283" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="97.38" result="effect1_foregroundBlur_913_2290" />
        </filter>
      </defs>
    </svg>
  );

  export default BackgroundSVG;
