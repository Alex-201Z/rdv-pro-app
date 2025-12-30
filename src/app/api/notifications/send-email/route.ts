import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * API Route pour envoyer des emails
 * POST /api/notifications/send-email
 *
 * Body: {
 *   to: string | string[],
 *   subject: string,
 *   html?: string,
 *   text?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    // Validation
    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Les champs "to" et "subject" sont requis' },
        { status: 400 }
      );
    }

    if (!html && !text) {
      return NextResponse.json(
        { error: 'Au moins un champ "html" ou "text" est requis' },
        { status: 400 }
      );
    }

    // Envoyer l'email
    const result = await sendEmail({ to, subject, html, text });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur API send-email:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
