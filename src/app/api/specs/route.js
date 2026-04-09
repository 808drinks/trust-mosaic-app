import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = getDb();
    const specs = await sql`SELECT * FROM saved_specs ORDER BY created_at DESC`;
    return NextResponse.json(specs);
  } catch (error) {
    console.error('Error fetching specs:', error);
    return NextResponse.json({ error: 'Failed to fetch specs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sql = getDb();
    const { title, spec_value, price, price_korean } = await request.json();
    
    const result = await sql`
      INSERT INTO saved_specs (title, spec_value, price, price_korean)
      VALUES (${title}, ${spec_value}, ${price || 0}, ${price_korean || ''})
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating spec:', error);
    return NextResponse.json({ error: 'Failed to create spec' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`DELETE FROM saved_specs WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting spec:', error);
    return NextResponse.json({ error: 'Failed to delete spec' }, { status: 500 });
  }
}
