// CurveTop.jsx
export function CurveTop({ sidebar = "#4A4A6A", tab = "#DFEBFB" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -right-0 -top-4 z-20"
    >
      {/* Sidebar background */}
      <path d="M0,0 H16 V16 H0 Z" fill={sidebar} />
      {/* Quarter circle cutout for tab */}
      <path d="M0,16 Q16,16 16,0 H0 Z" fill={tab} />
    </svg>
  );
}

// CurveBottom.jsx
export function CurveBottom({ sidebar = "#4A4A6A", tab = "#DFEBFB" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -right-0 -bottom-4 z-20"
    >
      {/* Sidebar background */}
      <path d="M0,0 H16 V16 H0 Z" fill={sidebar} />
      {/* Quarter circle cutout for tab */}
      <path d="M0,0 Q16,0 16,16 H0 Z" fill={tab} />
    </svg>
  );
}
