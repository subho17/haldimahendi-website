import { NextResponse } from "next/server";

async function testHandler(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error:', e);
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 });
  }
}

export { testHandler };