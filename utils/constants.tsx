import React from "react";

export const FlagUS = () => (
  <svg viewBox="0 0 640 480" className="h-3 w-3 rounded-sm shadow-sm">
    <path fill="#bd3d44" d="M0 0h640v480H0z" />
    <path
      stroke="#fff"
      strokeWidth="37"
      d="M0 55.4h640M0 129.2h640M0 203h640M0 276.9h640M0 350.8h640M0 424.6h640"
    />
    <path fill="#192f5d" d="M0 0h256v258.5H0z" />
    <circle fill="#fff" cx="128" cy="129" r="80" />
  </svg>
);

export const FlagCA = () => (
  <svg viewBox="0 0 640 480" className="h-3 w-3 rounded-sm shadow-sm">
    <path fill="#ff0000" d="M0 0h640v480H0z" />
    <path fill="#fff" d="M160 0h320v480H160z" />
    <path
      fill="#ff0000"
      d="M320 120l30 80 80 10-60 60 20 80-70-40-70 40 20-80-60-60 80-10z"
    />
  </svg>
);
