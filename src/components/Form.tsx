// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Button from "./Button";
import BackButton from "./BackButton";

import styles from "./Form.module.css";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode: string) {
  if (!countryCode) return "";
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  const codePoints = code.split("").map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const [latParam, lngParam] = useUrlPosition();
  const lat = latParam ? parseFloat(latParam) : null;
  const lng = lngParam ? parseFloat(lngParam) : null;
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");

  useEffect(
    function () {
      if (lat == null || lng == null) return;

      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true);
          setGeocodingError("");

          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          console.log(data);

          const code =
            data.countryCode ||
            data.countryCodeAlpha2 ||
            data.countryIsoCode ||
            data.isoCode ||
            "";

          if (!code)
            throw new Error(
              "That doesn't seem to be a city. Click somewhere else 😉"
            );

          setCityName(data.city || data.locality || "");
          setCountry(data.countryName || data.country || "");
          setEmoji(convertToEmoji(code));
        } catch (err: any) {
          setGeocodingError(err.message ?? "Failed to fetch city data");
        } finally {
          setIsLoadingGeocoding(false);
        }
      }
      fetchCityData();
    },
    [lat, lng]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cityName || !date || lat == null || lng == null) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date: date.toISOString(),
      notes,
      position: { lat, lng },
    };

    await createCity(newCity as any);
    navigate("/app/cities");
  }

  if (isLoadingGeocoding) return <Spinner />;

  if (lat == null || lng == null)
    return <Message message="Start by clicking somewhere on the map" />;

  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <DatePicker
          id="date"
          onChange={(date) => setDate(date as Date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
