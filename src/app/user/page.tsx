"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function UserPage() {
  const [scanning, setScanning] = useState(false);
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const html5QrcodeScannerRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const router = useRouter();

  // Function to start the scanner
  const startScanner = async () => {
    if (scanning) return;
    setDecodedText(null);
    setDurationHours(null);
    setCountdown('');
    setScanning(true);

    // Dynamically import html5-qrcode
    const { Html5Qrcode } = await import('html5-qrcode');

    if (html5QrcodeScannerRef.current) {
      await html5QrcodeScannerRef.current.stop().catch(() => {});
      html5QrcodeScannerRef.current.clear().catch(() => {});
    }

    html5QrcodeScannerRef.current = new Html5Qrcode('reader');

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    html5QrcodeScannerRef.current
      .start(
        { facingMode: 'environment' },
        config,
        (decodedResult: any) => {
          try {
            const parsed = JSON.parse(decodedResult);
            if (parsed.content && parsed.durationHours && parsed.createdAt) {
              setDecodedText(parsed.content);
              setDurationHours(parsed.durationHours);
              startCountdown(parsed.createdAt, parsed.durationHours);
              // Automatically navigate to trips page with durationHours
              router.push(`/user/trips?durationHours=${parsed.durationHours}`);

              // Initialize socket connection and start sending location updates
              if (!socketRef.current) {
                socketRef.current = io();
                socketRef.current.on('connect', () => {
                  console.log('Socket connected:', socketRef.current?.id);
                  socketRef.current?.emit('joinSession', parsed.content);
                });
              }

              if (navigator.geolocation) {
                if (watchIdRef.current !== null) {
                  navigator.geolocation.clearWatch(watchIdRef.current);
                }
                watchIdRef.current = navigator.geolocation.watchPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('Sending location update:', latitude, longitude);
                    socketRef.current?.emit('locationUpdate', {
                      sessionId: parsed.content,
                      latitude,
                      longitude,
                    });
                  },
                  (error) => {
                    console.error('Error getting location:', error);
                  },
                  { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
              } else {
                console.error('Geolocation is not supported by this browser.');
              }
            } else {
              setDecodedText(decodedResult);
              setDurationHours(null);
              setCountdown('');
            }
          } catch {
            setDecodedText(decodedResult);
            setDurationHours(null);
            setCountdown('');
          }
        },
        (errorMessage: any) => {
          // console.log('QR Code no match:', errorMessage);
        }
      )
      .catch((err: any) => {
        console.error('Unable to start scanning.', err);
        setScanning(false);
      });
  };

  // Function to stop the scanner
  const stopScanner = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.stop().then(() => {
        html5QrcodeScannerRef.current.clear();
        setScanning(false);
      }).catch(() => {
        setScanning(false);
      });
    } else {
      setScanning(false);
    }

    // Stop watching location
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Countdown timer logic
  const startCountdown = (createdAt: number, durationHours: number) => {
    const endTime = createdAt + durationHours * 3600 * 1000;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setCountdown('Session expired');
        stopScanner();
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(
        `Time left: ${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.stop().catch(() => {});
        html5QrcodeScannerRef.current.clear().catch(() => {});
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const goToTrip = () => {
    if (durationHours !== null) {
      router.push(`/user/trips?durationHours=${durationHours}`);
    } else {
      router.push('/user/trips');
    }
  };

  return (
    <main>
      <div
        className="w-screen h-screen flex justify-center items-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/ChatGPT Image May 6, 2025, 08_23_45 PM.png')" }}
      >
        <div className="container bg-[#cce0ff] p-5 rounded-lg shadow-md max-w-[350px] w-full text-center">
          <h2 className="text-[#003366] mb-5 text-xl font-semibold">Scan QR to Start Session</h2>

          <div className="scrollable-camera-container mx-auto mb-4 border-2 border-[#3399ff] rounded-xl overflow-y-auto relative bg-[#e6f0ff]" style={{ height: '320px', maxWidth: '320px', animation: 'scrollPulse 3s ease-in-out infinite' }}>
            <div id="reader" className="w-full h-full" />
          </div>

          {!scanning ? (
            <button
              onClick={startScanner}
              className="bg-[#0066cc] text-white px-5 py-3 rounded-md text-lg hover:bg-[#004d99] transition"
              type="button"
            >
              Start Camera Scanner
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="bg-red-600 text-white px-5 py-3 rounded-md text-lg hover:bg-red-700 transition"
              type="button"
            >
              Stop Camera Scanner
            </button>
          )}

          {decodedText && (
            <div id="sessionArea" className="mt-5 text-left text-[#003366] text-base">
              <p><strong>Session:</strong> {decodedText}</p>
              {durationHours !== null && <p><strong>Duration:</strong> {durationHours} hours</p>}
              {countdown && <p id="countdown" className="font-bold">{countdown}</p>}
            </div>
          )}

          <div className="mt-8 flex justify-center space-x-4">
            {/* Removed Go to Trip button as navigation will happen automatically on successful scan */}
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes scrollPulse {
          0%, 100% {
            box-shadow: 0 0 10px 2px #3399ff;
          }
          50% {
            box-shadow: 0 0 20px 6px #3399ff;
          }
        }
      `}</style>
    </main>
  );
}
