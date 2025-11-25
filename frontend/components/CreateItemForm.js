// components/CreateItemForm.js
import { useState } from "react";

export default function CreateItemForm({ onCreate, status }) {
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onCreate({ file, price });
    if (ok) {
      setFile(null);
      setPrice("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create & List NFT</h1>

      <div>
        <label className="block font-medium mb-1">Asset file</label>
        <input
          type="file"
          className="border border-gray-300 rounded-lg p-2 w-full bg-white"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Price (ETH)</label>
        <input
          className="border border-gray-300 rounded-lg p-2 w-full"
          placeholder="0.1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
      >
        Create NFT
      </button>

      {status && (
        <div className="p-3 border rounded-lg text-sm bg-gray-100">
          {status}
        </div>
      )}
    </form>
  );
}
