import { useMintNFT } from "../hooks/useMintNFT";
import CreateItemForm from "../components/CreateItemForm";

export default function CreateItemPage() {
  const { createNFT, status } = useMintNFT();

  // FIXED: Destructure name and description here
  const handleCreate = async ({ name, description, price, file }) => {
    // Pass ALL data to the hook
    return await createNFT({ name, description, price, file });
  };

  return <CreateItemForm onCreate={handleCreate} status={status} />;
}