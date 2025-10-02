import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { emailTemplatesAPI, emailCommsAPI, emailTemplateHelpers } from "@/services/emailService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Search, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  DollarSign, 
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";
import ToastNotification from "@/components/ui/ToastNotification";

export default function CommsSendEmail() {
  const { token } = useAuth();
  
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const [emailData, setEmailData] = useState({
    templateId: "",
    recipientEmail: "",
    recipientName: "",
    bookingId: "",
    customSubject: "",
    customBody: "",
    variables: {}
  });

  // Helper function to show toast notifications
  const showToast = (type, title, message) => {
    setToast({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Load initial data
  useEffect(() => {
    loadTemplates();
    loadCustomers();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await emailTemplatesAPI.getTemplates(token);
      setTemplates(response.templates || []);
    } catch (err) {
      showToast('error', 'Error', 'Failed to load email templates');
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await emailCommsAPI.getCustomers(token, { search: searchTerm });
      setCustomers(response.customers || []);
    } catch (err) {
      showToast('error', 'Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerBookings = async (customerEmail) => {
    try {
      const response = await emailCommsAPI.getCustomerBookings(customerEmail, token);
      setCustomerBookings(response.bookings || []);
    } catch (err) {
      showToast('error', 'Error', 'Failed to load customer bookings');
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setEmailData(prev => ({
      ...prev,
      recipientEmail: customer.email,
      recipientName: customer.name
    }));
    loadCustomerBookings(customer.email);
  };

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setEmailData(prev => ({
      ...prev,
      bookingId: booking.id
    }));
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailData(prev => ({
        ...prev,
        templateId,
        customSubject: template.subject,
        customBody: template.body
      }));
    }
  };

  const handleCustomInputChange = (field, value) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendEmail = () => {
    if (!emailData.recipientEmail || (!emailData.templateId && !emailData.customSubject)) {
      showToast('error', 'Validation Error', 'Please select a recipient and either a template or enter custom content');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSendEmail = async () => {
    try {
      setSending(true);
      setShowConfirmDialog(false);
      
      const emailPayload = {
        ...emailData,
        variables: {
          customerName: emailData.recipientName,
          customerEmail: emailData.recipientEmail,
          ...(selectedBooking && {
            bookingId: selectedBooking.id,
            eventType: selectedBooking.eventType,
            bookingDate: selectedBooking.bookingDate,
            startTime: selectedBooking.startTime,
            endTime: selectedBooking.endTime,
            hallName: selectedBooking.hallName || selectedBooking.selectedHall,
            calculatedPrice: selectedBooking.calculatedPrice,
            guestCount: selectedBooking.guestCount,
            status: selectedBooking.status
          })
        }
      };

      await emailCommsAPI.sendEmail(emailPayload, token);
      
      showToast('success', 'Success', 'Email sent successfully!');
      
      // Reset form
      setEmailData({
        templateId: "",
        recipientEmail: "",
        recipientName: "",
        bookingId: "",
        customSubject: "",
        customBody: "",
        variables: {}
      });
      setSelectedCustomer(null);
      setSelectedBooking(null);
      setCustomerBookings([]);
      
    } catch (err) {
      showToast('error', 'Error', err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg w-fit">
            <Send className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Send Email
            </h1>
            <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base mt-1">
              Send customized emails to customers using templates or custom content.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Customer Selection */}
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              Select Customer
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose a customer to send the email to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No customers found
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.email}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCustomer?.email === customer.email
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{customer.totalBookings} bookings</div>
                        <div>${customer.totalSpent?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Selection */}
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Select Booking
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose a specific booking (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCustomer ? (
              <div className="text-center py-8 text-gray-500">
                Select a customer first
              </div>
            ) : customerBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bookings found for this customer
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {customerBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedBooking?.id === booking.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleBookingSelect(booking)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{booking.eventType}</div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.hallName || booking.selectedHall} • ${booking.calculatedPrice || '0.00'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Content */}
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Email Content
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose template or write custom content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template (Optional)</label>
              <Select
                value={emailData.templateId}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Email subject"
                value={emailData.customSubject}
                onChange={(e) => handleCustomInputChange('customSubject', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Email message body"
                value={emailData.customBody}
                onChange={(e) => handleCustomInputChange('customBody', e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <Button 
              onClick={handleSendEmail} 
              disabled={sending || !emailData.recipientEmail}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Email Preview */}
      {(emailData.customSubject || emailData.customBody) && (
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Email Preview
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Preview of the email that will be sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">To</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  {emailData.recipientName} &lt;{emailData.recipientEmail}&gt;
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Subject</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  {emailTemplateHelpers.processTemplate(emailData.customSubject, {
                    customerName: emailData.recipientName,
                    bookingDate: selectedBooking?.bookingDate || '{{bookingDate}}',
                    eventType: selectedBooking?.eventType || '{{eventType}}'
                  })}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Message</div>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {emailTemplateHelpers.processTemplate(emailData.customBody, {
                    customerName: emailData.recipientName,
                    bookingDate: selectedBooking?.bookingDate || '{{bookingDate}}',
                    eventType: selectedBooking?.eventType || '{{eventType}}',
                    startTime: selectedBooking?.startTime || '{{startTime}}',
                    endTime: selectedBooking?.endTime || '{{endTime}}',
                    hallName: selectedBooking?.hallName || selectedBooking?.selectedHall || '{{hallName}}',
                    calculatedPrice: selectedBooking?.calculatedPrice || '{{calculatedPrice}}'
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Email Send</h3>
                <p className="text-sm text-gray-500">Are you sure you want to send this email?</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <div className="text-sm font-medium text-gray-700">To</div>
                <div className="text-sm text-gray-600">{emailData.recipientName} &lt;{emailData.recipientEmail}&gt;</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Subject</div>
                <div className="text-sm text-gray-600">{emailData.customSubject || 'No subject'}</div>
              </div>
              {selectedBooking && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Related Booking</div>
                  <div className="text-sm text-gray-600">{selectedBooking.eventType} - {selectedBooking.bookingDate}</div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSendEmail}
                disabled={sending}
                className="flex-1"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  );
}
