import CountryFlag from "./CountryFlag";
import styles from "./CountryItem.module.css";

export type CountrySummary = { country: string; emoji: string };

function CountryItem({ country }: { country: CountrySummary }) {
  return (
    <li className={styles.countryItem}>
      <CountryFlag emoji={country.emoji} ariaLabel={country.country} />
      <span>{country.country}</span>
    </li>
  );
}

export default CountryItem;
