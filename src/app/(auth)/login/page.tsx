import type { Metadata } from "next";
import { HomeShell } from "@/components/home/home-shell";
import { Footer } from "@/components/home/footer";
import { Login } from "@/components/auth/login";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the USAR FOSS Club with your GitHub account to see your dashboard and the club leaderboard.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <HomeShell>
      <main>
        <Login />
      </main>
      <Footer />
    </HomeShell>
  );
}
