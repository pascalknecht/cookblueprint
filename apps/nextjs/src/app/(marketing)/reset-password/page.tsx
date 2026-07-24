import React, { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function Page() {
  return (
    <div className="px-4 py-12">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
