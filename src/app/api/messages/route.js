import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = getDb();
    const messages = await sql`SELECT * FROM saved_messages ORDER BY created_at DESC`;
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sql = getDb();
    const { title, mail_subject, mail_body } = await request.json();
    
    const result = await sql`
      INSERT INTO saved_messages (title, mail_subject, mail_body)
      VALUES (${title}, ${mail_subject || ''}, ${mail_body})
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const sql = getDb();
    const { id, title, mail_subject, mail_body } = await request.json();
    
    const result = await sql`
      UPDATE saved_messages
      SET title = ${title}, mail_subject = ${mail_subject || ''}, mail_body = ${mail_body}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await sql`DELETE FROM saved_messages WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
