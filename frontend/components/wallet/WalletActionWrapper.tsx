// frontend/components/wallet/WalletActionWrapper.tsx
"use client";
import { useState } from "react";
import AuthValidateModal from "./AuthValidateModal";

type Props = {
  children: (openModal: () => void) => JSX.Element;
  actionName?: string;
  methodOptions?: string[];
  onValidated: (validationResp: any) => Promise<void> | void;
};

export default function WalletActionWrapper({ children, actionName, methodOptions, onValidated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children(() => setOpen(true))}
      <AuthValidateModal
        open={open}
        onClose={() => setOpen(false)}
        actionName={actionName}
        methodOptions={methodOptions}
        onValidated={async (res) => {
          await onValidated(res);
        }}
      />
    </>
  );
}
