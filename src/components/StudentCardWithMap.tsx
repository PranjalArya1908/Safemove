"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io, Socket } from "socket.io-client";

type StudentCardWithMapProps = {
  studentId: number;
  sessionId: string;
  studentName: string;
  phoneNumber?: string;
  imageUrl?: string;
  status?: "inside hostel" | "on a trip";
};

const StudentCardWithMap = ({
  studentId,
  sessionId,
  studentName,
  phoneNumber,
  imageUrl,
  status = "inside hostel",
}: StudentCardWithMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [tracking, setTracking] = useState(false);
  const firstUpdateRef = useRef(true);

  useEffect(() => {
    if (!tracking) {
      // Cleanup map and socket when not tracking
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      firstUpdateRef.current = true;
      return;
    }

    if (!mapContainerRef.current) return;

    // Initialize the map
mapRef.current = L.map(mapContainerRef.current).setView([30.3434826, 77.9374047], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "SafeMove",
    }).addTo(mapRef.current);

    // Initialize socket.io client
    socketRef.current = io('/api/socket', { path: '/api/socket' });

    socketRef.current.on("connect", () => {
      console.log(`StudentCardWithMap: connected to socket with id ${socketRef.current?.id}`);
      // Join the session room
      socketRef.current?.emit("joinSession", sessionId);
    });

    socketRef.current.on("sessionJoined", (data) => {
      console.log(`StudentCardWithMap: sessionJoined event received`, data);
      if (!data.success) {
        console.error(`StudentCardWithMap: Failed to join session: ${data.message}`);
      }
    });

    socketRef.current.on("locationUpdate", ({ latitude, longitude }) => {
      console.log(`StudentCardWithMap: locationUpdate received: (${latitude}, ${longitude})`);
      if (mapRef.current) {
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
        }
        // Pinpoint the location with a popup showing "User Location"
        if (markerRef.current) {
          markerRef.current.bindPopup("User Location").openPopup();
        }
        // Only set view on first update to avoid jarring map movements
        if (firstUpdateRef.current) {
          mapRef.current.setView([latitude, longitude], 13);
          firstUpdateRef.current = false;
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      firstUpdateRef.current = true;
    };
  }, [tracking, sessionId]);

  // Add useEffect to call invalidateSize when tracking becomes true
  useEffect(() => {
    if (tracking && mapRef.current && mapContainerRef.current) {
      // Delay invalidateSize to ensure container height transition completes
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 300);
    }
  }, [tracking]);

  const toggleTracking = () => {
    setTracking((prev) => !prev);
  };

  // Determine dot color based on status
  const statusDotColor = status === "inside hostel" ? "bg-green-500" : "bg-red-500";

  // Function to end trip and update status to "inside hostel"
  const endTrip = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inside hostel' }),
      });
      if (response.ok) {
        alert('Trip ended successfully.');
        // Optionally update UI or state here
      } else {
        const data = await response.json();
        alert('Failed to end trip: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error ending trip: ' + error);
    }
  };

  return (
    <div className="student-card border rounded-lg p-4 mb-4 bg-white shadow-md flex space-x-4 items-center">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${studentName}'s photo`}
          className="w-16 h-16 rounded-full object-cover"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className={`w-4 h-4 rounded-full inline-block ${statusDotColor}`} aria-label={status}></span>
          <h3 className="text-lg text-[#000000] font-semibold">{studentName}</h3>
        </div>
        {phoneNumber && <p className="text-sm text-gray-600">{phoneNumber}</p>}
        <button
          onClick={toggleTracking}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {tracking ? "Stop Tracking" : "Track Location"}
        </button>
        {status !== "inside hostel" && (
          <button
            onClick={endTrip}
            className="mt-2 ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            End Trip
          </button>
        )}
        <div className="map-wrapper mt-2 rounded overflow-hidden" style={{ height: tracking ? "200px" : "0", width: "100%", transition: "height 0.3s ease" }}>
          <div
            ref={mapContainerRef}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-map"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentCardWithMap;
