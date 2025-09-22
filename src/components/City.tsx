import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import BackButton from "./BackButton";
import styles from "./City.module.css";
import Spinner from "./Spinner";
import ReactCountryFlag from "react-country-flag";

const formatDate = (date: string | number | Date | null) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(date ? new Date(date) : new Date());

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

function City() {
  const { id } = useParams();
  const { getCity, currentCity, isLoading } = useCities();

  useEffect(
    function () {
      getCity(id as string);
    },
    [id, getCity]
  );

  const { cityName, emoji, date, notes } = (currentCity as any) || {};
  const code = emojiToCode(emoji);

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.city}>
      <div className={styles.row}>
        <h6>City name</h6>
        <h3>
          <span>
            {code ? (
              <ReactCountryFlag countryCode={code} svg aria-label={cityName} />
            ) : (
              emoji
            )}
          </span>{" "}
          {cityName}
        </h3>
      </div>

      <div className={styles.row}>
        <h6>You went to {cityName} on</h6>
        <p>{formatDate(date || null)}</p>
      </div>

      {notes && (
        <div className={styles.row}>
          <h6>Your notes</h6>
          <p>{notes}</p>
        </div>
      )}

      <div className={styles.row}>
        <h6>Learn more</h6>
        <a
          href={`https://en.wikipedia.org/wiki/${cityName}`}
          target="_blank"
          rel="noreferrer"
        >
          Check out {cityName} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        <BackButton />
      </div>
    </div>
  );
}

export default City;
