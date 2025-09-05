import React, { useState } from "react";

const initialTemplates = [
  { name: "Booking Confirmation", type: "Email", subject: "Your booking is confirmed", body: "Dear {{name}}, your booking is confirmed for {{date}}." },
  { name: "Payment Reminder", type: "SMS", subject: "", body: "Reminder: Your payment is due for booking {{bookingId}}." },
];

export default function CommsTemplates() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [newTemplate, setNewTemplate] = useState({ name: "", type: "Email", subject: "", body: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTemplate, setEditTemplate] = useState({ name: "", type: "Email", subject: "", body: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!newTemplate.name || !newTemplate.body) return;
    setTemplates([...templates, newTemplate]);
    setNewTemplate({ name: "", type: "Email", subject: "", body: "" });
  };

  const handleDelete = (idx) => {
    setTemplates(templates.filter((_, i) => i !== idx));
  };

  const handleEditClick = (idx) => {
    setEditingIndex(idx);
    setEditTemplate(templates[idx]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTemplate((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    setTemplates(templates.map((t, i) => (i === editingIndex ? editTemplate : t)));
    setEditingIndex(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates</h1>
      <p className="mb-4 text-gray-600">Manage email and SMS templates for automated communications. Add, edit, or remove templates below.</p>

      <div className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <input
          type="text"
          name="name"
          placeholder="Template Name"
          className="border rounded px-2 py-1 w-full md:w-48"
          value={newTemplate.name}
          onChange={handleInputChange}
        />
        <select
          name="type"
          className="border rounded px-2 py-1 w-full md:w-32"
          value={newTemplate.type}
          onChange={handleInputChange}
        >
          <option value="Email">Email</option>
          <option value="SMS">SMS</option>
        </select>
        {newTemplate.type === "Email" && (
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            className="border rounded px-2 py-1 w-full md:w-48"
            value={newTemplate.subject}
            onChange={handleInputChange}
          />
        )}
        <input
          type="text"
          name="body"
          placeholder="Body (use {{placeholders}})"
          className="border rounded px-2 py-1 w-full md:w-64"
          value={newTemplate.body}
          onChange={handleInputChange}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleAdd}
          disabled={!newTemplate.name || !newTemplate.body}
        >
          Add
        </button>
      </div>

      <table className="w-full mb-4 border rounded-lg bg-white overflow-hidden text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 text-left">Name</th>
            <th className="py-2 px-3 text-left">Type</th>
            <th className="py-2 px-3 text-left">Subject</th>
            <th className="py-2 px-3 text-left">Body</th>
            <th className="py-2 px-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template, idx) => (
            <tr key={idx}>
              {editingIndex === idx ? (
                <>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      name="name"
                      className="border rounded px-2 py-1 w-full"
                      value={editTemplate.name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      name="type"
                      className="border rounded px-2 py-1 w-full"
                      value={editTemplate.type}
                      onChange={handleEditChange}
                    >
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    {editTemplate.type === "Email" ? (
                      <input
                        type="text"
                        name="subject"
                        className="border rounded px-2 py-1 w-full"
                        value={editTemplate.subject}
                        onChange={handleEditChange}
                      />
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      name="body"
                      className="border rounded px-2 py-1 w-full"
                      value={editTemplate.body}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td className="py-2 px-3 flex gap-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={handleEditSave}>Save</button>
                    <button className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400" onClick={() => setEditingIndex(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-3 font-medium">{template.name}</td>
                  <td className="py-2 px-3">{template.type}</td>
                  <td className="py-2 px-3">{template.type === "Email" ? template.subject : <span className="text-gray-400">N/A</span>}</td>
                  <td className="py-2 px-3">{template.body}</td>
                  <td className="py-2 px-3 flex gap-2">
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" onClick={() => handleEditClick(idx)}>Edit</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onClick={() => handleDelete(idx)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}