"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="card p-8 w-full max-w-md flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-foreground">Choose setup method</h1>
        <div className="flex flex-col gap-4 w-full">
          <button
            className="btn-primary w-full py-3 rounded-lg text-base font-medium"
            onClick={() => router?.push("/onboarding/ai")}
          >
            Build with AI
          </button>
          <button
            className="btn-secondary w-full py-3 rounded-lg text-base font-medium"
            onClick={() => router?.push("/app")}
          >
            Build Manually
          </button>
        </div>
      </div>
    </div>
  );
}
