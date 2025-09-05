import React, { useState } from "react";

const initialAddons = [
  { name: "Projector", price: 50, description: "HD projector for presentations." },
  { name: "Sound System", price: 80, description: "Professional audio setup." },
  { name: "Cleaning Service", price: 30, description: "Post-event cleaning." },
];

export default function PricingAddons() {
  const [addons, setAddons] = useState(initialAddons);
  const [newAddon, setNewAddon] = useState({ name: "", price: "", description: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editAddon, setEditAddon] = useState({ name: "", price: "", description: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddon((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!newAddon.name || !newAddon.price) return;
    setAddons([...addons, { ...newAddon, price: Number(newAddon.price) }]);
    setNewAddon({ name: "", price: "", description: "" });
  };

  const handleDelete = (idx) => {
    setAddons(addons.filter((_, i) => i !== idx));
  };

  const handleEditClick = (idx) => {
    setEditingIndex(idx);
    setEditAddon(addons[idx]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditAddon((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    setAddons(addons.map((a, i) => (i === editingIndex ? { ...editAddon, price: Number(editAddon.price) } : a)));
    setEditingIndex(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add-ons</h1>
      <p className="mb-4 text-gray-600">Manage additional items and services such as equipment and cleaning. Add, edit, or remove add-ons below.</p>

      <div className="mb-6 flex flex-col md:flex-row gap-2 items-end">
        <input
          type="text"
          name="name"
          placeholder="Add-on Name"
          className="border rounded px-2 py-1 w-full md:w-48"
          value={newAddon.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price ($)"
          className="border rounded px-2 py-1 w-full md:w-32"
          value={newAddon.price}
          min={0}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          className="border rounded px-2 py-1 w-full md:w-64"
          value={newAddon.description}
          onChange={handleInputChange}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleAdd}
          disabled={!newAddon.name || !newAddon.price}
        >
          Add
        </button>
      </div>

      <table className="w-full mb-4 border rounded-lg bg-white overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 text-left">Name</th>
            <th className="py-2 px-3 text-left">Price ($)</th>
            <th className="py-2 px-3 text-left">Description</th>
            <th className="py-2 px-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {addons.map((addon, idx) => (
            <tr key={idx}>
              {editingIndex === idx ? (
                <>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      name="name"
                      className="border rounded px-2 py-1 w-full"
                      value={editAddon.name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      name="price"
                      className="border rounded px-2 py-1 w-24"
                      value={editAddon.price}
                      min={0}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      name="description"
                      className="border rounded px-2 py-1 w-full"
                      value={editAddon.description}
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
                  <td className="py-2 px-3 font-medium">{addon.name}</td>
                  <td className="py-2 px-3">${addon.price}</td>
                  <td className="py-2 px-3">{addon.description}</td>
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