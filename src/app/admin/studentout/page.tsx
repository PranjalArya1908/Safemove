'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function StudentsOutPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [timers, setTimers] = useState<number[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students?statusNot=inside hostel');
        const data = await response.json();
        setStudents(data.students || []);
        setShowDropdown(new Array(data.students.length).fill(false));
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length === 0) return;

    const fetchTimes = async () => {
      try {
        const response = await fetch('/api/trip-time');
        const data = await response.json();
        const updatedTimers = students.map(student => {
          const time = data[student.id];
          return typeof time === 'number' ? time : 0;
        });
        setTimers(updatedTimers);
      } catch (error) {
        console.error('Error fetching trip times:', error);
      }
    };
    fetchTimes();
  }, [students]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map((time, i) => {
          const newTime = time > 0 ? time - 1 : 0;

          if (newTime <= 600 && !showDropdown[i]) {
            setShowDropdown(prev => {
              const updated = [...prev];
              updated[i] = true;
              return updated;
            });
          }

          return newTime;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [showDropdown]);

  return (
    <main className="min-h-screen bg-white px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600">Student Outside</h1>
        <a href="/admin" className="text-white text-lg bg-blue-400 px-5 py-3 rounded-full hover:bg-blue-500 transition duration-5 tracking-tighter font-sm">Back to dashboard</a>
      </div>

      <div className="grid sm:grid-cols-1 md:col-auto lg:grid-cols-4 gap-8 px-20">
        {students.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white border rounded-3xl shadow-md p-4 flex flex-col items-center text-center relative"
          >
            <Image
              src={student.image || '/background.png'}
              alt={student.name}
              width={200}
              height={200}
              className="rounded-full object-cover mb-4"
            />
            <h2 className="text-3xl text-[#000000] font-semibold tracking-tighter">{student.name}</h2>
            <p className="text-gray-600 mt-1">{student.phone}</p>

            <div className={`w-full mt-4 p-4 rounded-2xl transition-colors duration-300 ${timers[index] <= 600 ? 'bg-red-200' : 'bg-blue-50'}`}>
              <p className="text-sm text-gray-500 mb-3">Time Remaining</p>
              <motion.h1
                className={`text-6xl font-bold mt-1 transition-colors duration-300 ${timers[index] <= 600 ? 'text-red-600' : 'text-blue-600'}`}
                animate={timers[index] <= 600 ? { scale: [1, 1.05, 1] } : {}}
                transition={timers[index] <= 600 ? { duration: 0.8, repeat: Infinity } : {}}
              >
                {formatTime(timers[index])}
              </motion.h1>
            </div>

            <div className="mt-4 flex gap-1">
              <a href="/admin/students" className="bg-blue-600 text-white px-7 py-3 rounded-3xl text-sm hover:bg-blue-700 inline-block text-center">GPS TRACK</a>
              <button className="bg-blue-600 text-white px-7 py-3 rounded-3xl text-sm hover:bg-blue-700">EXTEND TIME</button>
            </div>

            <AnimatePresence>
              {showDropdown[index] && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 w-full"
                >
                  <button className="bg-red-500 w-full text-white px-7 py-3 rounded-3xl text-sm hover:bg-red-600 transition-colors">
                    CALL STUDENT
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
 