import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentConfirmationEmail } from '@/lib/email';
import { sendAppointmentConfirmationSMS } from '@/lib/sms';

/**
 * API Route pour envoyer une confirmation de rendez-vous (Email + SMS)
 * POST /api/notifications/appointment-confirmation
 *
 * Body: {
 *   email: string,
 *   phone?: string,
 *   clientName: string,
 *   propertyTitle: string,
 *   propertyAddress: string,
 *   appointmentDate: string,
 *   appointmentTime: string,
 *   agentName?: string,
 *   agentPhone?: string,
 *   agentEmail?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      clientName,
      propertyTitle,
      propertyAddress,
      appointmentDate,
      appointmentTime,
      agentName,
      agentPhone,
      agentEmail,
    } = body;

    // Validation
    if (!email || !clientName || !propertyTitle || !propertyAddress || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    const results: any = {
      email: null,
      sms: null,
    };

    // Envoyer l'email
    try {
      const emailResult = await sendAppointmentConfirmationEmail(email, {
        clientName,
        propertyTitle,
        propertyAddress,
        appointmentDate,
        appointmentTime,
        agentName,
        agentPhone,
        agentEmail,
      });
      results.email = { success: true, ...emailResult };
    } catch (error: any) {
      console.error('Erreur envoi email:', error);
      results.email = { success: false, error: error.message };
    }

    // Envoyer le SMS si un numéro est fourni
    if (phone) {
      try {
        const smsResult = await sendAppointmentConfirmationSMS(phone, {
          clientName,
          propertyAddress,
          appointmentDate,
          appointmentTime,
        });
        results.sms = { success: true, ...smsResult };
      } catch (error: any) {
        console.error('Erreur envoi SMS:', error);
        results.sms = { success: false, error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Erreur API appointment-confirmation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi des notifications' },
      { status: 500 }
    );
  }
}
