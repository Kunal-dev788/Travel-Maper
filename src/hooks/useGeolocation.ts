import { useState } from "react";

export type LatLng = { lat: number; lng: number };

export function useGeolocation(defaultPosition: LatLng | null = null) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [position, setPosition] = useState<LatLng | null>(defaultPosition);
	const [error, setError] = useState<string | null>(null);
	const [lastErrorCode, setLastErrorCode] = useState<number | null>(null);
	let watchId: number | null = null;

	function mapGeoError(err: GeolocationPositionError): string {
		switch (err.code) {
			case err.PERMISSION_DENIED:
				return "Location permission denied. Allow access in your browser settings and try again.";
			case err.POSITION_UNAVAILABLE:
				return "Location unavailable. Check GPS/Network and try again.";
			case err.TIMEOUT:
				return "Location request timed out. Try again or move to an open area.";
			default:
				return err.message || "Unable to retrieve your location";
		}
	}

	async function ipFallback(): Promise<LatLng | null> {
		try {
			const res = await fetch("https://ipapi.co/json/");
			if (!res.ok) return null;
			const data = await res.json();
			if (typeof data.latitude === "number" && typeof data.longitude === "number") {
				return { lat: data.latitude, lng: data.longitude };
			}
			return null;
		} catch {
			return null;
		}
	}

	async function checkPermission(): Promise<PermissionState | null> {
		try {
			// @ts-expect-error: permissions API types vary by browser
			const status = await navigator.permissions?.query({ name: "geolocation" });
			return status?.state ?? null;
		} catch {
			return null;
		}
	}

	function clearWatch() {
		if (watchId != null && "geolocation" in navigator) {
			navigator.geolocation.clearWatch(watchId);
			watchId = null;
		}
	}

	function getPosition() {
		if (!("geolocation" in navigator)) {
			setError("Your browser does not support geolocation");
			return;
		}

		setIsLoading(true);
		setError(null);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
				setIsLoading(false);
				setError(null);
				setLastErrorCode(null);
			},
			async (err) => {
				setLastErrorCode(err.code);
				if (err.code === err.PERMISSION_DENIED) {
					setError(mapGeoError(err));
					setIsLoading(false);
					return;
				}
				// Try watchPosition
				watchId = navigator.geolocation.watchPosition(
					(pos) => {
						setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
						setIsLoading(false);
						setError(null);
						setLastErrorCode(null);
						clearWatch();
					},
					async (watchErr) => {
						clearWatch();
						// As final fallback, try IP-based geolocation
						const ipPos = await ipFallback();
						if (ipPos) {
							setPosition(ipPos);
							setIsLoading(false);
							setError(null);
							setLastErrorCode(null);
							return;
						}
						setError(mapGeoError(watchErr));
						setIsLoading(false);
						setLastErrorCode(watchErr.code);
					},
					{ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
				);
			},
			{ enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
		);
	}

	return { isLoading, position, error, getPosition, checkPermission, lastErrorCode } as const;
}
