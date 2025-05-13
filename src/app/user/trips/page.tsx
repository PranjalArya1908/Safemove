'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';



export default function UserTripsPage() {
  const searchParams = useSearchParams();
  const durationHoursParam = searchParams.get('durationHours');

  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extendTime, setExtendTime] = useState(0);
  const [personalMessage, setPersonalMessage] = useState('');
  const [timerDuration, setTimerDuration] = useState(45 * 60); // default 45 minutes in seconds
  const [allowedToExtend, setAllowedToExtend] = useState(false); // New state to control if extension allowed
  const [loading, setLoading] = useState(false); // Loading state for WhatsApp button
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (durationHoursParam) {
      const duration = parseInt(durationHoursParam, 10);
      if (!isNaN(duration) && duration > 0) {
        setTimerDuration(duration * 3600);
      }
    }
  }, [durationHoursParam]);

  // Timer countdown effect
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = window.setInterval(() => {
      setTimerDuration((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          alert('Session expired!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);


 const phoneNumbers = [
    '+918077868866', // Replace with real phone numbers
    '+917505405151',
    '+018077587054',
    '+017534868533',
    '+019773945332',
  ];
  // Function to place a call using tel: link
  const placeCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Function to send email using mailto: link
  const sendEmail = (emails: string[], subject: string, body: string) => {
    const mailtoLink = `mailto:${emails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Handlers for call buttons

  // Helper function to record emergency cause
  const recordEmergencyCause = async (cause: string) => {
    try {
      await fetch('/api/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cause }),
      });
    } catch (error) {
      console.error('Message sent to contacts', error);
    }
  };

  const handleCallHostel = () => {
    recordEmergencyCause('Call Hostel');
    placeCall('+918279454237')
  };

  const handleCallPolice = () => {
    recordEmergencyCause('Call Police');
    placeCall('100');
  };

  const handleEmergency = () => {
    recordEmergencyCause('Emergency');
    const emergencyEmails = ['emergency1@example.com', 'emergency2@example.com', 'emergency3@example.com'];
    const subject = 'Emergency Alert';
    const body = 'This is an emergency alert from SafeMove app user.';
    sendEmail(emergencyEmails, subject, body);
  };

  // Open extend dialog unconditionally (removed allowedToExtend check)
  const openExtendDialog = (time: number) => {
    setExtendTime(time);
    setShowExtendDialog(true);
  };

  const closeExtendDialog = () => {
    setShowExtendDialog(false);
    setExtendTime(0);
    setPersonalMessage('');
  };

  const incrementTime = () => {
    setExtendTime((prev) => prev + 1);
  };

  const decrementTime = () => {
    setExtendTime((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalMessage(e.target.value);
  };

  const sendExtensionRequest = async () => {
    try {
      // Placeholder studentId, replace with actual user id from auth/session
      const studentId = 1;

      const response = await fetch('/api/extension-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          extendMinutes: extendTime,
          personalMessage,
        }),
      });

      if (response.ok) {
        alert('Extension request sent successfully.');
        closeExtendDialog();
      } else {
        const data = await response.json();
        alert('Failed to send extension request: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      if (error instanceof Error) {
        alert('Error sending extension request: ' + error.message);
      } else {
        alert('Error sending extension request: Unknown error');
      }
    }
  };

  // Extend time button handler
  const handleExtendTime = () => {
    // Open the extend time dialog only if allowed
    openExtendDialog(15); // default 15 minutes
  };

  // Time select buttons handler - disabled to prevent changing timer arbitrarily
  const handleTimeSelect = (minutes: number) => {
    // Do nothing or alert user that time cannot be changed manually
    alert('Remaining time can only be changed by admin approval.');
  };

  // Timer display formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative w-full max-w-[390px] h-[844px] bg-white rounded-[40px] shadow-lg flex flex-col px-6 pt-14 pb-6"
      style={{ fontFeatureSettings: "'tnum'" }}
    >
      <div className="mb-6 flex flex-col items-center justify-center">
    {/* <h1 className="text-[14px] font-mono tracking-tight text-gray-900">TRIP STARTED</h1> */}
    <p className="text-[8px] font-mono tracking-tight text-gray-500 mt-2 leading-3 text-center">Your location has been accessed <br /> for safety policy.</p>
  </div>
      
       <div className="mb-6 flex flex-col items-center justify-center">
    <h1 className="text-[42px]  tracking-tighter leading-10 font-extrabold text-center mt-1 text-gray-900">Your <span className="text-blue-600"> trip</span> has <br />
      been <span className="text-blue-600"> Started  </span></h1>
    {/* <p className="text-[12px] font-mono tracking-tight text-gray-500 mt-2 leading-4 text-center">Your location has been accessed <br /> for safety policy.</p> */}
  </div>

      <section
        className="mt-6 bg-white rounded-4xl border border-gray-300   w-[330px] mx-auto text-center"
        style={{ boxShadow: '0 0 10px rgb(59 86 245 / 0.3)' }}
      >
        <p className="text-[9px] font-mono pt-6 text-gray-400 uppercase tracking-widest mb-4">
          Remaining time
        </p>
        <p
          className="text-[72px] font-sans font-extrabold text-black  leading-none"
          style={{ textShadow: '2px 2px 0 rgb(59 86 245 / 0.3)' }}
          aria-live="polite"
        >
          {formatTime(timerDuration)}
        </p>
        <div className="flex align-center  justify-center w-full rounded-4xl pt-4 pb-3 space-x-2 mt-6 bg-blue-200">
        <button
          id="extendBtn"
          className=" bg-[#3b56f5] text-white rounded-full mt-0  px-8 py-3 text-sm font-normal"
          onClick={handleExtendTime}
        >
          Extend Time
        </button>
        
          <button
            className="time-select-btn w-12 h-12 rounded-full border bg-[#3b56f5] text-[#f3f5ff] font-md hover:bg-[#d7dbff] hover:text-[#3b56f5] transition"
            onClick={() => handleTimeSelect(20)}
          >
            20
          </button>
          <button
            className="time-select-btn w-12 h-12 rounded-full border bg-[#3b56f5] text-[#f3f5ff] font-md  hover:bg-[#d7dbff] hover:text-[#3b56f5] transition"
            onClick={() => handleTimeSelect(40)}
          >
            40
          </button>
        </div>
      </section>

      <div className="mt-8 space-y-4 max-w-[350px] mx-auto w-full">
        <button
          className="w-full bg-[#3b56f5] text-white rounded-3xl py-4 text-center text-base font-normal"
          aria-label="Call Hostel"
          onClick={handleCallHostel}
        >
          Call Hostel
        </button>
        <button
          className="w-full bg-[#3b56f5] text-white rounded-3xl py-4 text-center text-base font-normal"
          aria-label="Call Police"
          onClick={handleCallPolice}
        >
          Call Police
        </button>
        {/* <button
          className="w-full bg-[#f2300f] text-white rounded-3xl py-4 text-center text-base font-normal"
          aria-label="Emergency"
          onClick={async () => {
            try {
              // Fetch emergency contacts
              const contactsResponse = await fetch('/api/emergency-contacts');
              if (!contactsResponse.ok) {
                alert('Failed to fetch emergency contacts');
                return;
              }
              const contacts = await contactsResponse.json();
              const phoneNumbers = contacts.map((c: { phone: string }) => c.phone);

              // Send SMS to emergency contacts
              const smsResponse = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phoneNumbers,
                  message: 'Emergency Button Pressed',
                }),
              });

              if (smsResponse.ok) {
                alert('Emergency SMS sent to contacts!');
              } else {
                alert('Failed to send emergency SMS');
              }
            } catch (error) {
              alert('Error sending emergency SMS');
            }
          }}
        >
          Emergency
        </button>
  */}
        <button
          className="w-full bg-[#f2300f] text-white rounded-3xl py-4 text-center text-base font-normal"
          disabled={loading}  // Disable the button when loading is true
          onClick={async () => {
            setLoading(true);  // Set loading to true when the button is clicked
            try {
              const response = await fetch('/api/send-whatsap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: '🚨 Emergency! Please help me immediately!',
                    phoneNumbers: ['+918077868866', '+919773945332', '+918279454237'], // Example phone numbers
                }),
              });

              const result = await response.json();
              if (response.ok) {
                alert(result.message);  // Success message alert
              } else {
                alert('Failed to send WhatsApp emergency message');
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Error sending emergency message.');
            } finally {
              setLoading(false);  // Reset loading state after sending the message
            }
          }}
        >
          {loading ? 'Sending...' : 'Emergency 🚨'}  {/* Conditional button text */}
        </button>
      </div>

      <div
        className="absolute bottom-6 left-6 bg-gray-200 rounded-full flex space-x-4 px-4 py-3"
        style={{ width: '120px' }}
      >
        <button
          className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center text-white"
          aria-label="Settings"
        >
          <i className="fas fa-cog"></i>
        </button>
        <button
          className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center text-white"
          aria-label="Share"
        >
          <i className="fas fa-share-alt"></i>
        </button>
      </div>

      <button
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#a6ff00] flex items-center justify-center shadow-[0_0_15px_5px_rgba(166,255,0,0.7)]"
        aria-label="Chat"
        onClick={() => alert('Chat button clicked!')}
      >
        <i className="fas fa-comment-alt text-black text-lg"></i>
      </button>

      {showExtendDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-start items-center z-50">
          <div
      className="relative w-full max-w-[390px] h-[844px] bg-blue-300 rounded-[40px]  shadow-lg flex flex-col px-6 pt-14 pb-6"
      style={{ fontFeatureSettings: "'tnum'" }}
    >
            <div className="bg-white rounded-4xl p-6 flex flex-col items-center">
              <p className="text-[10px] font-mono text-[#6b6b6b] mb-2 tracking-widest">EXTRA TIME</p>
              <h1 className="text-[64px] font-extrabold font-sans text-black drop-shadow-[2px_2px_2px_rgba(99,102,241,0.5)] mb-6 select-none">{extendTime}:00</h1>
             <div className="flex align-center  justify-center w-full rounded-3xl pt-3 pb-3 space-x-2  mb-6 bg-blue-200">
        <button
          id="extendBtn"
          className=" bg-[#3b56f5] text-white rounded-full mt-0  px-8 py-3 text-sm font-normal"
          onClick={handleExtendTime}
        >
          Extend Time
        </button>
        
          <button
            className="time-select-btn w-12 h-12 rounded-full border bg-[#3b56f5] text-[#f3f5ff] font-md hover:bg-[#d7dbff] hover:text-[#3b56f5] transition"
            onClick={() => handleTimeSelect(20)}
          >
            20
          </button>
          <button
            className="time-select-btn w-12 h-12 rounded-full border bg-[#3b56f5] text-[#f3f5ff] font-md  hover:bg-[#d7dbff] hover:text-[#3b56f5] transition"
            onClick={() => handleTimeSelect(40)}
          >
            40
          </button>
        </div>
              <div className="w-full mb-6">
                <p className="text-sm font-normal text-black mb-2">Select time</p>
                <div className="flex items-center space-x-2">
                  <button className="text-[#ffffff] font-bold bg-[#5c6bf2] p-2 rounded-4xl text-2xl select-none" onClick={incrementTime}>+</button>
                  <span className="text-black font-extrabold text-2xl select-none">{extendTime}</span>
                  <button className="text-[#ffffff] font-bold text-2xl select-none  bg-[#5c6bf2] p-2 rounded-4xl" onClick={decrementTime}>-</button>
                </div>
                <hr className="border-t border-gray-300 mt-3" />
              </div>
              
              <div className="w-full mb-6">
                <p className="text-xs font-normal text-black mb-2">Add personal message</p>
                <div className="flex items-center space-x-2">
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black text-lg shadow">
                    <i className="fas fa-microphone"></i>
                  </button>
                  <input
                    type="text"
                    placeholder="Record your msg"
                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-xs text-black focus:outline-none"
                    value={personalMessage}
                    onChange={handleMessageChange}
                  />
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black text-lg shadow">
                    <i className="fas fa-upload"></i>
                  </button>
                </div>
              </div>


              <button
                className="w-full bg-[#ff524c] text-white text-xs font-normal rounded-full py-5"
                onClick={sendExtensionRequest}
              >
                Send Extension Request
              </button>
              <button
                className="mt-4 w-full bg-gray-300 text-black text-xs font-normal rounded-full py-5"
                onClick={closeExtendDialog}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
