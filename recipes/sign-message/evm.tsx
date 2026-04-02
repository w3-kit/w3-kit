"use client";

import { useSignMessage, useAccount } from "wagmi";
import { useState } from "react";

export function SignMessage() {
  const { address } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState("Hello from w3-kit!");

  const handleSign = async () => {
    const sig = await signMessageAsync({ message });
    setSignature(sig);
  };

  return (
    <div>
      <h2>Sign Message</h2>
      <p>Connected: {address}</p>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a message to sign"
      />
      <button onClick={handleSign} disabled={isPending}>
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
