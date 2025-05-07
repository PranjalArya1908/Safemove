import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function openDB() {
  const db = await open({
    filename: path.resolve('./students.db'),
    driver: sqlite3.Database,
  });
  // Create emergencies table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS emergencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cause TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
}

export async function POST(request: NextRequest) {
  try {
    const { cause } = await request.json();
    if (!cause) {
      return NextResponse.json({ error: 'Cause is required' }, { status: 400 });
    }

    const db = await openDB();
    await db.run('INSERT INTO emergencies (cause) VALUES (?)', cause);
    await db.close();

    return NextResponse.json({ message: 'Emergency recorded' });
  } catch (error) {
    console.error('Error recording emergency:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await openDB();
    const countRow = await db.get('SELECT COUNT(*) as count FROM emergencies');
    const emergencies = await db.all('SELECT * FROM emergencies ORDER BY timestamp DESC LIMIT 10');
    await db.close();

    return NextResponse.json({
      emergencyNumber: countRow ? countRow.count : 0,
      emergencies,
    });
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
