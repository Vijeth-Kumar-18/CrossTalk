import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile, updateUserPassword, getUserById } from '@/lib/db';
import { validatePasswordStrength } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('[API /api/user/profile] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error retrieving profile.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullName, preferredLanguage } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const updatedUser = await updateUserProfile({
      userId,
      fullName,
      preferredLanguage,
    });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'Failed to update user profile.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('[API /api/user/profile] PUT error:', err);
    return NextResponse.json({ success: false, error: 'Server error updating profile.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, oldPassword, newPassword } = body;

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'User ID, current password, and new password are required.' },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return NextResponse.json({ success: false, error: strength.message }, { status: 400 });
    }

    const result = await updateUserPassword({
      userId,
      oldPassword,
      newPassword,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Password update failed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[API /api/user/profile] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error updating password.' }, { status: 500 });
  }
}
