import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { 
  getUserSettings, 
  updateUserSettings, 
  getAvailableTimezones, 
  getAvailableDateFormats, 
  getAvailableTimeFormats, 
  getAvailableCurrencies 
} from '../services/settingsService';
import { changePassword } from '../services/userService';
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
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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
      setMessage({ type: 'error', text: '⚠️ Couldn\'t load your settings, but we\'re using defaults for now.' });
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
      
      setMessage({ type: 'success', text: '✨ Great! Your settings have been saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: '😅 Oops! We couldn\'t save your settings. Please try again.' });
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

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear password message when user starts typing
    if (passwordMessage.text) {
      setPasswordMessage({ type: '', text: '' });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordSubmit = async () => {
    try {
      setPasswordSaving(true);
      setPasswordMessage({ type: '', text: '' });

      // Validate form with creative messages
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setPasswordMessage({ type: 'error', text: '🔍 Please fill in all password fields to continue.' });
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordMessage({ type: 'error', text: '🔄 Oops! Your new passwords don\'t match. Try typing them again.' });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: '💪 Your new password needs to be at least 6 characters long for security.' });
        return;
      }

      if (passwordForm.currentPassword === passwordForm.newPassword) {
        setPasswordMessage({ type: 'error', text: '🔄 Your new password should be different from your current one.' });
        return;
      }

      // Call password change function
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);

      setPasswordMessage({ type: 'success', text: '🎉 Awesome! Your password has been updated successfully!' });
      
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setPasswordMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle specific password change errors with creative messages
      if (error.message.includes('Current password is incorrect')) {
        setPasswordMessage({ type: 'error', text: '🔐 The current password you entered is incorrect. Please try again.' });
      } else if (error.message.includes('No authenticated user found')) {
        setPasswordMessage({ type: 'error', text: '👤 You need to be logged in to change your password. Please refresh and try again.' });
      } else if (error.message.includes('User not found')) {
        setPasswordMessage({ type: 'error', text: '🔍 We couldn\'t find your account. Please contact support.' });
      } else if (error.message.includes('Invalid email')) {
        setPasswordMessage({ type: 'error', text: '📧 There\'s an issue with your email. Please contact support.' });
      } else if (error.message.includes('Failed to verify current password')) {
        setPasswordMessage({ type: 'error', text: '🤔 We couldn\'t verify your current password. Please check and try again.' });
      } else {
        setPasswordMessage({ type: 'error', text: '😅 Oops! Something went wrong while changing your password. Please try again.' });
      }
    } finally {
      setPasswordSaving(false);
    }
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

        {/* Password Change - Only for hall owners */}
        {user?.role === 'hall_owner' && (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password. Choose a strong password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage.text && (
                <Alert variant={passwordMessage.type === 'error' ? 'destructive' : 'default'}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : passwordMessage.type === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : null}
                  <AlertDescription>{passwordMessage.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordSubmit} 
                    disabled={passwordSaving}
                    variant="outline"
                  >
                    {passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {passwordSaving ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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