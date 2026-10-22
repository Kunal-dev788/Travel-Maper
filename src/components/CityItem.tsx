import { Link } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import styles from "./CityItem.module.css";
import CountryFlag from "./CountryFlag";

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

function CityItem({ city }: { city: CityProp }) {
  const { currentCity, deleteCity } = useCities();
  const { cityName, emoji, date, id, position } = city;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    deleteCity(id);
  }

  const isActive = (currentCity as any)?.id === id;

  return (
    <li>
      <Link
        className={`${styles.cityItem} ${
          isActive ? styles["cityItem--active"] : ""
        }`}
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
      >
        <span className={styles.emoji}>
          <CountryFlag emoji={emoji} ariaLabel={city.country || cityName} />
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
