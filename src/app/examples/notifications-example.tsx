'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NotificationsExample() {
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'Test Email',
    message: 'Ceci est un email de test depuis RDV PRO',
  });
  const [smsData, setSmsData] = useState({
    to: '+18622639541', // Numéro de test Twilio
    message: 'Ceci est un SMS de test depuis RDV PRO',
  });

  // Envoyer un email simple
  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.message,
          html: `<p>${emailData.message}</p>`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email envoyé avec succès!');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un SMS simple
  const handleSendSMS = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsData.to,
          message: smsData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('SMS envoyé avec succès!');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  // Envoyer une confirmation de rendez-vous (Email + SMS)
  const handleSendAppointmentConfirmation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/appointment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailData.to,
          phone: smsData.to,
          clientName: 'Jean Dupont',
          propertyTitle: 'Appartement 3 pièces - Paris 15e',
          propertyAddress: '123 Rue de Vaugirard, 75015 Paris',
          appointmentDate: '15 janvier 2025',
          appointmentTime: '14h30',
          agentName: 'Marie Martin',
          agentPhone: '+33612345678',
          agentEmail: 'marie.martin@rdvpro.com',
        }),
      });

      const result = await response.json();

      if (result.success) {
        const { email, sms } = result.data;
        if (email?.success && sms?.success) {
          toast.success('Email et SMS envoyés avec succès!');
        } else if (email?.success) {
          toast.success('Email envoyé (SMS échoué)');
        } else if (sms?.success) {
          toast.success('SMS envoyé (Email échoué)');
        } else {
          toast.error('Erreur lors de l\'envoi');
        }
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Exemples de notifications</h1>

      <div className="space-y-6">
        {/* Section Email */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📧</span> Envoyer un Email
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Destinataire
              </label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Sujet
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <button
              onClick={handleSendEmail}
              disabled={loading || !emailData.to}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Envoi...' : 'Envoyer Email'}
            </button>
          </div>
        </div>

        {/* Section SMS */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>💬</span> Envoyer un SMS
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Numéro de téléphone (format international)
              </label>
              <input
                type="tel"
                value={smsData.to}
                onChange={(e) => setSmsData({ ...smsData, to: e.target.value })}
                placeholder="+33612345678"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: +[code pays][numéro] (ex: +33612345678)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                value={smsData.message}
                onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                {smsData.message.length}/160 caractères
              </p>
            </div>
            <button
              onClick={handleSendSMS}
              disabled={loading || !smsData.to}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Envoi...' : 'Envoyer SMS'}
            </button>
          </div>
        </div>

        {/* Section Confirmation de rendez-vous */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📅</span> Confirmation de rendez-vous
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Envoie un email et un SMS de confirmation de rendez-vous avec un template prédéfini.
          </p>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm font-medium mb-2">Données de test:</p>
            <ul className="text-sm space-y-1">
              <li><strong>Client:</strong> Jean Dupont</li>
              <li><strong>Propriété:</strong> Appartement 3 pièces - Paris 15e</li>
              <li><strong>Date:</strong> 15 janvier 2025 à 14h30</li>
              <li><strong>Agent:</strong> Marie Martin</li>
            </ul>
          </div>
          <button
            onClick={handleSendAppointmentConfirmation}
            disabled={loading || !emailData.to}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400"
          >
            {loading ? 'Envoi...' : 'Envoyer confirmation (Email + SMS)'}
          </button>
        </div>

        {/* Informations */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>ℹ️</span> Informations importantes
          </h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Les emails sont envoyés via Mailtrap (environnement de test)</li>
            <li>Les SMS sont envoyés via Twilio (compte trial)</li>
            <li>En mode trial Twilio, seuls les numéros vérifiés peuvent recevoir des SMS</li>
            <li>Consultez Mailtrap.io pour voir les emails reçus</li>
            <li>Les API routes sont dans <code>/api/notifications/*</code></li>
          </ul>
        </div>

        {/* Utilisation dans le code */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Utilisation dans votre code:</h3>
          <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`// Côté serveur (API route)
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';

// Envoyer un email
await sendEmail({
  to: 'client@example.com',
  subject: 'Votre rendez-vous',
  html: '<p>Rendez-vous confirmé</p>'
});

// Envoyer un SMS
await sendSMS({
  to: '+33612345678',
  message: 'Rendez-vous confirmé'
});

// Côté client (composant React)
const response = await fetch('/api/notifications/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to, subject, html })
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}
