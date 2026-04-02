"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export function SignMessage() {
  const { publicKey, signMessage: walletSignMessage } = useWallet();
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState("Hello from w3-kit!");
  const [isPending, setIsPending] = useState(false);

  const handleSign = async () => {
    if (!walletSignMessage) return;
    setIsPending(true);
    try {
      // ★ Solana signs arbitrary bytes, so we encode the string as UTF-8
      const encoded = new TextEncoder().encode(message);
      const sig = await walletSignMessage(encoded);
      setSignature(Buffer.from(sig).toString("hex"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h2>Sign Message</h2>
      <p>Connected: {publicKey?.toBase58()}</p>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a message to sign"
      />
      <button onClick={handleSign} disabled={isPending || !walletSignMessage}>
        {isPending ? "Signing..." : "Sign Message"}
      </button>
      {signature && (
        <div>
          <p><strong>Signature:</strong></p>
          <code style={{ wordBreak: "break-all" }}>{signature}</code>
        </div>
      )}
    </div>
  );
}
