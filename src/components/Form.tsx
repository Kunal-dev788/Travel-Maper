import { useEffect, useState } from "react";
import DatePickerModule from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";
import styles from "./Form.module.css";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { useCities } from "../contexts/CitiesContext";
import CountryFlag from "./CountryFlag";

// react-datepicker v4 is CJS — under Vite 8 the default import may be
// the module wrapper object instead of the component. Unwrap it safely.
const DatePicker =
  typeof DatePickerModule === "function"
    ? DatePickerModule
    : (DatePickerModule as any).default ?? DatePickerModule;

export function convertToEmoji(countryCode: string) {
  if (!countryCode) return "";
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  const codePoints = code.split("").map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const BIGDATACLOUD_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

function Form() {
  const [latParam, lngParam] = useUrlPosition();
  const lat = latParam && !isNaN(parseFloat(latParam)) ? parseFloat(latParam) : null;
  const lng = lngParam && !isNaN(parseFloat(lngParam)) ? parseFloat(lngParam) : null;
  const { createCity, isLoading, cities, error: contextError } = useCities();
  const navigate = useNavigate();

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(
    function () {
      if (lat == null || lng == null) return;

      let isMounted = true;

      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true);
          setGeocodingError("");
          setFormError("");

          let detectedCity = "";
          let detectedCountry = "";
          let detectedCode = "";

          // 1. Try BigDataCloud Reverse Geocoding API with localityLanguage=en per documentation
          try {
            const res = await fetch(
              `${BIGDATACLOUD_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              const code =
                data.countryCode ||
                data.countryCodeAlpha2 ||
                data.countryIsoCode ||
                data.isoCode ||
                "";

              if (code) {
                detectedCode = code;
                detectedCountry = data.countryName || data.country || "";
                detectedCity =
                  data.city ||
                  data.locality ||
                  data.principalSubdivision ||
                  data.localityInfo?.administrative?.find(
                    (a: any) => a.adminLevel && a.adminLevel > 2
                  )?.name ||
                  "";
              }
            }
          } catch {
            // BigDataCloud failed or network blocked; continue to fallback
          }

          // 2. If BigDataCloud didn't return a valid country, fallback to OpenStreetMap Nominatim
          if (!detectedCode) {
            try {
              const nomRes = await fetch(
                `${NOMINATIM_URL}?format=jsonv2&lat=${lat}&lon=${lng}`
              );
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                const address = nomData.address || {};
                const code = address.country_code ? address.country_code.toUpperCase() : "";

                if (code) {
                  detectedCode = code;
                  detectedCountry = address.country || "";
                  detectedCity =
                    address.city ||
                    address.town ||
                    address.village ||
                    address.municipality ||
                    address.hamlet ||
                    address.suburb ||
                    address.county ||
                    address.state ||
                    nomData.name ||
                    "";
                }
              }
            } catch {
              // Nominatim failed
            }
          }

          if (!isMounted) return;

          if (!detectedCode) {
            throw new Error(
              "That doesn't seem to be a city. Click somewhere else 😉"
            );
          }

          setCityName(detectedCity);
          setCountry(detectedCountry);
          setCountryCode(detectedCode);
          setEmoji(convertToEmoji(detectedCode));
        } catch (err: any) {
          if (isMounted) {
            setGeocodingError(err.message ?? "Failed to fetch city data");
          }
        } finally {
          if (isMounted) {
            setIsLoadingGeocoding(false);
          }
        }
      }

      fetchCityData();

      return () => {
        isMounted = false;
      };
    },
    [lat, lng]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!cityName.trim()) {
      setFormError("City name is required.");
      return;
    }

    if (!notes.trim()) {
      setFormError("Adding notes is compulsory before submitting.");
      return;
    }

    if (!date) {
      setFormError("Please select a date for your trip.");
      return;
    }

    if (lat == null || lng == null) {
      setFormError("Location coordinates are missing.");
      return;
    }

    // Check for duplicate entry by name/country or nearby coordinates
    const isDuplicate = cities.some(
      (c) =>
        (c.cityName.trim().toLowerCase() === cityName.trim().toLowerCase() &&
         c.country.trim().toLowerCase() === country.trim().toLowerCase()) ||
        (Math.abs(c.position.lat - lat) < 0.01 &&
         Math.abs(c.position.lng - lng) < 0.01)
    );

    if (isDuplicate) {
      setFormError(`"${cityName}" (${country || "this location"}) is already in your visited list!`);
      return;
    }

    const validDate = date.toISOString();

    const newCity = {
      cityName: cityName.trim(),
      country,
      emoji,
      date: validDate,
      notes: notes.trim(),
      position: { lat, lng },
    };

    const success = await createCity(newCity as any);
    if (success) {
      navigate("/app/cities");
    }
  }

  if (isLoadingGeocoding) return <Spinner />;

  if (lat == null || lng == null)
    return <Message message="Start by clicking somewhere on the map" />;

  if (geocodingError)
    return (
      <div className={styles.form}>
        <Message message={geocodingError} />
        <div className={styles.buttons} style={{ marginTop: "2rem" }}>
          <BackButton />
        </div>
      </div>
    );

  const displayError = formError || contextError;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => {
            setCityName(e.target.value);
            setFormError("");
          }}
          value={cityName}
        />
        <span className={styles.flag}>
          <CountryFlag countryCode={countryCode} emoji={emoji} ariaLabel={country || cityName} />
        </span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName || "this place"}?</label>

        <DatePicker
          id="date"
          onChange={(date: Date | null) => {
            setDate(date);
            setFormError("");
          }}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">
          Notes about your trip to {cityName || "this place"}{" "}
          <span style={{ color: "#ff6b6b" }}>*</span>
        </label>
        <textarea
          id="notes"
          required
          onChange={(e) => {
            setNotes(e.target.value);
            setFormError("");
          }}
          value={notes}
          placeholder="Notes are compulsory (e.g., favorite spots, experiences)..."
        />
      </div>

      {displayError && (
        <p className={styles.error}>
          {displayError}
        </p>
      )}

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
