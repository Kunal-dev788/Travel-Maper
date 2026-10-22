export function emojiToCode(emoji: string): string {
  if (!emoji) return "";
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 127462 && cp <= 127487);
  if (codePoints.length < 2) return "";
  return String.fromCharCode(
    codePoints[0] - 127397,
    codePoints[1] - 127397
  ).toUpperCase();
}

type CountryFlagProps = {
  countryCode?: string;
  emoji?: string;
  className?: string;
  ariaLabel?: string;
};

export default function CountryFlag({
  countryCode,
  emoji = "",
  className,
  ariaLabel,
}: CountryFlagProps) {
  const code = (countryCode || emojiToCode(emoji)).trim().toUpperCase();

  if (code && /^[A-Z]{2}$/.test(code)) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/48x36/${code.toLowerCase()}.png 2x`}
        width="24"
        height="18"
        alt={ariaLabel || code}
        className={className}
        style={{
          verticalAlign: "middle",
          display: "inline-block",
          borderRadius: "2px",
          objectFit: "cover",
        }}
      />
    );
  }

  return <span className={className}>{emoji}</span>;
}
