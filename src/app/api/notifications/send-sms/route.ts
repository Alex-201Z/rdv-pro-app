import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

/**
 * API Route pour envoyer des SMS
 * POST /api/notifications/send-sms
 *
 * Body: {
 *   to: string,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    // Validation
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Les champs "to" et "message" sont requis' },
        { status: 400 }
      );
    }

    // Envoyer le SMS
    const result = await sendSMS({ to, message });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur API send-sms:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi du SMS' },
      { status: 500 }
    );
  }
}
