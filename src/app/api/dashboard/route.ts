import { NextResponse } from 'next/server';

<<<<<<< HEAD
export async function GET() {
  // Mock emergency number data
  const data = {
    emergencyNumber: 101
  };
  return NextResponse.json(data);
=======
async function openDB() {
  const db = await open({
    filename: path.resolve('./students.db'),
    driver: sqlite3.Database,
  });
  return db;
}

export async function GET(request: NextRequest) {
  try {
    const db = await openDB();

    // Count students inside hostel
    const studentsInRow = await db.get(
      "SELECT COUNT(*) as count FROM students WHERE status = 'inside hostel'"
    );
    const studentsIn = studentsInRow ? studentsInRow.count : 0;

    // Count students out of hostel
    const studentsOutRow = await db.get(
      "SELECT COUNT(*) as count FROM students WHERE status != 'inside hostel'"
    );
    const studentsOut = studentsOutRow ? studentsOutRow.count : 0;

    // Total trips completed - no trips table, so return 0 for now
    const totalTrips = 0;

    // Emergency number - query emergencies table for count
    const emergencyCountRow = await db.get('SELECT COUNT(*) as count FROM emergencies');
    const emergencyNumber = emergencyCountRow ? emergencyCountRow.count : 0;

    await db.close();

    return NextResponse.json({
      studentsIn,
      studentsOut,
      totalTrips,
      emergencyNumber,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
>>>>>>> 68f1095 (Add emergency event tracking: API, DB schema, user trips and admin dashboard updates)
}
