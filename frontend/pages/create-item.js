import { useMintNFT } from "../hooks/useMintNFT";
import CreateItemForm from "../components/CreateItemForm";

export default function CreateItemPage() {
  const { createNFT, status } = useMintNFT();

  const handleCreate = async ({ file, price }) => {
    return await createNFT(file, price);
  };

  return <CreateItemForm onCreate={handleCreate} status={status} />;
}
