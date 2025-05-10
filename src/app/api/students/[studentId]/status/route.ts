import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Open or create the SQLite database file
async function openDB() {
  const db = await open({
    filename: path.resolve('./students.db'),
    driver: sqlite3.Database,
  });
  // Create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      image TEXT,
      status TEXT DEFAULT 'inside hostel'
    )
  `);
  return db;
}

export async function PUT(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const studentId = parseInt(params.studentId, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const data = await request.json();
    const { status } = data;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const db = await openDB();

    const result = await db.run(
      'UPDATE students SET status = ? WHERE id = ?',
      status,
      studentId
    );

    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student status updated successfully' });
  } catch (error) {
    console.error('Error updating student status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
