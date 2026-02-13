import { cn } from "@/lib/utils";

interface WLogoProps {
  size?: number;
  className?: string;
}

export function WLogo({ size = 32, className }: WLogoProps) {
  // The inner W glyph scales relative to the container
  const glyphScale = size * 0.45;
  const glyphW = glyphScale;
  const glyphH = glyphScale * (14 / 13); // preserve 13:14 aspect ratio

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-[22%] bg-[#0a0a0a] shrink-0",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 13 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={glyphW}
        height={glyphH}
      >
        <path
          d="M0 0.8C0 0.52 0 0.38 0.055 0.273 0.102 0.179 0.179 0.102 0.273 0.055 0.38 0 0.52 0 0.8 0H3.641c.298 0 .448 0 .559.06.097.052.174.135.22.236.051.114.04.264.02.561L3.547 13.341c-.013.183-.02.274-.05.347a.42.42 0 0 1-.308.287C3.114 14 3.022 14 2.84 14c-.782 0-1.172 0-1.487-.108A1.6 1.6 0 0 1 .108 12.647C0 12.333 0 11.942 0 11.161V0.8Z"
          fill="white"
        />
        <path
          d="M4.947 0.743c.019-.262.028-.393.085-.492a.42.42 0 0 1 .216-.201C5.351 0 5.482 0 5.745 0h2.396c.298 0 .448 0 .559.06.097.052.174.135.22.236.051.114.04.264.02.561L8.053 13.257c-.019.262-.028.393-.085.492a.42.42 0 0 1-.216.201C7.649 14 7.518 14 7.255 14H4.859c-.298 0-.448 0-.559-.06a.42.42 0 0 1-.22-.236c-.051-.114-.04-.264-.02-.561l.887-12.4Z"
          fill="white"
        />
        <path
          d="M9.447 0.743c.019-.262.028-.393.085-.492A.42.42 0 0 1 9.748.05C9.851 0 9.982 0 10.245 0H12.2c.28 0 .42 0 .527.055.094.048.17.124.218.218.055.107.055.247.055.527v10c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C11.48 14 10.92 14 9.8 14h-.441c-.298 0-.448 0-.559-.06a.42.42 0 0 1-.22-.236c-.051-.114-.04-.264-.02-.561l.887-12.4Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
