"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PendingExtensionRequests from '@/components/PendingExtensionRequests';
// import { motion } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
export default function AdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    image: null as File | null,
  });
  const [notification, setNotification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{id: number; name: string; phone: string; image: string | null; status?: string;}>>([]);
  const [selectedStudent, setSelectedStudent] = useState<null | {id: number; name: string; phone: string; image: string | null; status?: string;}>(null);

  // New state for dashboard stats
  const [studentsIn, setStudentsIn] = useState(0);
  const [studentsOut, setStudentsOut] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [emergencyNumber, setEmergencyNumber] = useState(0);
  const [emergencyAlerts, setEmergencyAlerts] = useState<Array<{id: number; cause: string; timestamp: string;}>>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<Array<{id: number; message: string; status: string;}>>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Fetch dashboard stats and emergencies on mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          setStudentsIn(data.studentsIn);
          setStudentsOut(data.studentsOut);
          setTotalTrips(data.totalTrips);
          setEmergencyNumber(data.emergencyNumber);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    const fetchEmergencies = async () => {
      try {
        const response = await fetch('/api/emergencies');
        if (response.ok) {
          const data = await response.json();
          setEmergencyAlerts(data.emergencies || []);
        }
      } catch (error) {
        console.error('Error fetching emergencies:', error);
      }
    };

    fetchDashboardStats();
    fetchEmergencies();
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setErrorNotifications(null);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else {
        setErrorNotifications('Failed to fetch notifications');
      }
    } catch (error) {
      setErrorNotifications('Error fetching notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const updateNotificationStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications((prev) =>
            prev.map((notif) => (notif.id === id ? { ...notif, status } : notif))
          );
        } else {
          alert('Failed to update notification status');
        }
      } else {
        alert('Failed to update notification status');
      }
    } catch (error) {
      alert('Error updating notification status');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/students?name=${encodeURIComponent(value)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.students);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let base64Image = '';
      if (formData.image) {
        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(formData.image as Blob);
        });
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          image: base64Image || null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setNotification('Student added to database');
        setFormData({ name: '', phone: '', image: null });
        setTimeout(() => setNotification(''), 3000);
      } else {
        setNotification('Failed to add student');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setNotification('Failed to add student');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const filteredNotifications = showAllNotifications
    ? notifications
    : notifications.filter((notif) => notif.status === 'pending');

  return (
    <main className="colour-black">
      <div className="bg-white min-h-screen p-6 relative">
        <div className={showModal ? 'blur-sm pointer-events-none select-none' : ''}>
          <header className="flex flex-wrap items-center justify-between mb-8">
            <button
              className="text-blue-600 font-md tracking-tighter text-base rounded-full border border-[#5B6FFB] px-6 py-2"
              type="button"
            >
              SafeMove
            </button>
            <nav>
              <ul className="flex items-center space-x-6 bg-[#e6e6e6] rounded-full px-6 py-3 text-sm font-normal">
                <li>
                  <Link href="/admin" legacyBehavior>
                    <a className="text-[#5B6FFB] font-normal leading-5">Dashboard</a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/students" legacyBehavior>
                    <a className="text-black font-normal leading-5 ">Students</a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/emergency" legacyBehavior>
                    <a className="text-black font-normal leading-5">Emergency</a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/settings" legacyBehavior>
                    <a className="text-black font-normal leading-5">Settings</a>
                  </Link>
                </li>
              </ul>
            </nav>
            <button
              type="button"
              className="flex items-center space-x-2 bg-[#4e63ff] text-white rounded-full px-5 py-3 text-sm font-normal"
              onClick={() => setShowModal(true)}
            >
              <span>Add Student</span>
              <i className="fas fa-plus"></i>
            </button>
          </header>

          {notification && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
              {notification}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

<section
  className="col-span-2 border border-gray-200 rounded-2xl p-6 min-h-[200px] bg-white shadow-md overflow-y-auto"
>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-4"
  >
    <h2 className="text-5xl tracking-tighter font-bold mt-2 mb-4">
      <span className="text-black">Let's </span>
      <span className="text-blue-600">Plan the trip</span>
    </h2>

    <motion.input
      type="text"
      placeholder="Search students..."
      value={searchQuery}
      onChange={handleSearchChange}
      className="w-lg border border-gray-300 rounded-full px-6 py-3 mt-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
      whileFocus={{ scale: 1.02 }}
    />

    {searchResults.length > 0 && (
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-gray-200 rounded-lg mt-3 max-h-48 overflow-y-auto bg-white text-black shadow-sm"
      >
        {searchResults.map((student, index) => (
          <motion.li
            key={student.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setSelectedStudent(student)}
          >
            {student.name} - {student.phone}
          </motion.li>
        ))}
      </motion.ul>
    )}

    {selectedStudent && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4"
      >
        <Link href={`/admin/trips?preselectedStudentId=${selectedStudent.id}`} passHref legacyBehavior>
          <a className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors text-center whitespace-nowrap">
            Plan the trip
          </a>
        </Link>
      </motion.div>
    )}
  </motion.div>
</section>


          
      
{/* Alert section  */}
<motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="col-span-1 border border-gray-300 rounded-2xl p-6 min-h-[200px] text-base font-normal text-[#000000] bg-white shadow-sm"
>
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-bold tracking-tight text-[#000000]">Alert Notifications</h3>
    <div className="flex gap-3">
      <button
        onClick={fetchNotifications}
        className="text-sm text-blue-600 hover:underline transition-all"
        aria-label="Refresh notifications"
      >
        Refresh
      </button>
      <button
        onClick={() => setShowAllNotifications(!showAllNotifications)}
        className="text-sm text-blue-600 hover:underline transition-all"
        aria-label={showAllNotifications ? "Show pending notifications" : "Show all notifications"}
      >
        {showAllNotifications ? "Show Pending" : "Show All"}
      </button>
    </div>
  </div>

  {loadingNotifications ? (
    <p>Loading notifications...</p>
  ) : errorNotifications ? (
    <p className="text-red-600">{errorNotifications}</p>
  ) : filteredNotifications.length === 0 ? (
    <p className="text-gray-500">No notifications available.</p>
  ) : (
    <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
      <AnimatePresence>
        {filteredNotifications.map((notif) => (
          <motion.li
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            layout
            className="border border-gray-300 rounded-lg p-3 bg-[#FAFAFA] shadow-sm flex flex-col space-y-2"
          >
            <p className="text-sm">{notif.message}</p>
            <div className="flex items-center space-x-2">
              {!showAllNotifications && (
                <>
                  <button
                    onClick={() => updateNotificationStatus(notif.id, 'approved')}
                    disabled={notif.status === 'approved'}
                    className={`px-3 py-1 rounded text-white text-xs transition-all ${
                      notif.status === 'approved'
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    aria-label="Approve notification"
                  >
                    ✅
                  </button>
                  <button
                    onClick={() => updateNotificationStatus(notif.id, 'disapproved')}
                    disabled={notif.status === 'disapproved'}
                    className={`px-3 py-1 rounded text-white text-xs transition-all ${
                      notif.status === 'disapproved'
                        ? 'bg-red-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    aria-label="Disapprove notification"
                  >
                    ❌
                  </button>
                </>
              )}
              <span
                className={`ml-auto text-xs font-semibold capitalize ${
                  notif.status === 'approved'
                    ? 'text-green-600'
                    : notif.status === 'disapproved'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {notif.status}
              </span>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )}
</motion.section>

{/* 4 dashboard  */}
<section className="col-span-2 grid grid-cols-2 gap-6">
  {[ 
    { label: 'Students out', value: studentsOut },
    { label: 'Students in', value: studentsIn },
    { label: 'Total trip Completed', value: totalTrips },
    { label: 'Emergency Number', value: emergencyNumber.toString().padStart(2, '0') }
  ].map((item, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="border border-gray-200 rounded-2xl p-6 relative flex flex-col justify-between bg-white shadow-sm"
    >
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase leading-4">
          {item.label.split(' ')[0]}<br />
          <span className="text-gray-400 font-bold">{item.label.split(' ').slice(1).join(' ')}</span>
        </p>
        <h2 className="text-5xl font-extrabold text-[#4B5DFB] mt-3">{item.value}</h2>
      </div>
      <div className="absolute top-5 right-5 bg-[#F0F0F0] rounded-full w-9 h-9 flex items-center justify-center text-[#4B5DFB]">
        <i className="fas fa-arrow-up text-sm"></i>
      </div>
    </motion.div>
  ))}
</section>

           <motion.section
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="col-span-1 border border-gray-300 rounded-2xl p-6 min-h-[200px] text-base font-normal text-[#000000] bg-white shadow-sm"
>
              <PendingExtensionRequests />
            </motion.section>
          </div>
        </div>

        {showModal && (
  <>
    <div className="fixed inset-0 bg-blue-200 bg-opacity-40 backdrop-blur-sm z-40"></div>
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl relative z-50"
      >
        <h2 className="text-3xl font-bold mb-6 text-[#5B6FFB]">Add a new student</h2>

        {/* Name Field */}
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-[#F1F4FF] rounded-xl text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#5B6FFB]"
          />
        </div>

        {/* Phone Field */}
        <div className="mb-4">
          <label htmlFor="phone" className="block mb-2 text-sm font-semibold text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="Enter your contact number"
            className="w-full px-4 py-3 bg-[#F1F4FF] rounded-xl text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#5B6FFB]"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label htmlFor="image" className="block mb-2 text-sm font-semibold text-gray-700">
            Passport Size Photo
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-[#F1F4FF] rounded-xl text-gray-800 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5B6FFB] file:text-white hover:file:bg-[#4a5edb]"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 rounded-full border border-[#5B6FFB] text-[#5B6FFB] hover:bg-[#f1f4ff] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-full bg-[#5B6FFB] text-white hover:bg-[#4a5edb] transition-all"
          >
            Add student
          </button>
        </div>
      </form>
    </div>
  </>
)}

      {selectedStudent && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            onClick={() => setSelectedStudent(null)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-orange-200 rounded-lg p-8 w-full max-w-md shadow-lg relative z-50" style={{ height: '500px' }}>
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="flex items-center space-x-6 h-full">
                {selectedStudent.image ? (
                  <img
                    src={selectedStudent.image}
                    alt={selectedStudent.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg">
                    No Image
                  </div>
                )}
                <div className="flex flex-col justify-center h-full">
                  <h2 className="text-3xl font-semibold text-[#000000]">{selectedStudent.name}</h2>
                  <p className="text-lg text-gray-700 mt-2">{selectedStudent.phone}</p>
                  <div className="flex items-center space-x-3 mt-4">
                    <span
                      className={`w-5 h-5 rounded-full inline-block ${
                        selectedStudent.status === 'inside hostel' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      aria-label={selectedStudent.status}
                    ></span>
                    <span className="text-lg text-gray-700 capitalize">{selectedStudent.status}</span>
                  </div>
                  <div className="mt-6">
                  <Link href={`/admin/trips?preselectedStudentId=${selectedStudent.id}`} passHref legacyBehavior>
                    <a className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors text-center whitespace-nowrap">
                      Plan the trip
                    </a>
                  </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </main>
);
}