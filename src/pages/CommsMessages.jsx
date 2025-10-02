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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-green-100">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-teal-600/5"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg w-fit">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Email History
            </h1>
            <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base mt-1">
              View and manage your email communications with customers.
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Email History</TabsTrigger>
          <TabsTrigger value="send">Send Quick Email</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4 sm:space-y-6">
          {/* Filters */}
          <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
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
            <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <Mail className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No emails found</h3>
                <p className="text-gray-600">No emails match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <Card key={email.id} className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
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
        
        <TabsContent value="send" className="space-y-4 sm:space-y-6">
          <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Send className="w-4 h-4 text-white" />
                </div>
                Send Quick Email
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
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
                
                <Button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 border-b border-green-100 flex-shrink-0" style={{backdropFilter: 'none', filter: 'none'}}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600" style={{filter: 'none'}}>Email Details</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedEmail(null)}
                  className="hover:bg-white/50"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Subject</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <p className="text-gray-900 font-medium">{selectedEmail.subject}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">To</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-gray-900">{selectedEmail.recipientName} <span className="text-gray-600">&lt;{selectedEmail.to}&gt;</span></p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Status</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  {getStatusBadge(selectedEmail.status)}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-700">Sent At</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                  <p className="text-gray-900">{formatDate(selectedEmail.sentAt)}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-semibold text-gray-700">Message</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-100 max-h-64 overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedEmail.body}</p>
                </div>
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