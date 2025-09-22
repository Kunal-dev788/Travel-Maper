import { Link } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import styles from "./CityItem.module.css";
import ReactCountryFlag from "react-country-flag";

const formatDate = (date: string | number | Date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

type CityProp = {
  id: number;
  cityName: string;
  emoji: string;
  date: string;
  position: { lat: number; lng: number };
  country?: string;
};

function emojiToCode(emoji: string): string {
  if (!emoji) return "";
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 127462 && cp <= 127487);
  if (codePoints.length < 2) return "";
  const code = String.fromCharCode(
    codePoints[0] - 127397,
    codePoints[1] - 127397
  );
  return code.toUpperCase();
}

function CityItem({ city }: { city: CityProp }) {
  const { currentCity, deleteCity } = useCities();
  const { cityName, emoji, date, id, position } = city;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    deleteCity(id);
  }

  const isActive = (currentCity as any)?.id === id;
  const code = emojiToCode(emoji);

  return (
    <li>
      <Link
        className={`${styles.cityItem} ${
          isActive ? styles["cityItem--active"] : ""
        }`}
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
      >
        <span className={styles.emoji}>
          {code ? (
            <ReactCountryFlag countryCode={code} svg aria-label={city.country || code} />
          ) : (
            emoji
          )}
        </span>
        <h3 className={styles.name}>{cityName}</h3>
        <time className={styles.date}>({formatDate(date)})</time>
        <button className={styles.deleteBtn} onClick={handleClick}>
          &times;
        </button>
      </Link>
    </li>
  );
}

export default CityItem;
