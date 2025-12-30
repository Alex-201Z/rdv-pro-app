'use client';

import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';
import { ProfessionalSettings } from '@/types';
import { Card, Button, Input, Textarea, Spinner, Select } from '@/components/ui';
import { Settings, Bell, Clock, FileText, RefreshCw, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProfessionalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, varsRes] = await Promise.all([
        settingsApi.get(),
        settingsApi.templateVariables(),
      ]);
      setSettings(settingsRes.data.settings);
      setVariables(varsRes.data.variables);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await settingsApi.update(settings);
      toast.success('Paramètres enregistrés');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleResetTemplates = async () => {
    try {
      await settingsApi.resetTemplates();
      toast.success('Templates réinitialisés');
      loadSettings();
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const updateSetting = (key: keyof ProfessionalSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading || !settings) {
    return <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
          <p className="text-dark-400">Configurez vos notifications et préférences</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          <Save className="w-4 h-4" />
          Enregistrer
        </Button>
      </div>

      {/* Paramètres de notification */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Notifications automatiques</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Rappel avant RDV (heures)"
            type="number"
            min={1}
            max={72}
            value={settings.reminder_hours_before}
            onChange={(e) => updateSetting('reminder_hours_before', parseInt(e.target.value))}
          />
          <Input
            label="Suivi après RDV (heures)"
            type="number"
            min={1}
            max={48}
            value={settings.followup_hours_after}
            onChange={(e) => updateSetting('followup_hours_after', parseInt(e.target.value))}
          />
          <Input
            label="Relance après RDV (jours)"
            type="number"
            min={7}
            max={60}
            value={settings.relaunch_days_after}
            onChange={(e) => updateSetting('relaunch_days_after', parseInt(e.target.value))}
          />
        </div>
      </Card>

      {/* Paramètres de réservation */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Réservation</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Délai minimum avant RDV (heures)"
            type="number"
            min={1}
            max={168}
            value={settings.min_booking_notice}
            onChange={(e) => updateSetting('min_booking_notice', parseInt(e.target.value))}
          />
          <Input
            label="Réservation max à l'avance (jours)"
            type="number"
            min={7}
            max={365}
            value={settings.max_booking_days}
            onChange={(e) => updateSetting('max_booking_days', parseInt(e.target.value))}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allow_cancellation"
              checked={settings.allow_cancellation}
              onChange={(e) => updateSetting('allow_cancellation', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="allow_cancellation" className="text-dark-300">Autoriser les annulations</label>
          </div>
          {settings.allow_cancellation && (
            <Input
              label="Délai d'annulation (heures avant RDV)"
              type="number"
              min={1}
              max={72}
              value={settings.cancellation_notice}
              onChange={(e) => updateSetting('cancellation_notice', parseInt(e.target.value))}
            />
          )}
        </div>
      </Card>

      {/* Templates */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Templates de messages</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={handleResetTemplates}>
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </Button>
        </div>

        <div className="mb-4 p-3 bg-dark-800 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-4 h-4 text-primary-400 mt-0.5" />
            <span className="text-sm text-dark-300">Variables disponibles :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(variables).map(([key, desc]) => (
              <span key={key} className="text-xs bg-dark-700 px-2 py-1 rounded text-primary-400" title={desc}>
                {key}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Textarea
            label="Email de confirmation"
            value={settings.confirmation_email_template}
            onChange={(e) => updateSetting('confirmation_email_template', e.target.value)}
            rows={6}
          />
          <Textarea
            label="Email de rappel"
            value={settings.reminder_email_template}
            onChange={(e) => updateSetting('reminder_email_template', e.target.value)}
            rows={5}
          />
          <Input
            label="SMS de rappel (160 caractères max)"
            value={settings.reminder_sms_template}
            onChange={(e) => updateSetting('reminder_sms_template', e.target.value)}
            maxLength={160}
          />
          <Input
            label="SMS de suivi (160 caractères max)"
            value={settings.followup_sms_template}
            onChange={(e) => updateSetting('followup_sms_template', e.target.value)}
            maxLength={160}
          />
          <Textarea
            label="Email de relance (3 semaines)"
            value={settings.relaunch_email_template}
            onChange={(e) => updateSetting('relaunch_email_template', e.target.value)}
            rows={6}
          />
        </div>
      </Card>
    </div>
  );
}
