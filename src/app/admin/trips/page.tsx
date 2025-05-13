"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import StudentCardWithMap from '../../../components/StudentCardWithMap';

export default function AdminTripsPage() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('preselectedStudentId');

  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<{ id: number; name: string; sessionId: string; status: string }[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const [timeMinutes, setTimeMinutes] = useState(40);

  // Update trip time for selected students
  useEffect(() => {
    if (selectedStudents.length === 0) return;

    selectedStudents.forEach(async (studentId) => {
      try {
        await fetch('/api/trip-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, time: timeMinutes }),
        });
      } catch (error) {
        console.error('Error updating trip time:', error);
      }
    });
  }, [timeMinutes, selectedStudents]);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedStudentId) {
      const id = parseInt(preselectedStudentId, 10);
      if (!isNaN(id)) {
        setSelectedStudents([id]);
        setShowStudentSelector(true);
        setSearchTerm('');
      }
    }
  }, [preselectedStudentId]);

  useEffect(() => {
    if (!showStudentSelector) {
      return;
    }
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/students?name=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setStudents(data.students || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, showStudentSelector]);

  const toggleStudentSelection = (id: number) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((studentId) => studentId !== id)
        : [...prevSelected, id]
    );
  };

  const handleAddStudentsToTrip = async () => {
    if (!showStudentSelector) {
      setShowStudentSelector(true);
      return;
    }
    console.log('Adding students to trip:', selectedStudents);
    alert(`Added ${selectedStudents.length} students to the trip.`);
    setShowStudentSelector(false);
    setSearchTerm('');

    const qrData = selectedStudents.length > 0 ? selectedStudents.join(',') : 'No students';
    const durationHours = Math.round(timeMinutes / 60);
    const createdAt = Date.now();
    const payload = {
      content: qrData,
      durationHours: durationHours,
      createdAt: createdAt,
    };
    setQrCodeData(JSON.stringify(payload));

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        selectedStudents.includes(student.id)
          ? { ...student, status: 'on a trip' }
          : student
      )
    );

    try {
      await Promise.all(
        selectedStudents.map((studentId) =>
          fetch(`/api/students/${studentId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'on a trip' }),
          })
        )
      );
    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

  const incrementTime = () => {
    setTimeMinutes((prev) => Math.min(prev + 10, 120));
  };

  const decrementTime = () => {
    setTimeMinutes((prev) => Math.max(prev - 10, 10));
  };

  const setTime = (minutes: number) => {
    setTimeMinutes(minutes);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Media devices API or getUserMedia not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = () => {
    if (!audioBlob) {
      alert('No audio recorded to upload.');
      return;
    }
    console.log('Uploading audio blob:', audioBlob);
    alert('Audio uploaded successfully (mock).');
    setAudioBlob(null);
    setAudioURL(null);
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center p-6"
      style={{
        backgroundImage: "url('/student-bg.png')",
      }}
    >
      <div className="flex items-center flex-col justify-center w-full h-full p-4">
        <h1 className="text-[#5c6bf2] tracking-tighter text-5xl font-bold mb-1">Allocate time</h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full h-full rounded-3xl bg-white bg-opacity-80 backdrop-blur-lg shadow-xl p-6 flex flex-col"
        >
          <div className="bg-white bg-opacity-90 rounded-3xl p-6 flex flex-col items-center flex-grow shadow-md">

            {/* Header Bar */}
            <div className="w-full bg-[#5c6bf2] rounded-4xl flex items-center px-6 py-4 mb-8 shadow-md">
              {/* Time Selector */}
              <div className="w-full mb-2 mt-2 bg-indigo-500 rounded-full p-2 px-4 flex flex-col items-start justify-between">
                <p className="text-xl font-medium tracking-tighter text-black mb-2">Select time</p>
                <div className="flex items-center space-x-4">
                  <button className="text-[rgb(211,212,255)] font-extrabold text-4xl" onClick={incrementTime}>+</button>
                  <span className="text-white font-extrabold text-4xl">{timeMinutes}</span>
                  <button className="text-[rgb(211,212,255)] font-extrabold text-4xl" onClick={decrementTime}>-</button>
                </div>
              </div>
              <div className="flex space-x-4 ml-auto">
                <button
                  className="w-20 h-10 rounded-full bg-[#8f9bff] hover:bg-[#7e8fff] text-white text-sm font-medium shadow"
                  onClick={() => setTime(60)}
                >
                  1 hr
                </button>
                <button
                  className="w-20 h-10 rounded-full bg-[#8f9bff] hover:bg-[#7e8fff] text-white text-sm font-medium shadow"
                  onClick={() => setTime(120)}
                >
                  2 hr
                </button>
              </div>
            </div>

            {/* Voice Message Input */}
            <div className="w-full mb-8">
              <p className="text-sm font-medium text-black mb-2">Add personal message</p>
              <div className="flex items-center space-x-3">
                <button
                  className="w-12 h-12 rounded-full bg-[#f0f0f0] hover:bg-[#e2e2e2] flex items-center justify-center text-black text-lg shadow"
                  onClick={startRecording}
                  disabled={isRecording}
                  title="Start Recording"
                >
                  <i className="fas fa-microphone" />
                </button>
                <button
                  className="w-12 h-12 rounded-full bg-[#f0f0f0] hover:bg-[#e2e2e2] flex items-center justify-center text-black text-lg shadow"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  title="Stop Recording"
                >
                  <i className="fas fa-stop" />
                </button>
                <input
                  type="text"
                  placeholder="Record your msg"
                  className="flex-1 rounded-full border border-gray-300 px-6 py-3 text-sm text-black"
                  value={audioURL ? "Audio recorded" : ""}
                  readOnly
                />
                <button
                  className="w-12 h-12 rounded-full bg-[#f0f0f0] hover:bg-[#e2e2e2] flex items-center justify-center text-black text-lg shadow"
                  onClick={uploadAudio}
                  disabled={!audioBlob}
                  title="Upload Audio"
                >
                  <i className="fas fa-upload" />
                </button>
              </div>
            </div>

            {/* Student Selector */}
            {showStudentSelector && (
              <div className="w-full mb-8">
                <input
                  type="text"
                  placeholder="Search students"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-6 py-3 text-sm text-black mb-4"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white shadow-inner">
                  {students.length === 0 ? (
                    <p className="text-gray-500 text-sm">No students found</p>
                  ) : (
                    students.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center space-x-3 mb-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="form-checkbox text-[#000000] h-5 w-5 text-[#5c6bf2]"
                        />
                        <span className='text-[#000000]' >{student.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <button
              className="w-full bg-[#5c6bf2] hover:bg-[#4a58d9] text-white text-sm font-semibold rounded-full py-4 transition"
              onClick={handleAddStudentsToTrip}
              disabled={showStudentSelector && selectedStudents.length === 0}
            >
              {showStudentSelector ? 'Confirm Add Students' : 'Add Students to Trip'}
            </button>

            {/* Trip Details Card */}
            {qrCodeData && (
              <div className="mt-8 bg-[#eef0ff] p-8 rounded-3xl flex flex-row justify-between w-full shadow-md">

                {/* Trip Info Section */}
                <div className="flex flex-col w-2/3">
                  <h2 className="text-2xl font-bold mb-6 text-black">TRIP DETAILS</h2>

                  <div className="flex justify-between font-semibold text-black mb-2">
                    <p>Name</p>
                    <p>Number</p>
                  </div>

                  <div className="space-y-1 text-gray-600 font-medium mb-6">
                    {selectedStudents.map((id) => {
                      const student = students.find((s) => s.id === id);
                      return (
                        <div key={id} className="flex justify-between">
                          <p>{student?.name}</p>
                        </div>
                      );
                    })}
                  </div>

                  <hr className="border border-black mb-4" />

                  <div className="flex justify-between text-black font-semibold text-sm">
                    <p>Total members: {selectedStudents.length.toString().padStart(2, '0')}</p>
                    <p>Total Time : {timeMinutes}</p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="w-1/3 flex flex-col items-center justify-center">
                  <p className="mb-4 font-semibold text-black">Scan this QR code:</p>
                  <motion.div
                    className="bg-white p-4 rounded-2xl shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <QRCode value={qrCodeData} size={160} />
                  </motion.div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </main>
  );
}
