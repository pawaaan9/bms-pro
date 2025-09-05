import React, { useState } from "react";

const initialMessages = [
  { id: 1, to: "Jane Smith", type: "Email", subject: "Booking Confirmation", body: "Your booking is confirmed.", date: "2025-09-01 10:15" },
  { id: 2, to: "John Doe", type: "SMS", subject: "Payment Reminder", body: "Your payment is due tomorrow.", date: "2025-09-02 09:00" },
];

export default function CommsMessages() {
  const [messages, setMessages] = useState(initialMessages);
  const [form, setForm] = useState({ to: "", type: "Email", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.to || !form.subject || !form.body) return;
    setSending(true);
    setTimeout(() => {
      setMessages([
        { id: Date.now(), ...form, date: new Date().toISOString().slice(0, 16).replace('T', ' ') },
        ...messages,
      ]);
      setForm({ to: "", type: "Email", subject: "", body: "" });
      setSending(false);
    }, 800);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
      <p className="mb-4 text-gray-600">Send and view email/SMS communications with customers.</p>

      <form className="mb-6 bg-white p-4 rounded-lg shadow flex flex-col gap-2 max-w-2xl" onSubmit={handleSend}>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            name="to"
            placeholder="Recipient Name"
            className="border rounded px-2 py-1 w-full md:w-1/3"
            value={form.to}
            onChange={handleChange}
            required
          />
          <select
            name="type"
            className="border rounded px-2 py-1 w-full md:w-32"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
          </select>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            className="border rounded px-2 py-1 w-full md:w-1/3"
            value={form.subject}
            onChange={handleChange}
            required
          />
        </div>
        <textarea
          name="body"
          placeholder="Message body"
          className="border rounded px-2 py-1 w-full min-h-[60px]"
          value={form.body}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 self-end"
          disabled={sending || !form.to || !form.subject || !form.body}
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
      </form>

      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-2">Message History</h2>
        <table className="w-full border rounded-lg bg-white overflow-hidden text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left">To</th>
              <th className="py-2 px-3 text-left">Type</th>
              <th className="py-2 px-3 text-left">Subject</th>
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Body</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td className="py-2 px-3 font-medium">{msg.to}</td>
                <td className="py-2 px-3">{msg.type}</td>
                <td className="py-2 px-3">{msg.subject}</td>
                <td className="py-2 px-3 whitespace-nowrap">{msg.date}</td>
                <td className="py-2 px-3">{msg.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}