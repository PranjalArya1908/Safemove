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
      image TEXT
    )
  `);
  return db;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, phone, image } = data;
    const status = data.status || 'inside hostel';

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const db = await openDB();

    const result = await db.run(
      'INSERT INTO students (name, phone, image, status) VALUES (?, ?, ?, ?)',
      name,
      phone,
      image || null,
      status
    );

    await db.close();

    return NextResponse.json({ message: 'Student added successfully', id: result.lastID });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nameQuery = searchParams.get('name') || '';
    const statusNot = searchParams.get('statusNot');

    const db = await openDB();

    let query = 'SELECT * FROM students WHERE name LIKE ?';
    const params: any[] = [`%${nameQuery}%`];

    if (statusNot) {
      query += ' AND status != ?';
      params.push(statusNot);
    }

    const students = await db.all(query, ...params);

    await db.close();

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
