import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { emailCommsAPI } from "@/services/emailService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Mail, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Loader2,
  Eye
} from "lucide-react";
import ToastNotification from "@/components/ui/ToastNotification";

export default function CommsMessages() {
  const { token } = useAuth();
  
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const [form, setForm] = useState({ 
    to: "", 
    type: "email", 
    subject: "", 
    body: "" 
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

  // Load emails on component mount
  useEffect(() => {
    loadEmails();
  }, [statusFilter]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const response = await emailCommsAPI.getEmailHistory(token, params);
      setEmails(response.emails || []);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Error', 'Failed to load email history');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.to || !form.subject || !form.body) {
      showToast('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSend = async () => {
    try {
    setSending(true);
      setShowConfirmDialog(false);
      
      const emailData = {
        recipientEmail: form.to,
        recipientName: form.to.split('@')[0], // Simple name extraction
        customSubject: form.subject,
        customBody: form.body,
        isCustom: true
      };

      await emailCommsAPI.sendEmail(emailData, token);
      
      showToast('success', 'Success', 'Email sent successfully!');
      
      setForm({ to: "", type: "email", subject: "", body: "" });
      loadEmails(); // Refresh the list
    } catch (err) {
      showToast('error', 'Error', err.message);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
    <div>
        <h1 className="text-3xl font-bold text-gray-900">Email History</h1>
        <p className="text-gray-600 mt-2">
          View and manage your email communications with customers.
        </p>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Email History</TabsTrigger>
          <TabsTrigger value="send">Send Quick Email</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={loadEmails}>
                    <Filter className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading emails...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredEmails.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                <p className="text-gray-500">No emails match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <Card key={email.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{email.subject}</h3>
                          {getStatusBadge(email.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{email.recipientName || email.to}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{email.to}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(email.sentAt)}</span>
                          </div>
                        </div>
                        
                        {email.templateName && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Template: {email.templateName}
                            </Badge>
                          </div>
                        )}
                        
                        {email.bookingId && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Booking: {email.bookingId}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {email.body}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmail(email)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Quick Email</CardTitle>
              <CardDescription>
                Send a custom email without using a template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Recipient Email</label>
                    <Input
                      type="email"
            name="to"
                      placeholder="customer@example.com"
            value={form.to}
            onChange={handleChange}
            required
          />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
            value={form.type}
                      onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
            name="subject"
                    placeholder="Email subject"
            value={form.subject}
            onChange={handleChange}
            required
          />
        </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
          name="body"
                    placeholder="Your message here..."
          value={form.body}
          onChange={handleChange}
                    className="min-h-[120px]"
          required
        />
                </div>
                
                <Button type="submit" disabled={sending} className="w-full">
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
      </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Email Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Subject</div>
                <div className="p-3 bg-gray-50 rounded-md">{selectedEmail.subject}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">To</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  {selectedEmail.recipientName} &lt;{selectedEmail.to}&gt;
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  {getStatusBadge(selectedEmail.status)}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Sent At</div>
                <div className="p-3 bg-gray-50 rounded-md">{formatDate(selectedEmail.sentAt)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Message</div>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{selectedEmail.body}</div>
              </div>
            </div>
          </div>
      </div>
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
                <div className="text-sm text-gray-600">{form.to}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Subject</div>
                <div className="text-sm text-gray-600">{form.subject}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Type</div>
                <div className="text-sm text-gray-600 capitalize">{form.type}</div>
              </div>
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
                onClick={confirmSend}
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