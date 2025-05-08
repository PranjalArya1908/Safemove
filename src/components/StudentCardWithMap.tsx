"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
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
      return;
    }

    if (!mapContainerRef.current) return;

    // Initialize the map
    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // Initialize socket.io client
    socketRef.current = io();

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
        mapRef.current.setView([latitude, longitude], 13);
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
    };
  }, [tracking, sessionId]);

  const toggleTracking = () => {
    setTracking((prev) => !prev);
  };

  // Determine dot color based on status
  const statusDotColor = status === "inside hostel" ? "bg-green-500" : "bg-red-500";

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
          <h3 className="text-lg font-semibold">{studentName}</h3>
        </div>
        {phoneNumber && <p className="text-sm text-gray-600">{phoneNumber}</p>}
        <button
          onClick={toggleTracking}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {tracking ? "Stop Tracking" : "Track Location"}
        </button>
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
