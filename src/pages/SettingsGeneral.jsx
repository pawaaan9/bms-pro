import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  getUserSettings, 
  updateUserSettings, 
  getAvailableTimezones, 
  getAvailableDateFormats, 
  getAvailableTimeFormats, 
  getAvailableCurrencies 
} from '../services/settingsService';
import { formatDateTime } from '../utils/dateTimeUtils';

export default function SettingsGeneral() {
  const { user, getToken, userSettings: contextSettings, refreshSettings } = useAuth();
  const [settings, setSettings] = useState({
    timezone: 'Australia/Sydney',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    currency: 'AUD'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const timezones = getAvailableTimezones();
  const dateFormats = getAvailableDateFormats();
  const timeFormats = getAvailableTimeFormats();
  const currencies = getAvailableCurrencies();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const userSettings = await getUserSettings(token);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use context settings as fallback
      if (contextSettings) {
        setSettings(contextSettings);
      }
      setMessage({ type: 'error', text: 'Failed to load settings. Using defaults.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const token = getToken();
      await updateUserSettings(token, settings);
      
      // Refresh settings in context
      await refreshSettings();
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getPreviewText = () => {
    const now = new Date();
    return formatDateTime(now, settings.dateFormat, settings.timeFormat, settings.timezone);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">
          Configure your timezone, date/time format, and currency preferences.
        </p>
      </div>

      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : null}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Timezone Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Timezone</CardTitle>
            <CardDescription>
              Set your local timezone. All timestamps will be displayed according to this setting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Select Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Format */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time Format</CardTitle>
            <CardDescription>
              Choose how dates and times are displayed throughout the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => handleSettingChange('dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex flex-col">
                          <span>{format.label}</span>
                          <span className="text-sm text-muted-foreground">{format.example}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  value={settings.timeFormat}
                  onValueChange={(value) => handleSettingChange('timeFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex flex-col">
                          <span>{format.label}</span>
                          <span className="text-sm text-muted-foreground">{format.example}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 bg-muted rounded-md">
                <code className="text-sm">{getPreviewText()}</code>
              </div>
              <p className="text-sm text-muted-foreground">
                This is how dates and times will appear throughout the application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Select the currency symbol for all monetary values displayed in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => handleSettingChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{currency.symbol}</span>
                        <span>{currency.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 bg-muted rounded-md">
                <code className="text-sm">
                  {currencies.find(c => c.value === settings.currency)?.symbol}1,234.56
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                This is how currency amounts will appear throughout the application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}