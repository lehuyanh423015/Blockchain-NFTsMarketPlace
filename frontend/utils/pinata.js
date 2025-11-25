// utils/pinata.js
import axios from "axios";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

// Upload raw file (image)
export async function uploadFileToPinata(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    }
  );

  return `ipfs://${res.data.IpfsHash}`;
}

// Upload metadata JSON
export async function uploadMetadataToPinata(metadata) {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    }
  );

  return `ipfs://${res.data.IpfsHash}`;
}
