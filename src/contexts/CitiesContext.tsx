import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";

export type City = {
  id: number;
  cityName: string;
  country: string;
  emoji: string;
  date: string;
  notes: string;
  position: { lat: number; lng: number };
};

type CitiesState = {
  cities: City[];
  isLoading: boolean;
  currentCity: Partial<City> | {};
  error: string;
};

type CitiesContextValue = {
  cities: City[];
  isLoading: boolean;
  currentCity: Partial<City> | {};
  error: string;
  getCity: (id: number | string) => Promise<void>;
  createCity: (newCity: Omit<City, "id">) => Promise<boolean>;
  deleteCity: (id: number | string) => Promise<void>;
};

const CitiesContext = createContext<CitiesContextValue | undefined>(undefined);

const initialState: CitiesState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

type Action =
  | { type: "loading" }
  | { type: "cities/loaded"; payload: City[] }
  | { type: "city/loaded"; payload: City }
  | { type: "city/created"; payload: City }
  | { type: "city/deleted"; payload: number | string }
  | { type: "rejected"; payload: string };

function reducer(state: CitiesState, action: Action): CitiesState {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
        error: "",
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== Number(action.payload)),
        currentCity: {},
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type");
  }
}

const STORAGE_KEY = "travel_cities";

function CitiesProvider({ children }: { children: ReactNode }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });

      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              dispatch({ type: "cities/loaded", payload: parsed });
              return;
            }
          } catch {
            // invalid json in localstorage, fallback to fetch
          }
        }

        const res = await fetch(`/cities.json`);
        const data: City[] = await res.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...",
        });
      }
    }
    fetchCities();
  }, []);

  const currentCityId = (currentCity as City).id;

  const getCity = useCallback(
    async function getCity(id: number | string) {
      if (Number(id) === currentCityId) return;
      dispatch({ type: "loading" });
      try {
        let cityPool = cities;
        if (!cityPool.length) {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            cityPool = JSON.parse(cached);
          }
        }
        const match = cityPool.find((c) => c.id === Number(id));
        if (match) {
          dispatch({ type: "city/loaded", payload: match });
        } else {
          dispatch({
            type: "rejected",
            payload: "City not found",
          });
        }
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the city...",
        });
      }
    },
    [currentCityId, cities]
  );

  async function createCity(newCity: Omit<City, "id">): Promise<boolean> {
    dispatch({ type: "loading" });
    try {
      // Prevent duplicate entries for the same city name + country or same coordinates
      const isDuplicate = cities.some(
        (c) =>
          (c.cityName.trim().toLowerCase() === newCity.cityName.trim().toLowerCase() &&
           c.country.trim().toLowerCase() === newCity.country.trim().toLowerCase()) ||
          (Math.abs(c.position.lat - newCity.position.lat) < 0.01 &&
           Math.abs(c.position.lng - newCity.position.lng) < 0.01)
      );

      if (isDuplicate) {
        dispatch({
          type: "rejected",
          payload: `"${newCity.cityName}" is already in your visited list!`,
        });
        return false;
      }

      const generated: City = { ...newCity, id: Date.now() } as City;
      const updated = [...cities, generated];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      dispatch({ type: "city/created", payload: generated });
      return true;
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city...",
      });
      return false;
    }
  }

  async function deleteCity(id: number | string) {
    dispatch({ type: "loading" });
    try {
      const updated = cities.filter((city) => city.id !== Number(id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city...",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
