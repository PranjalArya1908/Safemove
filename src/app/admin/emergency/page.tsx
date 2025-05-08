"use client";

import React, { useState } from "react";

const EmergencyPage = () => {
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const dialNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const sendLocationAlert = () => {
    if (!navigator.geolocation) {
      setAlertMessage("Geolocation is not supported by your browser.");
      return;
    }

    setSendingAlert(true);
    setAlertMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch("/api/emergency-alerts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setAlertMessage("Alert sent to emergency contacts.");
          } else {
            setAlertMessage(data.error || "Failed to send alert.");
          }
        } catch (error) {
          setAlertMessage("Error sending alert.");
        } finally {
          setSendingAlert(false);
        }
      },
      (error) => {
        setAlertMessage("Unable to retrieve your location.");
        setSendingAlert(false);
      }
    );
  };

  return (
    <div className="min-h-screen w-full p-6 bg-white flex flex-col justify-start max-w-full">
      <h2 className="text-3xl font-semibold text-black mb-4">Emergency Measures</h2>

      <div className="bg-red-100 rounded-xl p-4 space-y-4 flex-grow">
        {/* Call Police */}
        <div className="bg-red-200 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2 text-black">Call Police / Emergency</h3>
          <button
            onClick={() => dialNumber("100")}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
          >
            Call Now
          </button>
        </div>

        {/* Emergency Mobility + Broadcast Alert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-black">Call Emergency Mobility</h3>
            <button
              onClick={() => dialNumber("108")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
            >
              Call now
            </button>
          </div>
          <div className="bg-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-black">Broadcast Alert</h3>
            <button
              onClick={sendLocationAlert}
              disabled={sendingAlert}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full disabled:opacity-50"
            >
              {sendingAlert ? "Sending..." : "Send now"}
            </button>
          </div>
        </div>
      </div>

      {/* Actions Taken */}
      <div className="bg-red-50 rounded-xl p-4 mt-6">
        <h3 className="text-xl font-semibold mb-4 text-black">Actions Taken</h3>
        <div className="space-y-3">
          <div className="bg-red-100 h-8 rounded-md"></div>
          <div className="bg-red-100 h-8 rounded-md"></div>
        </div>
      </div>

      {alertMessage && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">{alertMessage}</div>
      )}
    </div>
  );
};

export default EmergencyPage;
