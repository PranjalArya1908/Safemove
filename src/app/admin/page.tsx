"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PendingExtensionRequests from '@/components/PendingExtensionRequests';

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

<<<<<<< HEAD
  // Notifications state
  const [notifications, setNotifications] = useState<Array<{id: number; message: string; status: string;}>>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Fetch dashboard stats on mount
=======
  // Fetch dashboard stats and emergencies on mount
>>>>>>> 68f1095 (Add emergency event tracking: API, DB schema, user trips and admin dashboard updates)
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
<<<<<<< HEAD
    fetchNotifications();
=======
    fetchEmergencies();
>>>>>>> 68f1095 (Add emergency event tracking: API, DB schema, user trips and admin dashboard updates)
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
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      if (formData.image) {
        // For simplicity, convert image file to base64 string
        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(formData.image as Blob);
        });
        formDataToSend.append('image', base64Image);
      } else {
        formDataToSend.append('image', '');
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          image: formData.image ? await (async () => {
            const reader = new FileReader();
            return new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(formData.image as Blob);
            });
          })() : null,
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
        <div className={`${showModal ? 'blur-sm pointer-events-none select-none' : ''}`}>
          <header className="flex flex-wrap items-center justify-between mb-8">
            <button
              className="text-black font-semibold text-base rounded-full border border-[#5B6FFB] px-6 py-2"
              type="button"
            >
              SafeMove
            </button>
            <nav>
              <ul
                className="flex items-center space-x-6 bg-[#E3E3E3] rounded-full px-6 py-2 text-sm font-normal"
              >
                <li>
                  <Link href="/admin" legacyBehavior>
                    <a className="text-[#5B6FFB] font-normal leading-5">Dashboard</a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/students" legacyBehavior>
                    <a className="text-black font-normal leading-5">Students</a>
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
<<<<<<< HEAD
=======
                <li><a href="/admin/students" className="text-[#5B6FFB] font-normal leading-5">Students</a></li>
                <li><a href="#" className="text-black font-normal leading-5">Emergency</a></li>
                <li><a href="#" className="text-black font-normal leading-5">Settings</a></li>
>>>>>>> 68f1095 (Add emergency event tracking: API, DB schema, user trips and admin dashboard updates)
              </ul>
            </nav>
            <button
              type="button"
              className="flex items-center space-x-2 bg-[#5B6FFB] text-white rounded-full px-6 py-3 text-sm font-normal"
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

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section
              className="col-span-2 border border-gray-300 rounded-2xl p-6 min-h-[200px] text-base font-normal text-[#000000] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Alert Notifications</h3>
                <div>
                  <button
                    onClick={fetchNotifications}
                    className="text-blue-600 hover:underline text-sm mr-4"
                    aria-label="Refresh notifications"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowAllNotifications(!showAllNotifications)}
                    className="text-blue-600 hover:underline text-sm"
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
                <p>No notifications available.</p>
              ) : (
                <ul className="space-y-3 max-h-[300px] overflow-y-auto">
                  {filteredNotifications.map((notif) => (
                    <li
                      key={notif.id}
                      className="border border-gray-300 rounded p-3 flex flex-col space-y-2"
                    >
                      <p>{notif.message}</p>
                      <div className="flex space-x-2">
                        {!showAllNotifications && (
                          <>
                            <button
                              onClick={() => updateNotificationStatus(notif.id, 'approved')}
                              disabled={notif.status === 'approved'}
                              className={`px-3 py-1 rounded text-white ${
                                notif.status === 'approved' ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                              }`}
                              aria-label="Approve notification"
                            >
                              &#10003;
                            </button>
                            <button
                              onClick={() => updateNotificationStatus(notif.id, 'disapproved')}
                              disabled={notif.status === 'disapproved'}
                              className={`px-3 py-1 rounded text-white ${
                                notif.status === 'disapproved' ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                              }`}
                              aria-label="Disapprove notification"
                            >
                              &#10007;
                            </button>
                          </>
                        )}
                        <span
                          className={`ml-auto font-semibold capitalize ${
                            notif.status === 'approved' ? 'text-green-700' : notif.status === 'disapproved' ? 'text-red-700' : 'text-gray-700'
                          }`}
                        >
                          {notif.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

<<<<<<< HEAD
=======
            <section
              className="border border-gray-300 rounded-2xl p-6 min-h-[200px] text-base font-normal text-[#000000] overflow-y-auto"
            >
              <h2 className="font-bold mb-4">Alert Notifications</h2>
              {emergencyAlerts.length === 0 ? (
                <p>No emergency alerts</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {emergencyAlerts.map((alert) => (
                    <li key={alert.id} className="border border-red-400 rounded p-2 bg-red-100 text-red-800">
                      <p><strong>Cause:</strong> {alert.cause}</p>
                      <p><small>{new Date(alert.timestamp).toLocaleString()}</small></p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

>>>>>>> 68f1095 (Add emergency event tracking: API, DB schema, user trips and admin dashboard updates)
            <section className="col-span-2 grid grid-cols-2 gap-6">
              <div
                className="border border-gray-300 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase leading-4 ">
                    Number of<br />
                    <span className="text-gray-400 font-extrabold ">Students out</span>
                  </p>
                  <h2 className="text-5xl font-extrabold text-[#5B6FFB] mt-2">{studentsOut}</h2>
                </div>
                <div
                  className="absolute top-6 right-6 bg-[#E3E3E3] rounded-full w-10 h-10 flex items-center justify-center text-[#5B6FFB]"
                >
                  <i className="fas fa-arrow-up"></i>
                </div>
              </div>

              <div
                className="border border-gray-300 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase leading-4">
                    Number of<br />
                    <span className="text-gray-400 font-extrabold">Students in</span>
                  </p>
                  <h2 className="text-5xl font-extrabold text-[#5B6FFB] mt-2">{studentsIn}</h2>
                </div>
                <div
                  className="absolute top-6 right-6 bg-[#E3E3E3] rounded-full w-10 h-10 flex items-center justify-center text-[#5B6FFB]"
                >
                  <i className="fas fa-arrow-up"></i>
                </div>
              </div>

              <div
                className="border border-gray-300 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase leading-4">
                    Total trip<br />
                    <span className="text-gray-400 font-extrabold">Completed</span>
                  </p>
                  <h2 className="text-5xl font-extrabold text-[#5B6FFB] mt-2">{totalTrips}</h2>
                </div>
                <div
                  className="absolute top-6 right-6 bg-[#E3E3E3] rounded-full w-10 h-10 flex items-center justify-center text-[#5B6FFB]"
                >
                  <i className="fas fa-arrow-up"></i>
                </div>
              </div>

              <div
                className="border border-gray-300 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase leading-4">
                    Emergency<br />
                    <span className="text-gray-400 font-extrabold">Number</span>
                  </p>
                  <h2 className="text-5xl font-extrabold text-[#5B6FFB] mt-2">{emergencyNumber.toString().padStart(2, '0')}</h2>
                </div>
                <div
                  className="absolute top-6 right-6 bg-[#E3E3E3] rounded-full w-10 h-10 flex items-center justify-center text-[#5B6FFB]"
                >
                  <i className="fas fa-arrow-up"></i>
                </div>
              </div>
            </section>

            <section
              className="border border-gray-300 rounded-2xl p-6 min-h-[300px] flex flex-col"
            >
              <PendingExtensionRequests />
            </section>
          </main>
        </div>

        {showModal && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative z-50"
              >
                <h2 className="text-2xl font-bold mb-6 text-[#000000]">Add Student</h2>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-1 font-semibold text-[#000000] ">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-[#000000] focus:outline-none  focus:ring-2 focus:ring-[#5B6FFB]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="block mb-1 font-semibold text-[#000000]">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border text-[#000000] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B6FFB]"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="image" className="block mb-1 font-semibold text-[#000000]">
                    Image
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full text-[#000000]"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-[#000000]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#5B6FFB] text-white hover:bg-[#4a5edb]"
                  >
                    Add
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
              {selectedStudent.status === 'inside hostel' && (
                <div className="mt-6">
                  <Link href={`/admin/trips?preselectedStudentId=${selectedStudent.id}`} passHref legacyBehavior>
                    <a className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors text-center">
                      Plan the trip
                    </a>
                  </Link>
                </div>
              )}
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
