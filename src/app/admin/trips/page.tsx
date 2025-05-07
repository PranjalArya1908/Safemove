"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import StudentCardWithMap from '../../../components/StudentCardWithMap';

export default function AdminTripsPage() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('preselectedStudentId');

  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<{ id: number; name: string; sessionId: string; status: string }[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  const [timeMinutes, setTimeMinutes] = useState(40);

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
        // Assuming API returns sessionId and status for each student
        setStudents(data.students || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    // Fetch students when searchTerm changes, with debounce
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
    // Implement the logic to add selected students to the trip
    console.log('Adding students to trip:', selectedStudents);
    alert(`Added ${selectedStudents.length} students to the trip.`);
    setShowStudentSelector(false);
    setSearchTerm('');

    // Generate QR code data after confirming students and time allocation
    const qrData = selectedStudents.length > 0 ? selectedStudents.join(',') : 'No students';
    const durationHours = Math.round(timeMinutes / 60);
    const createdAt = Date.now();
    const payload = {
      content: qrData,
      durationHours: durationHours,
      createdAt: createdAt,
    };
    setQrCodeData(JSON.stringify(payload));

    // Update status of selected students to "on a trip"
    // Update local students state
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        selectedStudents.includes(student.id)
          ? { ...student, status: 'on a trip' }
          : student
      )
    );

    // Optionally, send API request to update student status in backend
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
    // Implement upload logic here, e.g., send audioBlob to server
    console.log('Uploading audio blob:', audioBlob);
    alert('Audio uploaded successfully (mock).');
    // Reset audio states after upload
    setAudioBlob(null);
    setAudioURL(null);
  };

  return (
    <main className="min-h-screen p-6 bg-white text-black">
      {/* Desktop view UI */}
      <div className="flex items-center justify-center w-full h-screen p-4">
        <div className="w-full h-full rounded-3xl bg-[#d3dbff] p-6 flex flex-col">
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center flex-grow">
            <div className="w-full bg-[#5c6bf2] rounded-full flex items-center px-6 py-4 mb-8 space-x-6">
              <h1 className="text-white text-5xl font-bold rounded-full bg-[#5c6bf2] px-3 py-3 focus:outline-none text-center">
                Allocate time
              </h1>
              <div className="flex space-x-6 ml-auto">
                <button
                  className="w-20 h-12 rounded-full bg-[#8f9bff] text-white text-sm font-normal flex items-center justify-center"
                  onClick={() => setTime(60)}
                >
                  1 hr
                </button>
                <button
                  className="w-20 h-12 rounded-full bg-[#8f9bff] text-white text-sm font-normal flex items-center justify-center"
                  onClick={() => setTime(120)}
                >
                  2 hr
                </button>
              </div>
            </div>
            <div className="w-full mb-8">
              <p className="text-sm font-normal text-black mb-3">Select time</p>
              <div className="flex items-center space-x-4">
                <button
                  className="text-[#5c6bf2] font-bold text-2xl select-none"
                  onClick={incrementTime}
                >
                  +
                </button>
                <span className="text-black font-extrabold text-2xl select-none">{timeMinutes}</span>
                <button
                  className="text-[#5c6bf2] font-bold text-2xl select-none"
                  onClick={decrementTime}
                >
                  -
                </button>
              </div>
              <hr className="border-t border-gray-300 mt-4" />
            </div>
            <div className="w-full mb-8">
              <p className="text-sm font-normal text-black mb-3">Add personal message</p>
              <div className="flex items-center space-x-4">
                <button
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-lg shadow"
                  onClick={startRecording}
                  disabled={isRecording}
                  title="Start Recording"
                >
                  <i className="fas fa-microphone"></i>
                </button>
                <button
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-lg shadow"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  title="Stop Recording"
                >
                  <i className="fas fa-stop"></i>
                </button>
                <input
                  type="text"
                  placeholder="Record your msg"
                  className="flex-1 rounded-full border border-gray-300 px-6 py-3 text-sm text-black focus:outline-none"
                  value={audioURL ? "Audio recorded" : ""}
                  readOnly
                />
                <button
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black text-lg shadow"
                  onClick={uploadAudio}
                  disabled={!audioBlob}
                  title="Upload Audio"
                >
                  <i className="fas fa-upload"></i>
                </button>
              </div>
            </div>

            {/* Conditionally render search and select students */}
            {showStudentSelector && (
              <div className="w-full mb-8">
                <input
                  type="text"
                  placeholder="Search students"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-6 py-3 text-sm text-black focus:outline-none mb-4"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white">
                  {students.length === 0 && <p className="text-gray-500 text-sm">No students found</p>}
                  {students.map((student) => (
                    <label key={student.id} className="flex items-center space-x-3 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="form-checkbox h-5 w-5 text-[#5c6bf2]"
                      />
                      <span>{student.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              className="w-full bg-[#5c6bf2] text-white text-sm font-normal rounded-full py-4"
              onClick={handleAddStudentsToTrip}
              disabled={showStudentSelector && selectedStudents.length === 0}
            >
              {showStudentSelector ? 'Confirm Add Students' : 'Add Students to Trip'}
            </button>

            {/* Display QR code if generated */}
            {qrCodeData && (
              <div className="mt-8 flex flex-col items-center">
                <p className="mb-2 font-semibold text-black">Scan this QR code:</p>
                <QRCode value={qrCodeData} size={200} />
              </div>
            )}

            {/* Display student cards with map */}
            {/* Removed as per user request */}
            {/* <div className="w-full mt-8 space-y-6">
              {students.map((student) => (
                <StudentCardWithMap
                  key={student.id}
                  studentId={student.id}
                  sessionId={student.sessionId}
                  studentName={student.name}
                />
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </main>
  );
}
