"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useCart } from "../context/CartContext";

type PixData = {
  id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  pix?: {
    code?: string;
    qrcode_base64?: string;
  };
};

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setCopied(false);

    if (cart.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    if (!name.trim()) {
      setError("Digite seu nome completo.");
      return;
    }

    if (!email.trim()) {
      setError("Digite seu e-mail.");
      return;
    }

    if (!whatsapp.trim()) {
      setError("Digite seu WhatsApp.");
      return;
    }

    if (cartTotal < 6) {
      setError(
        "O valor mínimo para pagamento via Pix é R$ 6,00."
      );
      return;
    }

    setLoading(true);

    try {
      const externalId =
        `pedido-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;

      const response = await fetch(
        "/api/pixou/charge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            external_id: externalId,

            amount: Math.round(
              cartTotal * 100
            ),

            buyer: {
              name: name.trim(),
              email: email.trim(),
              phone: whatsapp.replace(/\D/g, ""),
            },

            product: {
              name:
                cart.length === 1
                  ? cart[0].name
                  : `${cart.length} produtos AMR.STORE`,
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Não foi possível criar o pagamento."
        );
      }

      if (!result?.data?.pix?.code) {
        throw new Error(
          "A Pixou Pay não retornou o código Pix."
        );
      }

      setPix(result.data);
    } catch (err) {
      console.error(
        "Erro ao criar pagamento:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar pagamento."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!pix?.pix?.code) return;

    try {
      await navigator.clipboard.writeText(
        pix.pix.code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch {
      setError(
        "Não foi possível copiar automaticamente. Selecione o código manualmente."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <Link
            href="/"
            className="text-xl font-black"
          >
            AMR<span className="text-orange-500">.</span>STORE
          </Link>

          <span className="text-sm text-gray-400">
            Checkout seguro
          </span>

        </div>

      </header>

      {/* CONTEÚDO */}

      <section className="px-5 py-10 sm:py-16">

        <div className="mx-auto max-w-5xl">

          {/* TÍTULO */}

          <div className="mb-10">

            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
              Finalização
            </span>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Finalizar compra
            </h1>

            <p className="mt-3 text-gray-400">
              Preencha seus dados e gere seu pagamento Pix.
            </p>

          </div>

          {/* CARRINHO VAZIO */}

          {cart.length === 0 && !pix && (

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

              <div className="text-5xl">
                🛒
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Seu carrinho está vazio
              </h2>

              <p className="mt-3 text-gray-500">
                Adicione um produto antes de finalizar a compra.
              </p>

              <Link
                href="/"
                className="mt-7 inline-block rounded-xl bg-orange-500 px-7 py-4 font-black text-black transition hover:bg-orange-400"
              >
                VOLTAR PARA A LOJA
              </Link>

            </div>

          )}

          {/* PAGAMENTO GERADO */}

          {pix && (

            <div className="mx-auto max-w-lg">

              <div className="rounded-3xl border border-green-500/20 bg-white/[0.04] p-6 text-center sm:p-8">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl">
                  ✓
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  Pix gerado!
                </h2>

                <p className="mt-2 text-gray-400">
                  Escaneie o QR Code ou copie o código Pix.
                </p>

                {/* VALOR */}

                <div className="mt-6">

                  <p className="text-sm text-gray-500">
                    Valor da compra
                  </p>

                  <p className="mt-1 text-4xl font-black text-orange-500">
                    R${" "}
                    {(
                      pix.total_amount / 100
                    )
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>

                </div>

                {/* QR CODE */}

                {pix.pix?.qrcode_base64 && (

                  <div className="mx-auto mt-7 flex w-fit rounded-2xl bg-white p-4">

                    <img
                      src={`data:image/png;base64,${pix.pix.qrcode_base64}`}
                      alt="QR Code Pix"
                      className="h-64 w-64"
                    />

                  </div>

                )}

                {/* PIX COPIA E COLA */}

                <div className="mt-7 text-left">

                  <label className="mb-2 block text-sm font-bold">
                    Pix Copia e Cola
                  </label>

                  <textarea
                    readOnly
                    value={pix.pix?.code || ""}
                    className="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-5 text-gray-300 outline-none"
                  />

                </div>

                {/* COPIAR */}

                <button
                  onClick={copyPix}
                  className="mt-4 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400"
                >
                  {copied
                    ? "✓ PIX COPIADO"
                    : "COPIAR PIX"}
                </button>

                <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-left">

                  <p className="text-sm font-bold text-yellow-400">
                    Importante
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Após realizar o pagamento, aguarde a confirmação.
                    Não feche esta página imediatamente.
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* FORMULÁRIO */}

          {!pix && cart.length > 0 && (

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
              >

                <h2 className="text-2xl font-bold">
                  Seus dados
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Esses dados serão associados ao seu pedido.
                </p>

                {/* ERRO */}

                {error && (

                  <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                  </div>

                )}

                {/* NOME */}

                <div className="mt-7">

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold"
                  >
                    Nome completo
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Digite seu nome"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
                  />

                </div>

                {/* EMAIL */}

                <div className="mt-5">

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold"
                  >
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="seuemail@email.com"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
                  />

                </div>

                {/* WHATSAPP */}

                <div className="mt-5">

                  <label
                    htmlFor="whatsapp"
                    className="mb-2 block text-sm font-bold"
                  >
                    WhatsApp
                  </label>

                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(event) =>
                      setWhatsapp(event.target.value)
                    }
                    placeholder="(91) 99999-9999"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
                  />

                </div>

                {/* SEGURANÇA */}

                <div className="mt-7 rounded-2xl border border-green-500/20 bg-green-500/5 p-4">

                  <div className="flex gap-3">

                    <span className="text-xl">
                      🔒
                    </span>

                    <div>

                      <p className="font-bold text-green-400">
                        Pagamento seguro
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        O pagamento Pix será processado pela Pixou Pay.
                      </p>

                    </div>

                  </div>

                </div>

                {/* BOTÃO */}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "GERANDO PIX..."
                    : "GERAR PAGAMENTO PIX"}
                </button>

              </form>

              {/* RESUMO */}

              <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-6">

                <h2 className="text-xl font-bold">
                  Seu pedido
                </h2>

                <div className="mt-6 space-y-4">

                  {cart.map((product) => (

                    <div
                      key={product.id}
                      className="flex items-start justify-between gap-4"
                    >

                      <p className="min-w-0 font-medium leading-5">
                        {product.name}
                      </p>

                      <span className="whitespace-nowrap font-bold">
                        R${" "}
                        {product.price
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>

                    </div>

                  ))}

                </div>

                <div className="mt-6 border-t border-white/10 pt-5">

                  <div className="flex items-center justify-between">

                    <span className="text-gray-400">
                      Total
                    </span>

                    <span className="text-3xl font-black">
                      R${" "}
                      {cartTotal
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>

                  </div>

                </div>

                <Link
                  href="/carrinho"
                  className="mt-5 block text-center text-sm text-gray-500 transition hover:text-white"
                >
                  ← Voltar ao carrinho
                </Link>

              </aside>

            </div>

          )}

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-gray-500">
        © 2026 AMR.STORE — Todos os direitos reservados.
      </footer>

    </main>
  );
}
