// Labbe the flask — the product mascot. Friendly, used sparingly:
// hero corner, loading states, match-found, empty states.
export function FlaskMascot({
  size = 64,
  mood = "happy",
}: {
  size?: number;
  mood?: "happy" | "curious" | "celebrate";
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      {/* flask body */}
      <path
        d="M26 10h12v10.5l9.2 20.7A8 8 0 0 1 39.9 53H24.1a8 8 0 0 1-7.3-11.8L26 20.5V10z"
        fill="#ffffff"
        stroke="#990000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* liquid */}
      <path
        d="M20.2 41.5L23 35.5h18l2.8 6a5 5 0 0 1-4.5 7.2H24.7a5 5 0 0 1-4.5-7.2z"
        fill="#ffcc00"
      />
      {/* rim */}
      <rect x="23" y="7" width="18" height="5.5" rx="2.5" fill="#990000" />
      {/* eyes */}
      {mood === "curious" ? (
        <>
          <circle cx="27.5" cy="29" r="2" fill="#1f1f1f" />
          <circle cx="36.5" cy="29" r="2" fill="#1f1f1f" />
          <circle cx="28.1" cy="28.4" r="0.7" fill="#ffffff" />
          <circle cx="37.1" cy="28.4" r="0.7" fill="#ffffff" />
        </>
      ) : (
        <>
          <circle cx="27.5" cy="29" r="2.2" fill="#1f1f1f" />
          <circle cx="36.5" cy="29" r="2.2" fill="#1f1f1f" />
          <circle cx="28.2" cy="28.3" r="0.8" fill="#ffffff" />
          <circle cx="37.2" cy="28.3" r="0.8" fill="#ffffff" />
        </>
      )}
      {/* mouth */}
      {mood === "celebrate" ? (
        <path
          d="M27 34.5c1.6 2.4 8.4 2.4 10 0"
          stroke="#1f1f1f"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      ) : mood === "curious" ? (
        <circle cx="32" cy="35" r="1.6" fill="#1f1f1f" />
      ) : (
        <path
          d="M28 34c1.2 1.6 6.8 1.6 8 0"
          stroke="#1f1f1f"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {/* cheeks */}
      <circle cx="24.5" cy="33" r="1.5" fill="#990000" opacity="0.15" />
      <circle cx="39.5" cy="33" r="1.5" fill="#990000" opacity="0.15" />
    </svg>
  );
}

// Loading state: mascot with magnifier + "Scanning labs across USC…"
export function MascotLoading({ label }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-10 text-center"
      role="status"
    >
      <div className="relative">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          className="absolute -right-4 -bottom-2"
        >
          <circle cx="11" cy="11" r="7.5" stroke="#990000" strokeWidth="2.5" />
          <path
            d="M16.5 16.5L23 23"
            stroke="#990000"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <MascotPeek size={56} />
      </div>
      <p className="font-medium text-sm text-[#6b645a]">
        {label ?? "Scanning labs across USC…"}
      </p>
    </div>
  );
}

// Small peek used in the hero corner and empty states.
export function MascotPeek({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M26 10h12v10.5l9.2 20.7A8 8 0 0 1 39.9 53H24.1a8 8 0 0 1-7.3-11.8L26 20.5V10z"
        fill="#ffffff"
        stroke="#990000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M20.2 41.5L23 35.5h18l2.8 6a5 5 0 0 1-4.5 7.2H24.7a5 5 0 0 1-4.5-7.2z"
        fill="#ffcc00"
      />
      <rect x="23" y="7" width="18" height="5.5" rx="2.5" fill="#990000" />
      <circle cx="27.5" cy="29" r="2.2" fill="#1f1f1f" />
      <circle cx="36.5" cy="29" r="2.2" fill="#1f1f1f" />
      <circle cx="28.2" cy="28.3" r="0.8" fill="#ffffff" />
      <circle cx="37.2" cy="28.3" r="0.8" fill="#ffffff" />
      <path
        d="M28 34c1.2 1.6 6.8 1.6 8 0"
        stroke="#1f1f1f"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="33" r="1.5" fill="#990000" opacity="0.15" />
      <circle cx="39.5" cy="33" r="1.5" fill="#990000" opacity="0.15" />
    </svg>
  );
}
