import ReactCountryFlag from "react-country-flag";
import styles from "./CountryItem.module.css";

export type CountrySummary = { country: string; emoji: string };

function emojiToCode(emoji: string): string {
  if (!emoji) return "";
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 127462 && cp <= 127487); // regional indicators
  if (codePoints.length < 2) return "";
  const code = String.fromCharCode(
    codePoints[0] - 127397,
    codePoints[1] - 127397
  );
  return code.toUpperCase();
}

function CountryItem({ country }: { country: CountrySummary }) {
  const code = emojiToCode(country.emoji);
  return (
    <li className={styles.countryItem}>
      {code ? (
        <ReactCountryFlag countryCode={code} svg aria-label={country.country} />
      ) : (
        <span>{country.emoji || country.country.slice(0, 2).toUpperCase()}</span>
      )}
      <span>{country.country}</span>
    </li>
  );
}

export default CountryItem;
