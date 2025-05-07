
import React, { useEffect, useState } from "react";
import StudentCardWithMap from "../../../components/StudentCardWithMap";

type Student = {
>>>>>>> c49012a (Your descriptive commit message here)
  id: number;
  name: string;
  phone: string;
  image: string | null;
<<<<<<< HEAD
  status?: string;
  active: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', active: true });

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, phone: student.phone, active: student.active });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setFormData({ name: '', phone: '', active: true });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingStudent ? 'PUT' : 'POST';
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchStudents();
        setEditingStudent(null);
        setFormData({ name: '', phone: '', active: true });
      } else {
        setError('Failed to save student');
      }
    } catch (err) {
      setError('Error saving student');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchStudents();
      } else {
        setError('Failed to delete student');
      }
    } catch (err) {
      setError('Error deleting student');
    }
  };

  const toggleActive = async (student: Student) => {
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, active: !student.active }),
      });
      if (response.ok) {
        fetchStudents();
      } else {
        setError('Failed to update student status');
      }
    } catch (err) {
      setError('Error updating student status');
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Students Management</h1>
      <Link href="/admin" legacyBehavior>
        <a className="text-blue-600 underline mb-4 inline-block">Back to Dashboard</a>
      </Link>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleFormSubmit} className="mb-6 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
        <div className="mb-4">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
            id="active"
            className="mr-2"
          />
          <label htmlFor="active">Active (Outside or in trip)</label>
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            {editingStudent ? 'Update' : 'Add'}
          </button>
          {editingStudent && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p>Loading students...</p>}

      {!loading && !error && (
        <ul className="space-y-4">
          {students.map((student) => (
            <li key={student.id} className="border p-4 rounded shadow flex items-center space-x-4">
              {student.image ? (
                <img src={student.image} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
              <div className="flex-grow">
                <p className="font-semibold text-lg">{student.name}</p>
                <p className="text-gray-600">{student.phone}</p>
                <p className="text-sm text-gray-500 capitalize">{student.status || 'Unknown status'}</p>
                <p className="text-sm">
                  Status: {student.active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleEditClick(student)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(student)}
                  className={`px-3 py-1 rounded ${student.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-black'}`}
                >
                  {student.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
=======
  sessionId: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading students...</div>;
  }

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Students</h1>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <StudentCardWithMap
              key={student.id}
              studentId={student.id}
              sessionId={student.sessionId}
              studentName={student.name}
              phoneNumber={student.phone}
              imageUrl={student.image || undefined}
            />
          ))}
        </div>
>>>>>>> c49012a (Your descriptive commit message here)
      )}
    </main>
  );
}
=======

import React, { useEffect, useState } from "react";
import StudentCardWithMap from "../../../components/StudentCardWithMap";

type Student = {
>>>>>>> c49012a (Your descriptive commit message here)
  id: number;
  name: string;
  phone: string;
  image: string | null;
<<<<<<< HEAD
  status?: string;
  active: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', active: true });

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, phone: student.phone, active: student.active });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setFormData({ name: '', phone: '', active: true });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingStudent ? 'PUT' : 'POST';
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchStudents();
        setEditingStudent(null);
        setFormData({ name: '', phone: '', active: true });
      } else {
        setError('Failed to save student');
      }
    } catch (err) {
      setError('Error saving student');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchStudents();
      } else {
        setError('Failed to delete student');
      }
    } catch (err) {
      setError('Error deleting student');
    }
  };

  const toggleActive = async (student: Student) => {
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, active: !student.active }),
      });
      if (response.ok) {
        fetchStudents();
      } else {
        setError('Failed to update student status');
      }
    } catch (err) {
      setError('Error updating student status');
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Students Management</h1>
      <Link href="/admin" legacyBehavior>
        <a className="text-blue-600 underline mb-4 inline-block">Back to Dashboard</a>
      </Link>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleFormSubmit} className="mb-6 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
        <div className="mb-4">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
            id="active"
            className="mr-2"
          />
          <label htmlFor="active">Active (Outside or in trip)</label>
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            {editingStudent ? 'Update' : 'Add'}
          </button>
          {editingStudent && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p>Loading students...</p>}

      {!loading && !error && (
        <ul className="space-y-4">
          {students.map((student) => (
            <li key={student.id} className="border p-4 rounded shadow flex items-center space-x-4">
              {student.image ? (
                <img src={student.image} alt={student.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
              <div className="flex-grow">
                <p className="font-semibold text-lg">{student.name}</p>
                <p className="text-gray-600">{student.phone}</p>
                <p className="text-sm text-gray-500 capitalize">{student.status || 'Unknown status'}</p>
                <p className="text-sm">
                  Status: {student.active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleEditClick(student)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(student)}
                  className={`px-3 py-1 rounded ${student.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-black'}`}
                >
                  {student.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
=======
  sessionId: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading students...</div>;
  }

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Students</h1>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <StudentCardWithMap
              key={student.id}
              studentId={student.id}
              sessionId={student.sessionId}
              studentName={student.name}
              phoneNumber={student.phone}
              imageUrl={student.image || undefined}
            />
          ))}
        </div>
>>>>>>> c49012a (Your descriptive commit message here)
      )}
    </main>
  );
}
