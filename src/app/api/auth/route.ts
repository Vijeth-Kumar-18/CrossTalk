import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, verifyUserCredentials, getUserById } from '@/lib/db';
import { isValidEmail, validatePasswordStrength } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, fullName, preferredLanguage } = body;

    // Strict Sign Up
    if (action === 'signup') {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (fullName || '').trim();

      if (!cleanEmail || !cleanName || !password) {
        return NextResponse.json(
          { success: false, error: 'Full name, email address, and password are required.' },
          { status: 400 }
        );
      }

      if (!isValidEmail(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }

      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.isValid) {
        return NextResponse.json(
          { success: false, error: passwordCheck.message },
          { status: 400 }
        );
      }

      const existingUser = await getUserByEmail(cleanEmail);
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'An account with this email address already exists.' },
          { status: 400 }
        );
      }

      const user = await createUser({
        email: cleanEmail,
        password,
        fullName: cleanName,
        preferredLanguage: preferredLanguage || 'en-US',
      });

      return NextResponse.json({ success: true, user }, { status: 201 });
    }

    // Strict Sign In
    if (action === 'login') {
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !password) {
        return NextResponse.json(
          { success: false, error: 'Please enter both your email address and password.' },
          { status: 400 }
        );
      }

      if (!isValidEmail(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format.' },
          { status: 400 }
        );
      }

      const user = await verifyUserCredentials(cleanEmail, password);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Incorrect email or password. Please verify your credentials.' },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: 'Invalid auth action.' }, { status: 400 });
  } catch (err) {
    console.error('[API /api/auth] Error:', err);
    return NextResponse.json({ success: false, error: 'Authentication service encountered an error.' }, { status: 500 });
  }
}
