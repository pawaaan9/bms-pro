import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { emailTemplatesAPI, emailTemplateHelpers } from "@/services/emailService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Save, X, AlertCircle, CheckCircle, Copy, Mail } from "lucide-react";
import ToastNotification from "@/components/ui/ToastNotification";

export default function CommsTemplates() {
  const { token } = useAuth();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const [newTemplate, setNewTemplate] = useState({ 
    name: "", 
    type: "email", 
    subject: "", 
    body: "", 
    variables: [] 
  });
  
  const [editTemplate, setEditTemplate] = useState({ 
    name: "", 
    type: "email", 
    subject: "", 
    body: "", 
    variables: [] 
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

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailTemplatesAPI.getTemplates(token);
      setTemplates(response.templates || []);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Error', 'Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTemplate((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      const errors = emailTemplateHelpers.validateTemplate(newTemplate);
      if (errors.length > 0) {
        showToast('error', 'Validation Error', errors.join(", "));
        return;
      }

      // Extract variables from template
      const variables = emailTemplateHelpers.extractVariables(newTemplate.subject + " " + newTemplate.body);
      
      const templateData = {
        ...newTemplate,
        variables
      };

      await emailTemplatesAPI.createTemplate(templateData, token);
      
      showToast('success', 'Success', 'Email template created successfully');
      
      setIsCreateDialogOpen(false);
      setNewTemplate({ name: "", type: "email", subject: "", body: "", variables: [] });
      loadTemplates();
    } catch (err) {
      showToast('error', 'Error', err.message);
    }
  };

  const handleEdit = async () => {
    try {
      const errors = emailTemplateHelpers.validateTemplate(editTemplate);
      if (errors.length > 0) {
        showToast('error', 'Validation Error', errors.join(", "));
        return;
      }

      // Extract variables from template
      const variables = emailTemplateHelpers.extractVariables(editTemplate.subject + " " + editTemplate.body);
      
      const templateData = {
        ...editTemplate,
        variables
      };

      await emailTemplatesAPI.updateTemplate(editingTemplate.id, templateData, token);
      
      showToast('success', 'Success', 'Email template updated successfully');
      
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (err) {
      showToast('error', 'Error', err.message);
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      await emailTemplatesAPI.deleteTemplate(templateId, token);
      
      showToast('success', 'Success', 'Email template deleted successfully');
      
      loadTemplates();
    } catch (err) {
      showToast('error', 'Error', err.message);
    }
  };

  const handleEditClick = (template) => {
    setEditingTemplate(template);
    setEditTemplate({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      variables: template.variables || []
    });
    setIsEditDialogOpen(true);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const insertVariable = (variable, isEdit = false) => {
    const template = isEdit ? editTemplate : newTemplate;
    const setTemplate = isEdit ? setEditTemplate : setNewTemplate;
    const field = isEdit ? 'body' : 'body';
    
    const currentValue = template[field];
    const newValue = currentValue + `{{${variable}}}`;
    setTemplate(prev => ({ ...prev, [field]: newValue }));
  };

  const availableVariables = emailTemplateHelpers.getAvailableVariables();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-100">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg sm:rounded-xl shadow-lg w-fit">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Email Templates
              </h1>
              <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base mt-1">
                Create and manage reusable email templates with personalization variables.
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </header>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-800">Create Email Template</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Create a new email template with personalization variables.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      name="name"
                      placeholder="e.g., Booking Confirmation"
                      value={newTemplate.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newTemplate.type}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value }))}
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
                    placeholder="e.g., Your booking is confirmed"
                    value={newTemplate.subject}
                    onChange={handleInputChange}
                  />
                </div>
              </TabsContent>
              <TabsContent value="content" className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Message Body</label>
                    <div className="text-xs text-gray-500">
                      Use variables like {"{{customerName}}"} for personalization
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <Textarea
                        name="body"
                        placeholder="Dear {{customerName}}, your booking is confirmed for {{bookingDate}}..."
                        value={newTemplate.body}
                        onChange={handleInputChange}
                        className="min-h-[200px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Available Variables</div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {availableVariables.map((variable) => (
                          <Button
                            key={variable.key}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => insertVariable(variable.key)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            {variable.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                <Save className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {templates.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-600 mb-4">Create your first email template to get started.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant={template.type === 'email' ? 'default' : 'secondary'}>
                        {template.type.toUpperCase()}
                      </Badge>
                      {template.isActive ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Inactive
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Subject</div>
                    <div className="text-sm text-gray-600 truncate">{template.subject}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Body Preview</div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {template.body.substring(0, 100)}...
                    </div>
                  </div>
                  {template.variables && template.variables.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Variables</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Update the email template with personalization variables.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    name="name"
                    value={editTemplate.name}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={editTemplate.type}
                    onValueChange={(value) => setEditTemplate(prev => ({ ...prev, type: value }))}
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
                  value={editTemplate.subject}
                  onChange={handleEditInputChange}
                />
              </div>
            </TabsContent>
            <TabsContent value="content" className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Message Body</label>
                  <div className="text-xs text-gray-500">
                    Use variables like {"{{customerName}}"} for personalization
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <Textarea
                      name="body"
                      value={editTemplate.body}
                      onChange={handleEditInputChange}
                      className="min-h-[200px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Available Variables</div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {availableVariables.map((variable) => (
                        <Button
                          key={variable.key}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => insertVariable(variable.key, true)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {variable.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Save className="w-4 h-4 mr-2" />
              Update Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of the email template with sample data.
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Subject</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  {emailTemplateHelpers.processTemplate(previewTemplate.subject, {
                    customerName: "John Doe",
                    bookingDate: "2024-01-15",
                    eventType: "Wedding Reception"
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Body</div>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {emailTemplateHelpers.processTemplate(previewTemplate.body, {
                    customerName: "John Doe",
                    bookingDate: "2024-01-15",
                    eventType: "Wedding Reception",
                    startTime: "6:00 PM",
                    endTime: "11:00 PM",
                    hallName: "Main Hall",
                    calculatedPrice: "$500.00"
                  })}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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