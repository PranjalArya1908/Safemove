'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import StudentCardWithMap from "../../../components/StudentCardWithMap";

type Student = {
  id: number;
  name: string;
  phone: string;
  image: string | null;
  sessionId: string;
  status?: "inside hostel" | "on a trip";
  active: boolean;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
          setError(null);
        } else {
          setError("Failed to fetch students");
          setStudents([]);
        }
      } catch (error) {
        setError("Error fetching students");
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
      <h1 className="text-3xl text-[#000000] font-bold mb-6">Students</h1>
      <Link href="/admin" legacyBehavior>
      <button>
        <a className="text-blue-600 underline mb-4 inline-block">Back to Dashboard</a></button>
      </Link>

      {error && <p className="text-red-600 mb-4">{error}</p>}

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
              status={student.status}
            />
          ))}
        </div>
      )}
    </main>
  );
}
