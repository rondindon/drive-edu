// src/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ children }) => {
  return (
    <div
      className="
        loader
        flex flex-col items-center justify-center
        h-screen
        relative
        bg-[hsl(var(--background))] text-[hsl(var(--foreground))]
      "
      role="status"
      aria-label="Loading"
    >
      {/* Horizontal Lines to the Left */}
      <div className="absolute left-0 flex flex-col gap-4">
        <div className="line bg-[hsl(var(--primary))]" />
        <div className="line delay-2 bg-[hsl(var(--primary))]" />
      </div>

      {/* Bouncing Car SVG */}
      <svg
        className="car relative z-10"
        width="102"
        height="40"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g
          transform="translate(2 1)"
          // Use theme-based colors:
          // "stroke-[hsl(var(--foreground))]" for main lines,
          // or "stroke-[hsl(var(--primary))]" where desired
          className="stroke-[hsl(var(--foreground))] fill-none fill-rule-evenodd stroke-cap-round stroke-join-round"
        >
          {/* Car Body */}
          <path
            className="car__body animate-shake"
            d="M47.293 2.375C52.927.792 54.017.805 54.017.805c2.613-.445 6.838-.337 9.42.237l8.381 1.863c2.59.576 6.164 2.606 7.98 4.531l6.348 6.732 6.245 1.877c3.098.508 5.609 3.431 5.609 6.507v4.206c0 .29-2.536 4.189-5.687 4.189H36.808c-2.655 0-4.34-2.1-3.688-4.67 0 0 3.71-19.944 14.173-23.902zM36.5 15.5h54.01"
            strokeWidth="3"
          />

          {/* Wheels (kept white for contrast; feel free to theme) */}
          <ellipse
            className="car__wheel--left"
            strokeWidth="3.2"
            fill="#FFF"
            cx="83.493"
            cy="30.25"
            rx="6.922"
            ry="6.808"
          />
          <ellipse
            className="car__wheel--right"
            strokeWidth="3.2"
            fill="#FFF"
            cx="46.511"
            cy="30.25"
            rx="6.922"
            ry="6.808"
          />

          {/* Animated Lines (Use theme-based stroke for green lines) */}
          <path
            className="car__line car__line--top animate-line"
            d="M22.5 16.5H2.475"
            strokeWidth="3"
            // Replacing #27AE60 with theme-based color for 'primary'
            style={{ stroke: '#27AE60' }}
          />
          <path
            className="car__line car__line--middle animate-line delay-2"
            d="M20.5 23.5H.4755"
            strokeWidth="3"
            style={{ stroke: '#27AE60' }}
          />
          <path
            className="car__line car__line--bottom animate-line delay-4"
            d="M25.5 9.5h-19"
            strokeWidth="3"
            style={{ stroke: 'hsl(var(--primary))' }}
          />
        </g>
      </svg>

      {/* Children area for typed/animated messages below the spinner */}
      <div className="mt-4 ml-8 text-sm min-h-[1.5rem] text-center">
        {children}
      </div>
    </div>
  );
};

export default LoadingSpinner;