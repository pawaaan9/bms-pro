import React, { useState } from "react";

const initialRates = [
  { hall: "Hall A", weekday: 100, weekend: 150 },
  { hall: "Hall B", weekday: 80, weekend: 120 },
  { hall: "Main Hall", weekday: 200, weekend: 300 },
];

export default function PricingRatecards() {
  const [rates, setRates] = useState(initialRates);
  const [saving, setSaving] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = rates.map((rate, i) =>
      i === index ? { ...rate, [field]: value } : rate
    );
    setRates(updated);
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => setSaving(false), 1000);
    // Here you would send rates to backend
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Hall Price Rates</h1>
      <p className="mb-4 text-gray-600">Set and update the price rates for each hall. Changes are saved for all bookings going forward.</p>
  <table className="w-full mb-4 border rounded-lg bg-white overflow-hidden ">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 text-left">Hall</th>
            <th className="py-2 px-3 text-left">Weekday Rate ($)</th>
            <th className="py-2 px-3 text-left">Weekend Rate ($)</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate, idx) => (
            <tr key={rate.hall}>
              <td className="py-2 px-3 font-medium">{rate.hall}</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24"
                  value={rate.weekday}
                  min={0}
                  onChange={e => handleChange(idx, "weekday", Number(e.target.value))}
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24"
                  value={rate.weekend}
                  min={0}
                  onChange={e => handleChange(idx, "weekend", Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Rates"}
      </button>
    </div>
  );
}