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
  // Add latitude and longitude columns if they do not exist
  try {
    await db.exec(`ALTER TABLE students ADD COLUMN latitude REAL`);
  } catch (e) {
    // Ignore error if column already exists
  }
  try {
    await db.exec(`ALTER TABLE students ADD COLUMN longitude REAL`);
  } catch (e) {
    // Ignore error if column already exists
  }
  return db;
}

export async function POST(request: NextRequest, context: { params: { studentId: string } }) {
  try {
    const params = await context.params;
    const studentId = parseInt(params.studentId, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    const data = await request.json();
    const { latitude, longitude } = data;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Latitude and longitude are required and must be numbers' }, { status: 400 });
    }

    const db = await openDB();

    const result = await db.run(
      'UPDATE students SET latitude = ?, longitude = ? WHERE id = ?',
      latitude,
      longitude,
      studentId
    );

    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student location updated successfully' });
  } catch (error) {
    console.error('Error updating student location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
