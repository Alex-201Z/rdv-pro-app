// Configuration et helpers pour l'envoi d'emails via Nodemailer
// IMPORTANT: Ces fonctions doivent être appelées côté serveur uniquement (API routes)
// Ne jamais exposer les credentials SMTP côté client

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Configuration SMTP
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const defaultFrom = {
  email: process.env.SMTP_FROM_EMAIL || 'noreply@rdvpro.com',
  name: process.env.SMTP_FROM_NAME || 'RDV PRO',
};

// Vérifier que les variables d'environnement sont définies
if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
  console.warn(
    'Les variables d\'environnement SMTP ne sont pas toutes définies. L\'envoi d\'emails sera désactivé.'
  );
}

// Créer le transporter Nodemailer
let transporter: Transporter | null = null;

try {
  transporter = nodemailer.createTransport(smtpConfig);
} catch (error) {
  console.error('Erreur lors de la création du transporter email:', error);
}

// Interface pour les options d'email
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: {
    email: string;
    name?: string;
  };
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
  }>;
}

// Interface pour les templates d'emails
export interface EmailTemplate {
  appointmentConfirmation: (data: {
    clientName: string;
    propertyTitle: string;
    propertyAddress: string;
    appointmentDate: string;
    appointmentTime: string;
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
  }) => { subject: string; html: string; text: string };

  appointmentReminder: (data: {
    clientName: string;
    propertyTitle: string;
    propertyAddress: string;
    appointmentDate: string;
    appointmentTime: string;
  }) => { subject: string; html: string; text: string };

  appointmentCancelled: (data: {
    clientName: string;
    propertyTitle: string;
    reason?: string;
  }) => { subject: string; html: string; text: string };

  newMatch: (data: {
    buyerName: string;
    propertyTitle: string;
    propertyDescription: string;
    propertyPrice: string;
    propertyUrl: string;
    propertyImage?: string;
  }) => { subject: string; html: string; text: string };

  welcome: (data: {
    userName: string;
    loginUrl: string;
  }) => { subject: string; html: string; text: string };
}

// Templates d'emails HTML
export const emailTemplates: EmailTemplate = {
  // Confirmation de rendez-vous
  appointmentConfirmation: (data) => ({
    subject: `Confirmation de votre rendez-vous - ${data.propertyTitle}`,
    text: `Bonjour ${data.clientName},\n\nVotre rendez-vous pour visiter ${data.propertyTitle} est confirmé.\n\nAdresse: ${data.propertyAddress}\nDate: ${data.appointmentDate}\nHeure: ${data.appointmentTime}\n\n${data.agentName ? `Votre agent: ${data.agentName}\n` : ''}${data.agentPhone ? `Téléphone: ${data.agentPhone}\n` : ''}${data.agentEmail ? `Email: ${data.agentEmail}\n` : ''}\n\nÀ bientôt!\nL'équipe RDV PRO`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .details { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Confirmation de rendez-vous</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${data.clientName}</strong>,</p>
              <p>Votre rendez-vous pour visiter la propriété suivante est confirmé:</p>

              <div class="details">
                <h2>${data.propertyTitle}</h2>
                <p><strong>📍 Adresse:</strong> ${data.propertyAddress}</p>
                <p><strong>📅 Date:</strong> ${data.appointmentDate}</p>
                <p><strong>🕐 Heure:</strong> ${data.appointmentTime}</p>
                ${data.agentName ? `<p><strong>👤 Agent:</strong> ${data.agentName}</p>` : ''}
                ${data.agentPhone ? `<p><strong>📞 Téléphone:</strong> ${data.agentPhone}</p>` : ''}
                ${data.agentEmail ? `<p><strong>✉️ Email:</strong> ${data.agentEmail}</p>` : ''}
              </div>

              <p>Nous sommes impatients de vous rencontrer!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RDV PRO - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Rappel de rendez-vous
  appointmentReminder: (data) => ({
    subject: `Rappel: Rendez-vous demain - ${data.propertyTitle}`,
    text: `Bonjour ${data.clientName},\n\nCeci est un rappel pour votre rendez-vous demain:\n\nPropriété: ${data.propertyTitle}\nAdresse: ${data.propertyAddress}\nDate: ${data.appointmentDate}\nHeure: ${data.appointmentTime}\n\nÀ demain!\nL'équipe RDV PRO`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { background-color: #fffbeb; padding: 30px; margin: 20px 0; border-radius: 8px; border: 2px solid #f59e0b; }
            .details { background-color: white; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Rappel de rendez-vous</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${data.clientName}</strong>,</p>
              <p>N'oubliez pas votre rendez-vous <strong>demain</strong>:</p>

              <div class="details">
                <h2>${data.propertyTitle}</h2>
                <p><strong>📍 Adresse:</strong> ${data.propertyAddress}</p>
                <p><strong>📅 Date:</strong> ${data.appointmentDate}</p>
                <p><strong>🕐 Heure:</strong> ${data.appointmentTime}</p>
              </div>

              <p>À demain!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RDV PRO - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Annulation de rendez-vous
  appointmentCancelled: (data) => ({
    subject: `Rendez-vous annulé - ${data.propertyTitle}`,
    text: `Bonjour ${data.clientName},\n\nNous vous informons que votre rendez-vous pour visiter ${data.propertyTitle} a été annulé.${data.reason ? `\n\nRaison: ${data.reason}` : ''}\n\nContactez-nous pour reprogrammer votre visite.\n\nCordialement,\nL'équipe RDV PRO`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { background-color: #fef2f2; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rendez-vous annulé</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${data.clientName}</strong>,</p>
              <p>Nous vous informons que votre rendez-vous pour visiter <strong>${data.propertyTitle}</strong> a été annulé.</p>
              ${data.reason ? `<p><strong>Raison:</strong> ${data.reason}</p>` : ''}
              <p>N'hésitez pas à nous contacter pour reprogrammer votre visite.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RDV PRO - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Nouveau match
  newMatch: (data) => ({
    subject: `Nouvelle propriété correspondant à vos critères!`,
    text: `Bonjour ${data.buyerName},\n\nNous avons trouvé une propriété qui correspond à vos critères:\n\n${data.propertyTitle}\nPrix: ${data.propertyPrice}\n\n${data.propertyDescription}\n\nConsultez tous les détails: ${data.propertyUrl}\n\nL'équipe RDV PRO`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .property { background-color: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .property img { width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Nouveau Match!</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${data.buyerName}</strong>,</p>
              <p>Excellente nouvelle! Nous avons trouvé une propriété qui correspond parfaitement à vos critères:</p>

              <div class="property">
                ${data.propertyImage ? `<img src="${data.propertyImage}" alt="${data.propertyTitle}">` : ''}
                <h2>${data.propertyTitle}</h2>
                <p style="font-size: 24px; color: #10b981; font-weight: bold;">${data.propertyPrice}</p>
                <p>${data.propertyDescription}</p>
                <a href="${data.propertyUrl}" class="button">Voir les détails</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RDV PRO - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Email de bienvenue
  welcome: (data) => ({
    subject: 'Bienvenue sur RDV PRO!',
    text: `Bonjour ${data.userName},\n\nBienvenue sur RDV PRO! Nous sommes ravis de vous compter parmi nous.\n\nConnectez-vous dès maintenant: ${data.loginUrl}\n\nL'équipe RDV PRO`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur RDV PRO!</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${data.userName}</strong>,</p>
              <p>Nous sommes ravis de vous compter parmi nous!</p>
              <p>RDV PRO est votre plateforme de gestion de rendez-vous immobiliers.</p>
              <a href="${data.loginUrl}" class="button">Se connecter</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RDV PRO - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

/**
 * Envoyer un email
 * @param options - Options d'envoi de l'email
 * @returns Promise avec le résultat de l'envoi
 */
export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, text, from = defaultFrom, attachments } = options;

  // Vérifier que le transporter est initialisé
  if (!transporter) {
    throw new Error(
      'Transporter email non initialisé. Vérifiez vos variables d\'environnement SMTP.'
    );
  }

  try {
    const result = await transporter.sendMail({
      from: `"${from.name || defaultFrom.name}" <${from.email || defaultFrom.email}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
      attachments,
    });

    console.log('Email envoyé avec succès:', {
      messageId: result.messageId,
      to,
      subject,
    });

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
    };
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
  }
}

/**
 * Envoyer un email de confirmation de rendez-vous
 */
export async function sendAppointmentConfirmationEmail(
  to: string,
  data: Parameters<EmailTemplate['appointmentConfirmation']>[0]
) {
  const template = emailTemplates.appointmentConfirmation(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Envoyer un email de rappel de rendez-vous
 */
export async function sendAppointmentReminderEmail(
  to: string,
  data: Parameters<EmailTemplate['appointmentReminder']>[0]
) {
  const template = emailTemplates.appointmentReminder(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Envoyer un email d'annulation de rendez-vous
 */
export async function sendAppointmentCancelledEmail(
  to: string,
  data: Parameters<EmailTemplate['appointmentCancelled']>[0]
) {
  const template = emailTemplates.appointmentCancelled(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Envoyer un email de nouveau match
 */
export async function sendNewMatchEmail(
  to: string,
  data: Parameters<EmailTemplate['newMatch']>[0]
) {
  const template = emailTemplates.newMatch(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Envoyer un email de bienvenue
 */
export async function sendWelcomeEmail(
  to: string,
  data: Parameters<EmailTemplate['welcome']>[0]
) {
  const template = emailTemplates.welcome(data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Vérifier la connexion SMTP
 */
export async function verifyEmailConnection(): Promise<boolean> {
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log('Connexion SMTP vérifiée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur de connexion SMTP:', error);
    return false;
  }
}

export default {
  sendEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail,
  sendAppointmentCancelledEmail,
  sendNewMatchEmail,
  sendWelcomeEmail,
  verifyEmailConnection,
  emailTemplates,
};
