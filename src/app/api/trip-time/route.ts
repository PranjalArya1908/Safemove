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
  await db.exec(
    "CREATE TABLE IF NOT EXISTS trip_times (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "trip_name TEXT NOT NULL," +
    "start_time TEXT NOT NULL," +
    "end_time TEXT NOT NULL," +
    "duration INTEGER NOT NULL" +
    ")"
  );
  return db;
}

export async function GET(request: NextRequest) {
  try {
    const db = await openDB();

    const tripTimesRaw = await db.all('SELECT * FROM trip_times');

    // Calculate duration dynamically in seconds
    const tripTimes = tripTimesRaw.map(trip => {
      const start = new Date(trip.start_time);
      const end = trip.end_time ? new Date(trip.end_time) : new Date();
      const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
      return {
        ...trip,
        duration: durationSeconds,
      };
    });

    await db.close();

    return NextResponse.json({ tripTimes });
  } catch (error) {
    console.error('Error fetching trip times:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
