import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = getDb();
    const settings = await sql`SELECT * FROM webhook_settings WHERE is_active = true ORDER BY updated_at DESC LIMIT 1`;
    return NextResponse.json(settings[0] || null);
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sql = getDb();
    const { webhook_url } = await request.json();
    
    // Deactivate all existing
    await sql`UPDATE webhook_settings SET is_active = false`;
    
    // Insert new active one
    const result = await sql`
      INSERT INTO webhook_settings (webhook_url, is_active)
      VALUES (${webhook_url}, true)
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error saving webhook:', error);
    return NextResponse.json({ error: 'Failed to save webhook' }, { status: 500 });
  }
}
