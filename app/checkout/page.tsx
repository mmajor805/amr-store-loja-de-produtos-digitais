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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setCopied(false);

    if (cart.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    if (name.trim().length < 3) {
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
            payment_method: "pix",

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
            result?.detail ||
            "Não foi possível criar o pagamento."
        );
      }

      if (!result?.data) {
        throw new Error(
          "A Pixou Pay não retornou os dados da cobrança."
        );
      }

      if (!result.data.pix?.code) {
        throw new Error(
          "A Pixou Pay não retornou o código Pix."
        );
      }

      setPix(result.data);
    } catch (err) {
      console.error(
        "Erro ao criar pagamento Pix:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar pagamento Pix."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    const code = pix?.pix?.code;

    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch {
      setError(
        "Não foi possível copiar automaticamente o código Pix."
      );
    }
  }

  /*
   * PREPARA O QR CODE
   *
   * A Pixou pode retornar:
   * 1. Base64 puro
   * 2. Data URI
   * 3. URL
   *
   * Esta função trata os três formatos.
   */
  function getQrCodeSource(
    value?: string
  ): string | null {
    if (!value) {
      return null;
    }

    const cleanValue = value.trim();

    if (!cleanValue) {
      return null;
    }

    // Se já for uma URL ou Data URI
    if (
      cleanValue.startsWith("data:image/") ||
      cleanValue.startsWith("http://") ||
      cleanValue.startsWith("https://")
    ) {
      return cleanValue;
    }

    // Remove espaços e quebras de linha do Base64
    const base64 = cleanValue.replace(/\s/g, "");

    // Detecta SVG em Base64
    if (
      base64.startsWith("PHN2Zy") ||
      base64.startsWith("PD94bWwg")
    ) {
      return `data:image/svg+xml;base64,${base64}`;
    }

    // Por padrão, trata como PNG Base64
    return `data:image/png;base64,${base64}`;
  }

  const qrCodeSource = getQrCodeSource(
    pix?.pix?.qrcode_base64
  );

  if (cart.length === 0 && !pix) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">

        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

            <Link
              href="/"
              className="text-xl font-black"
            >
              AMR<span className="text-orange-500">.</span>STORE
            </Link>

            <Link
              href="/"
              className="text-sm text-gray-400 transition hover:text-white"
            >
              ← Voltar para a loja
            </Link>

          </div>
        </header>

        <section className="px-5 py-16">

          <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">

            <div className="text-5xl">
              🛒
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Seu carrinho está vazio
            </h1>

            <p className="mt-3 text-gray-500">
              Adicione um produto antes de finalizar sua compra.
            </p>

            <Link
              href="/"
              className="mt-7 inline-block rounded-xl bg-orange-500 px-7 py-4 font-black text-black transition hover:bg-orange-400"
            >
              VOLTAR PARA A LOJA
            </Link>

          </div>

        </section>

      </main>
    );
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

          {/* PIX GERADO */}

          {pix ? (

            <div className="mx-auto max-w-lg">

              <div className="rounded-3xl border border-green-500/20 bg-white/[0.04] p-6 text-center sm:p-8">

                {/* ÍCONE DE SUCESSO */}

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl text-green-400">
                  ✓
                </div>

                <h1 className="mt-5 text-3xl font-black">
                  Pix gerado!
                </h1>

                <p className="mt-3 text-gray-400">
                  Faça o pagamento usando o QR Code abaixo.
                </p>

                {/* VALOR */}

                <div className="mt-6">

                  <p className="text-sm text-gray-500">
                    Valor
                  </p>

                  <p className="mt-1 text-4xl font-black text-orange-500">
                    R${" "}
                    {(pix.total_amount / 100)
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>

                </div>

                {/* QR CODE */}

                {qrCodeSource ? (

                  <div className="mx-auto mt-7 flex w-fit items-center justify-center rounded-2xl bg-white p-5">

                    <img
                      src={qrCodeSource}
                      alt="QR Code para pagamento Pix"
                      className="h-64 w-64 object-contain"
                      onError={(event) => {
                        console.error(
                          "Não foi possível carregar o QR Code Pix."
                        );

                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                ) : (

                  <div className="mx-auto mt-7 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                    <p className="text-sm text-yellow-400">
                      O QR Code não foi disponibilizado pela
                      operadora. Utilize o Pix Copia e Cola abaixo.
                    </p>

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
                    className="h-32 w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-5 text-gray-300 outline-none focus:border-orange-500"
                  />

                </div>

                {/* BOTÃO COPIAR */}

                <button
                  type="button"
                  onClick={copyPix}
                  className="mt-4 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400"
                >
                  {copied
                    ? "✓ PIX COPIADO"
                    : "COPIAR PIX"}
                </button>

                {/* AVISO */}

                <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-left">

                  <p className="font-bold text-yellow-400">
                    Aguarde a confirmação
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Após realizar o pagamento, aguarde a
                    confirmação da transação.
                  </p>

                </div>

              </div>

            </div>

          ) : (

            <>
              {/* TÍTULO */}

              <div className="mb-10">

                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
                  Finalização
                </span>

                <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                  Finalizar compra
                </h1>

                <p className="mt-3 text-gray-400">
                  Preencha seus dados para gerar seu pagamento Pix.
                </p>

              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                {/* FORMULÁRIO */}

                <form
                  onSubmit={handleSubmit}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                >

                  <h2 className="text-2xl font-bold">
                    Seus dados
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Usaremos esses dados para identificar sua
                    compra e processar o pedido.
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
                      placeholder="Digite seu nome completo"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
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
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
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
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
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
                          Seus dados estão seguros
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Seus dados serão utilizados somente
                          para processar seu pedido.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* BOTÃO PAGAR */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "GERANDO PIX..."
                      : "PAGAR AGORA"}
                  </button>

                </form>

                {/* RESUMO */}

                <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-6">

                  <h2 className="text-xl font-bold">
                    Resumo da compra
                  </h2>

                  <div className="mt-6 space-y-4">

                    {cart.map((product) => (

                      <div
                        key={product.id}
                        className="flex justify-between gap-4"
                      >

                        <span className="text-sm leading-5 text-gray-300">
                          {product.name}
                        </span>

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

            </>

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
