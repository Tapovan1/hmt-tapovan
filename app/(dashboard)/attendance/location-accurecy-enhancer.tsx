"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { calculateDistance } from "@/lib/utils/location-utils";

interface LocationReading {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface ImprovedGeolocationProps {
  onLocationUpdate: (
    location: {
      latitude: number;
      longitude: number;
      accuracy: number;
      isReliable: boolean;
    } | null
  ) => void;
  targetLocation?: { latitude: number; longitude: number };
  requiredAccuracy?: number; // in meters
  maxTime?: number; // max time to try in milliseconds
  onError?: (error: string) => void;
}

export default function ImprovedGeolocation({
  onLocationUpdate,
  targetLocation,
  requiredAccuracy = 80, // Default 80 meters
  maxTime = 10000, // Default 10 seconds
  onError,
}: ImprovedGeolocationProps) {
  const [status, setStatus] = useState<
    "initial" | "searching" | "improving" | "success" | "error"
  >("initial");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Preparing to get your location..."
  );
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [distanceToTarget, setDistanceToTarget] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Refs to store state between renders
  const locationReadings = useRef<LocationReading[]>([]);
  const watchId = useRef<number | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const bestReading = useRef<LocationReading | null>(null);

  // Function to process a new location reading
  const processLocationReading = (reading: LocationReading) => {
    // Add to readings collection
    locationReadings.current.push(reading);

    // Update best reading if this is better
    if (
      !bestReading.current ||
      reading.accuracy < bestReading.current.accuracy
    ) {
      bestReading.current = reading;
    }

    // Update current accuracy display
    setCurrentAccuracy(reading.accuracy);

    // Calculate distance to target if provided
    if (targetLocation) {
      const distance = calculateDistance(
        reading.latitude,
        reading.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      );
      setDistanceToTarget(distance);
    }

    // Calculate progress percentage
    const elapsed = Date.now() - startTime.current;
    const progressPercent = Math.min(100, (elapsed / maxTime) * 100);
    setProgress(progressPercent);

    // Update status
    if (status !== "improving") {
      setStatus("improving");
      setStatusMessage("Improving location accuracy...");
    }

    // Determine if this reading is reliable enough
    const isReliable = reading.accuracy <= requiredAccuracy;

    // Always update with the latest reading
    onLocationUpdate({
      latitude: reading.latitude,
      longitude: reading.longitude,
      accuracy: reading.accuracy,
      isReliable,
    });

    // If we've reached required accuracy, we can stop
    if (isReliable) {
      setStatus("success");
      setStatusMessage(
        `Location found with good accuracy (±${Math.round(reading.accuracy)}m)`
      );
      stopLocationTracking();
    }
  };

  // Handle position success
  const handlePositionSuccess = (position: GeolocationPosition) => {
    const reading: LocationReading = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    processLocationReading(reading);
  };

  // Handle position error
  const handlePositionError = (error: GeolocationPositionError) => {
    // Only handle error if we don't have any readings yet
    if (locationReadings.current.length > 0) {
      // We have some readings, so use the best one we have
      if (bestReading.current) {
        setStatus("success");
        setStatusMessage(
          `Using best available location (±${Math.round(
            bestReading.current.accuracy
          )}m)`
        );
        return;
      }
    }

    let errorMsg = "Unable to retrieve your location";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMsg =
          "Location access denied. Please enable location services in your browser settings";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMsg = "Location information is unavailable";
        break;
      case error.TIMEOUT:
        errorMsg = "Location request timed out";
        break;
    }

    setStatus("error");
    setStatusMessage(errorMsg);
    if (onError) onError(errorMsg);
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    // Clear watch and timeout
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    if (timeoutId.current !== null) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  };

  // Start location tracking
  const startLocationTracking = () => {
    setStatus("searching");
    setStatusMessage("Getting your location...");
    startTime.current = Date.now();
    locationReadings.current = [];
    bestReading.current = null;

    if (!navigator.geolocation) {
      setStatus("error");
      setStatusMessage("Geolocation is not supported by your browser");
      if (onError) onError("Geolocation is not supported by your browser");
      return;
    }

    // First try to get a quick position with low accuracy
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      (error) => {
        // If high accuracy fails immediately, try again with low accuracy
        if (error.code === error.TIMEOUT) {
          navigator.geolocation.getCurrentPosition(
            handlePositionSuccess,
            handlePositionError,
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        } else {
          handlePositionError(error);
        }
      },
      {
        enableHighAccuracy: false, // Start with low accuracy for speed
        timeout: 5000, // 5 seconds timeout for initial position
        maximumAge: 0,
      }
    );

    // Then start watching for better positions
    watchId.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      (error) => {
        // Don't trigger error if we already have some readings
        if (locationReadings.current.length === 0) {
          handlePositionError(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 15 seconds timeout for high accuracy
        maximumAge: 0,
      }
    );

    // Set timeout to stop after maxTime
    timeoutId.current = setTimeout(() => {
      // If we have any readings, use the best one
      if (bestReading.current) {
        setStatus("success");
        setStatusMessage(
          `Using best available location (±${Math.round(
            bestReading.current.accuracy
          )}m)`
        );
        onLocationUpdate({
          latitude: bestReading.current.latitude,
          longitude: bestReading.current.longitude,
          accuracy: bestReading.current.accuracy,
          isReliable: bestReading.current.accuracy <= requiredAccuracy,
        });
      } else {
        setStatus("error");
        setStatusMessage("Could not get an accurate location in time");
        if (onError) onError("Could not get an accurate location in time");
      }

      stopLocationTracking();
    }, maxTime);
  };

  // Start tracking on mount
  useEffect(() => {
    startLocationTracking();

    // Cleanup on unmount
    return () => {
      stopLocationTracking();
    };
  }, []);

  // Render status indicator
  const renderStatusIndicator = () => {
    switch (status) {
      case "initial":
        return (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span>Preparing to get your location...</span>
          </div>
        );
      case "searching":
        return (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Searching for your location...</span>
          </div>
        );
      case "improving":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>{statusMessage}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                {currentAccuracy && (
                  <div className="text-xs mt-1">
                    Current accuracy: ±{Math.round(currentAccuracy)}m
                    {distanceToTarget &&
                      ` • Distance to target: ${Math.round(distanceToTarget)}m`}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>{statusMessage}</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <div className="flex-1">
              <span>{statusMessage}</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-xs"
                onClick={() => startLocationTracking()}
              >
                Retry
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderStatusIndicator()}

      {status === "success" && locationReadings.current.length > 1 && (
        <div className="text-xs text-gray-500 pl-2">
          Based on {locationReadings.current.length} location readings
        </div>
      )}
    </div>
  );
}
