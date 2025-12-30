// Configuration et helpers pour l'envoi de SMS via Twilio
// IMPORTANT: Ces fonctions doivent être appelées côté serveur uniquement (API routes)
// Ne jamais exposer les credentials Twilio côté client

import twilio from 'twilio';

// Configuration Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Vérifier que les variables d'environnement sont définies
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn(
    'Les variables d\'environnement Twilio ne sont pas toutes définies. L\'envoi de SMS sera désactivé.'
  );
}

// Créer le client Twilio (uniquement si les credentials sont disponibles)
const twilioClient = accountSid && authToken
  ? twilio(accountSid, authToken)
  : null;

// Interface pour les options de SMS
export interface SendSMSOptions {
  to: string;
  message: string;
  from?: string; // Optionnel, utilise TWILIO_PHONE_NUMBER par défaut
}

// Interface pour les templates de SMS
export interface SMSTemplate {
  appointmentConfirmation: (data: {
    clientName: string;
    propertyAddress: string;
    appointmentDate: string;
    appointmentTime: string;
  }) => string;
  appointmentReminder: (data: {
    clientName: string;
    propertyAddress: string;
    appointmentTime: string;
  }) => string;
  appointmentCancelled: (data: {
    clientName: string;
    propertyAddress: string;
  }) => string;
  newMatch: (data: {
    buyerName: string;
    propertyTitle: string;
    propertyPrice: string;
  }) => string;
}

// Templates de messages SMS
export const smsTemplates: SMSTemplate = {
  // Confirmation de rendez-vous
  appointmentConfirmation: ({ clientName, propertyAddress, appointmentDate, appointmentTime }) => {
    return `Bonjour ${clientName}, votre rendez-vous pour visiter ${propertyAddress} est confirmé le ${appointmentDate} à ${appointmentTime}. RDV PRO`;
  },

  // Rappel de rendez-vous (24h avant)
  appointmentReminder: ({ clientName, propertyAddress, appointmentTime }) => {
    return `Rappel: Vous avez un rendez-vous demain à ${appointmentTime} pour visiter ${propertyAddress}. À bientôt! RDV PRO`;
  },

  // Annulation de rendez-vous
  appointmentCancelled: ({ clientName, propertyAddress }) => {
    return `Bonjour ${clientName}, votre rendez-vous pour ${propertyAddress} a été annulé. Contactez-nous pour reprogrammer. RDV PRO`;
  },

  // Nouveau match propriété-acheteur
  newMatch: ({ buyerName, propertyTitle, propertyPrice }) => {
    return `Bonjour ${buyerName}, une nouvelle propriété correspond à vos critères: ${propertyTitle} à ${propertyPrice}. Consultez votre espace pour plus d'infos. RDV PRO`;
  },
};

/**
 * Envoyer un SMS via Twilio
 * @param options - Options d'envoi du SMS
 * @returns Promise avec le résultat de l'envoi
 */
export async function sendSMS(options: SendSMSOptions) {
  const { to, message, from = twilioPhoneNumber } = options;

  // Vérifier que le client Twilio est initialisé
  if (!twilioClient) {
    throw new Error(
      'Client Twilio non initialisé. Vérifiez vos variables d\'environnement.'
    );
  }

  if (!from) {
    throw new Error(
      'Numéro Twilio non défini. Vérifiez TWILIO_PHONE_NUMBER dans vos variables d\'environnement.'
    );
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: from,
      to: to,
    });

    console.log('SMS envoyé avec succès:', {
      sid: result.sid,
      to: result.to,
      status: result.status,
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      to: result.to,
    };
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    throw new Error(`Échec de l'envoi du SMS: ${error.message}`);
  }
}

/**
 * Envoyer un SMS de confirmation de rendez-vous
 */
export async function sendAppointmentConfirmationSMS(
  phoneNumber: string,
  data: Parameters<SMSTemplate['appointmentConfirmation']>[0]
) {
  const message = smsTemplates.appointmentConfirmation(data);
  return sendSMS({ to: phoneNumber, message });
}

/**
 * Envoyer un SMS de rappel de rendez-vous
 */
export async function sendAppointmentReminderSMS(
  phoneNumber: string,
  data: Parameters<SMSTemplate['appointmentReminder']>[0]
) {
  const message = smsTemplates.appointmentReminder(data);
  return sendSMS({ to: phoneNumber, message });
}

/**
 * Envoyer un SMS d'annulation de rendez-vous
 */
export async function sendAppointmentCancelledSMS(
  phoneNumber: string,
  data: Parameters<SMSTemplate['appointmentCancelled']>[0]
) {
  const message = smsTemplates.appointmentCancelled(data);
  return sendSMS({ to: phoneNumber, message });
}

/**
 * Envoyer un SMS de nouveau match
 */
export async function sendNewMatchSMS(
  phoneNumber: string,
  data: Parameters<SMSTemplate['newMatch']>[0]
) {
  const message = smsTemplates.newMatch(data);
  return sendSMS({ to: phoneNumber, message });
}

/**
 * Valider un numéro de téléphone (format international)
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Format international: +[code pays][numéro]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Formater un numéro de téléphone au format international
 * @param phoneNumber - Numéro à formater
 * @param countryCode - Code pays par défaut (ex: '+1' pour USA/Canada)
 */
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string = '+1'
): string {
  // Supprimer tous les caractères non numériques
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Si le numéro commence déjà par +, le retourner tel quel
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }

  // Ajouter le code pays si nécessaire
  return `${countryCode}${cleaned}`;
}

export default {
  sendSMS,
  sendAppointmentConfirmationSMS,
  sendAppointmentReminderSMS,
  sendAppointmentCancelledSMS,
  sendNewMatchSMS,
  isValidPhoneNumber,
  formatPhoneNumber,
  smsTemplates,
};
