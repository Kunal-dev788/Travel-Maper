import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import styles from "./Map.module.css";
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Button from "./Button";
import Message from "./Message";
import CountryFlag from "./CountryFlag";

// Standard Leaflet icon setup for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

type LatLngTuple = [number, number];

function Map() {
  const { cities } = useCities();
  const [mapPosition, setMapPosition] = useState<LatLngTuple>([20.5937, 78.9629]);
  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    getPosition,
    error: geoError,
  } = useGeolocation();
  const [mapLat, mapLng] = useUrlPosition();
  const navigate = useNavigate();

  useEffect(
    function () {
      if (mapLat && mapLng && !isNaN(parseFloat(mapLat)) && !isNaN(parseFloat(mapLng))) {
        setMapPosition([parseFloat(mapLat), parseFloat(mapLng)]);
      }
    },
    [mapLat, mapLng]
  );

  useEffect(
    function () {
      if (geolocationPosition) {
        setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
        navigate(`/app/form?lat=${geolocationPosition.lat}&lng=${geolocationPosition.lng}`);
      }
    },
    [geolocationPosition, navigate]
  );

  const hasSelectedCoords =
    mapLat &&
    mapLng &&
    !isNaN(parseFloat(mapLat)) &&
    !isNaN(parseFloat(mapLng));
  const selectedLat = hasSelectedCoords ? parseFloat(mapLat) : null;
  const selectedLng = hasSelectedCoords ? parseFloat(mapLng) : null;

  return (
    <div className={styles.mapContainer}>
      {!geolocationPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading..." : "Use your position"}
        </Button>
      )}
      {geoError && <Message message={geoError} />}

      <MapContainer
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>
                <CountryFlag emoji={city.emoji} ariaLabel={city.cityName} />
              </span>{" "}
              <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}

        {selectedLat !== null && selectedLng !== null && (
          <Marker position={[selectedLat, selectedLng]} key={`selected-${selectedLat}-${selectedLng}`}>
            <Popup>
              <span>📍 Selected Location</span>
            </Popup>
          </Marker>
        )}

        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }: { position: LatLngTuple }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [map, position]);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => {
      navigate(`/app/form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
  return null;
}

export default Map;
