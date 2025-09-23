import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Banknote,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  Percent,
  Calendar,
  Mail,
  Shield,
  Zap,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPayments() {
  const [settings, setSettings] = useState({
    // Payment Methods
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    bankTransferEnabled: true,
    cashEnabled: true,
    chequeEnabled: false,
    
    // Invoice Settings
    defaultDueDays: 30,
    depositPercentage: 50,
    gstRate: 10,
    currency: 'AUD',
    
    // Email Settings
    sendInvoiceEmails: true,
    sendPaymentReminders: true,
    reminderDays: [7, 3, 1], // Days before due date
    
    // Business Details
    businessName: 'BMSPRO',
    businessAddress: '123 High Street, Cranbourne VIC 3977',
    businessABN: '12 345 678 901',
    businessEmail: 'accounts@bmspro.com.au',
    businessPhone: '+61 3 1234 5678',
    
    // Terms & Conditions
    paymentTerms: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.',
    refundPolicy: 'Refunds are processed within 5-10 business days of approval.',
    
    // Notifications
    notifyOnPayment: true,
    notifyOnOverdue: true,
    autoSendInvoices: false
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    // In a real app, this would load from the backend
    // For now, we'll use the default settings
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure payment methods, invoice settings, and business details
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Integration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <Label htmlFor="stripe-enabled">Stripe Integration</Label>
                  </div>
                  <Switch
                    id="stripe-enabled"
                    checked={settings.stripeEnabled}
                    onCheckedChange={(checked) => updateSetting('stripeEnabled', checked)}
                  />
                </div>
                
                {settings.stripeEnabled && (
                  <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                    <div>
                      <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                      <Input
                        id="stripe-publishable-key"
                        type="password"
                        value={settings.stripePublishableKey}
                        onChange={(e) => updateSetting('stripePublishableKey', e.target.value)}
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripe-secret-key">Secret Key</Label>
                      <Input
                        id="stripe-secret-key"
                        type="password"
                        value={settings.stripeSecretKey}
                        onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Other Payment Methods */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Other Payment Methods</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <Label htmlFor="bank-transfer">Bank Transfer</Label>
                  </div>
                  <Switch
                    id="bank-transfer"
                    checked={settings.bankTransferEnabled}
                    onCheckedChange={(checked) => updateSetting('bankTransferEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <Switch
                    id="cash"
                    checked={settings.cashEnabled}
                    onCheckedChange={(checked) => updateSetting('cashEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <Label htmlFor="cheque">Cheque</Label>
                  </div>
                  <Switch
                    id="cheque"
                    checked={settings.chequeEnabled}
                    onCheckedChange={(checked) => updateSetting('chequeEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Invoice Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due-days">Default Due Days</Label>
                  <Input
                    id="due-days"
                    type="number"
                    value={settings.defaultDueDays}
                    onChange={(e) => updateSetting('defaultDueDays', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="deposit-percentage">Deposit Percentage</Label>
                  <div className="relative">
                    <Input
                      id="deposit-percentage"
                      type="number"
                      value={settings.depositPercentage}
                      onChange={(e) => updateSetting('depositPercentage', parseInt(e.target.value))}
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gst-rate">GST Rate (%)</Label>
                  <Input
                    id="gst-rate"
                    type="number"
                    value={settings.gstRate}
                    onChange={(e) => updateSetting('gstRate', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Email Settings</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-invoice-emails">Send Invoice Emails</Label>
                  <Switch
                    id="send-invoice-emails"
                    checked={settings.sendInvoiceEmails}
                    onCheckedChange={(checked) => updateSetting('sendInvoiceEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="send-reminders">Send Payment Reminders</Label>
                  <Switch
                    id="send-reminders"
                    checked={settings.sendPaymentReminders}
                    onCheckedChange={(checked) => updateSetting('sendPaymentReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-send">Auto-send Invoices</Label>
                  <Switch
                    id="auto-send"
                    checked={settings.autoSendInvoices}
                    onCheckedChange={(checked) => updateSetting('autoSendInvoices', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={settings.businessName}
                  onChange={(e) => updateSetting('businessName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea
                  id="business-address"
                  value={settings.businessAddress}
                  onChange={(e) => updateSetting('businessAddress', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business-abn">ABN</Label>
                  <Input
                    id="business-abn"
                    value={settings.businessABN}
                    onChange={(e) => updateSetting('businessABN', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input
                    id="business-phone"
                    value={settings.businessPhone}
                    onChange={(e) => updateSetting('businessPhone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="business-email">Email</Label>
                <Input
                  id="business-email"
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => updateSetting('businessEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms & Policies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-600" />
                Terms & Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Textarea
                  id="payment-terms"
                  value={settings.paymentTerms}
                  onChange={(e) => updateSetting('paymentTerms', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="refund-policy">Refund Policy</Label>
                <Textarea
                  id="refund-policy"
                  value={settings.refundPolicy}
                  onChange={(e) => updateSetting('refundPolicy', e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-payment">Notify on Payment</Label>
                  <Switch
                    id="notify-payment"
                    checked={settings.notifyOnPayment}
                    onCheckedChange={(checked) => updateSetting('notifyOnPayment', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-overdue">Notify on Overdue</Label>
                  <Switch
                    id="notify-overdue"
                    checked={settings.notifyOnOverdue}
                    onCheckedChange={(checked) => updateSetting('notifyOnOverdue', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Payment System</p>
                <p className="text-sm text-green-700">Active & Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Email Notifications</p>
                <p className="text-sm text-blue-700">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Security</p>
                <p className="text-sm text-purple-700">PCI Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}