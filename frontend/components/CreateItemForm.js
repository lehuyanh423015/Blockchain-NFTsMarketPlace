import { useState } from "react";

export default function CreateItemForm({ onCreate, status }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = () => {
    // FIXED: Pass name and description along with file and price
    onCreate({ name, description, price, file });
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-1/2 flex flex-col pb-12">
        <h1 className="text-3xl font-bold mb-8">Create & List NFT</h1>
        
        {/* --- NEW: Name Input --- */}
        <p className="mt-2 font-semibold">NFT Name</p>
        <input
          placeholder="e.g. Bored Ape #1"
          className="mt-2 border rounded p-4"
          onChange={(e) => setName(e.target.value)}
        />

        {/* --- NEW: Description Input --- */}
        <p className="mt-8 font-semibold">Description</p>
        <textarea
          placeholder="Description of your NFT..."
          className="mt-2 border rounded p-4"
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* --- Existing: Price Input --- */}
        <p className="mt-8 font-semibold">Price (ETH)</p>
        <input
          placeholder="e.g. 0.01"
          className="mt-2 border rounded p-4"
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* --- Existing: File Input --- */}
        <p className="mt-8 font-semibold">Asset Image</p>
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* --- Create Button --- */}
        <button
          onClick={handleSubmit}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          {status ? status : "Create NFT"}
        </button>
      </div>
    </div>
  );
}