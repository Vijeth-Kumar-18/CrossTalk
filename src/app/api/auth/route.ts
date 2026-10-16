import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, getUserById } from '@/lib/db';
import { DEMO_USERS } from '@/constants/appConstants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, fullName, preferredLanguage, userId } = body;

    // Quick demo login
    if (action === 'demo') {
      const demoUser = DEMO_USERS.find((d) => d.id === userId) || DEMO_USERS[0];
      let user = await getUserById(demoUser.id);
      if (!user) {
        user = await createUser({
          email: demoUser.email,
          fullName: demoUser.fullName,
          preferredLanguage: demoUser.preferredLanguage,
        });
      }
      return NextResponse.json({ success: true, user });
    }

    if (action === 'signup') {
      if (!email || !fullName) {
        return NextResponse.json({ success: false, error: 'Email and Name are required.' }, { status: 400 });
      }
      const existing = await getUserByEmail(email);
      if (existing) {
        return NextResponse.json({ success: false, error: 'User with this email already exists.' }, { status: 400 });
      }
      const user = await createUser({
        email,
        password,
        fullName,
        preferredLanguage: preferredLanguage || 'en-US',
      });
      return NextResponse.json({ success: true, user });
    }

    // Default: login
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    let user = await getUserByEmail(email);
    if (!user) {
      // Auto-create for seamless friction-free onboarding
      user = await createUser({
        email,
        password: password || 'password123',
        fullName: email.split('@')[0],
        preferredLanguage: preferredLanguage || 'en-US',
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('[API /api/auth] Error:', err);
    return NextResponse.json({ success: false, error: 'Authentication failed.' }, { status: 500 });
  }
}
