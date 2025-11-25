import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [account, setAccount] = useState("");

  // Lấy ví từ MetaMask
  async function loadWallet() {
    if (typeof window === "undefined" || !window.ethereum) return;

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts && accounts.length > 0) {
      setAccount(accounts[0]);
    }
  }

  // Lắng nghe thay đổi tài khoản
  useEffect(() => {
    loadWallet();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", function (accounts) {
        setAccount(accounts[0] || "");
      });
    }
  }, []);

  // Hàm rút gọn ví: 0xB51E...773d
  function shorten(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <div className="space-x-6 text-lg font-medium flex items-center">
        <Link href="/">Marketplace</Link>
        <Link href="/create-item">Create</Link>
        <Link href="/my-assets">My Assets</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/profile">Profile</Link>
      </div>

      <div>
        {account ? (
          <div className="px-4 py-2 bg-gray-100 rounded-lg border text-sm font-medium">
            Connected: <span className="text-pink-600">{shorten(account)}</span>
          </div>
        ) : (
          <button
            onClick={loadWallet}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
