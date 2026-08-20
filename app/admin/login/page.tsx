"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export const dynamic = "force-dynamic";

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const cleanEmail = email.trim();

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    console.log("LOGIN RESULT:", {
      user: data.user?.email,
      error: loginError?.message,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login realizado, mas o usuário não foi encontrado.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black">
            AMR<span className="text-orange-500">.</span>STORE
          </h1>

          <p className="mt-3 text-gray-400">
            Painel administrativo
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl"
        >

          <h2 className="text-2xl font-bold">
            Entrar
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Acesse o painel para administrar seus produtos.
          </p>

          <div className="mt-6">

            <label className="mb-2 block text-sm font-medium">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500"
            />

          </div>

          <div className="mt-4">

            <label className="mb-2 block text-sm font-medium">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-orange-500"
            />

          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-4 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "ENTRAR NO PAINEL"}
          </button>

        </form>

      </div>
    </main>
  );
}
