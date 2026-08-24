"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  image_url: string | null;
  purchase_url: string | null;
  category: string | null;
  active: boolean;
};

type PaymentResult = {
  transactionId: string | null;
  qrCode: string | null;
  pixCode: string | null;
  paymentUrl: string | null;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCheckout, setShowCheckout] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [payment, setPayment] = useState<PaymentResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const supabase = createClient();

        const id = Number(params.id);

        if (!id) {
          setProduct(null);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, description, price, old_price, image_url, purchase_url, category, active"
          )
          .eq("id", id)
          .eq("active", true)
          .maybeSingle();

        if (error) {
          console.error("Erro ao carregar produto:", error);
          setProduct(null);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error("Erro inesperado:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  function handleStartCheckout() {
    setPaymentError("");
    setPayment(null);
    setShowCheckout(true);
  }

  function extractPaymentData(result: any): PaymentResult {
    const data = result?.data || result?.transaction || result;

    const transactionId =
      data?.id ||
      data?.transaction_id ||
      result?.transaction_id ||
      result?.id ||
      null;

    const qrCode =
      data?.qr_code ||
      data?.qrCode ||
      data?.pix_qr_code ||
      data?.pixQrCode ||
      data?.qrcode ||
      data?.qr ||
      result?.qr_code ||
      result?.qrCode ||
      null;

    const pixCode =
      data?.pix_code ||
      data?.pixCode ||
      data?.copy_paste ||
      data?.copyPaste ||
      data?.copy_and_paste ||
      data?.pix_copy_paste ||
      data?.brcode ||
      data?.emv ||
      result?.pix_code ||
      result?.pixCode ||
      result?.copy_paste ||
      result?.brcode ||
      null;

    const paymentUrl =
      data?.payment_url ||
      data?.paymentUrl ||
      data?.checkout_url ||
      data?.checkoutUrl ||
      data?.url ||
      result?.payment_url ||
      result?.paymentUrl ||
      result?.checkout_url ||
      result?.checkoutUrl ||
      null;

    return {
      transactionId: transactionId ? String(transactionId) : null,
      qrCode: qrCode ? String(qrCode) : null,
      pixCode: pixCode ? String(pixCode) : null,
      paymentUrl: paymentUrl ? String(paymentUrl) : null,
    };
  }

  async function handleCreatePayment() {
    if (!product) return;

    setPaymentError("");
    setCopied(false);

    if (!buyerName.trim()) {
      setPaymentError("Digite seu nome.");
      return;
    }

    if (!buyerEmail.trim()) {
      setPaymentError("Digite seu e-mail.");
      return;
    }

    if (!buyerEmail.includes("@")) {
      setPaymentError("Digite um e-mail válido.");
      return;
    }

    const price = Number(product.price ?? 0);

    if (!price || price <= 0) {
      setPaymentError("Este produto não possui um preço válido.");
      return;
    }

    /*
     * O Supabase guarda o preço como:
     * 14.90
     * 29.90
     * 49.90
     *
     * A API da Pixou recebe o valor em centavos:
     * 1490
     * 2990
     * 4990
     */
    const amount = Math.round(price * 100);

    if (amount < 600) {
      setPaymentError(
        "O valor mínimo para pagamento via Pix é R$ 6,00."
      );
      return;
    }

    if (amount > 300000) {
      setPaymentError(
        "O valor máximo para pagamento via Pix é R$ 3.000,00."
      );
      return;
    }

    setCreatingPayment(true);

    try {
      const externalId = `AMR-${product.id}-${Date.now()}`;

      const response = await fetch("/api/pixou/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_id: externalId,
          amount,
          buyer: {
            name: buyerName.trim(),
            email: buyerEmail.trim(),
            phone: buyerPhone
              ? buyerPhone.replace(/\D/g, "")
              : undefined,
          },
          product: {
            name: product.name,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro ao criar pagamento:", result);

        setPaymentError(
          result?.error ||
            "Não foi possível criar o pagamento. Tente novamente."
        );

        return;
      }

      console.log("Resposta da Pixou Pay:", result);

      const paymentData = extractPaymentData(result);

      setPayment(paymentData);
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);

      setPaymentError(
        "Não foi possível conectar ao sistema de pagamento. Tente novamente."
      );
    } finally {
      setCreatingPayment(false);
    }
  }

  async function handleCopyPix() {
    if (!payment?.pixCode) return;

    try {
      await navigator.clipboard.writeText(payment.pixCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error("Erro ao copiar PIX:", error);
      setPaymentError(
        "Não foi possível copiar automaticamente. Selecione o código manualmente."
      );
    }
  }

  function handleCloseCheckout() {
    if (creatingPayment) return;

    setShowCheckout(false);
    setPaymentError("");
    setPayment(null);
    setCopied(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <p className="text-gray-400">Carregando produto...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <div className="text-5xl">📦</div>

          <h1 className="mt-5 text-2xl font-black">
            Produto não encontrado
          </h1>

          <p className="mt-3 text-gray-400">
            Esse produto pode ter sido removido ou desativado.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400"
          >
            VOLTAR PARA A LOJA
          </button>
        </div>
      </main>
    );
  }

  const price = Number(product.price ?? 0);

  const oldPrice =
    product.old_price !== null
      ? Number(product.old_price)
      : null;

  const discount =
    oldPrice !== null && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* HEADER */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-black"
          >
            AMR<span className="text-orange-500">.</span>STORE
          </button>

          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Voltar para a loja
          </button>
        </div>
      </header>

      {/* PRODUTO */}

      <section className="px-5 py-10 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          {/* IMAGEM */}

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-orange-500/30 via-orange-600/10 to-black">
                <div className="text-center">
                  <div className="text-7xl font-black">
                    AMR
                  </div>

                  <div className="mt-3 text-sm uppercase tracking-[0.3em] text-orange-400">
                    {product.category || "Produto Digital"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INFORMAÇÕES */}

          <div>
            {/* CATEGORIA */}

            <span className="inline-block rounded-full bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-400">
              {product.category || "Produto Digital"}
            </span>

            {/* NOME */}

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              {product.name}
            </h1>

            {/* DESCRIÇÃO */}

            {product.description && (
              <p className="mt-6 whitespace-pre-line text-base leading-7 text-gray-400 sm:text-lg">
                {product.description}
              </p>
            )}

            {/* PREÇO */}

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              {oldPrice !== null && oldPrice > price && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg text-gray-500 line-through">
                    R$ {oldPrice.toFixed(2).replace(".", ",")}
                  </span>

                  {discount !== null && (
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}

              <div className="mt-1 text-4xl font-black">
                R$ {price.toFixed(2).replace(".", ",")}
              </div>
            </div>

            {/* COMPRA */}

            {!showCheckout && !payment && (
              <button
                onClick={handleStartCheckout}
                className="mt-6 block w-full rounded-2xl bg-orange-500 px-6 py-5 text-center text-lg font-black text-black shadow-lg shadow-orange-500/10 transition hover:bg-orange-400 hover:shadow-orange-500/20"
              >
                COMPRAR AGORA
              </button>
            )}

            {/* CHECKOUT */}

            {showCheckout && !payment && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-black">
                    Finalizar compra
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Preencha seus dados para gerar o pagamento via Pix.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* NOME */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-300">
                      Nome completo
                    </label>

                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) =>
                        setBuyerName(e.target.value)
                      }
                      placeholder="Digite seu nome"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
                    />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-300">
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) =>
                        setBuyerEmail(e.target.value)
                      }
                      placeholder="seuemail@email.com"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
                    />
                  </div>

                  {/* TELEFONE */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-300">
                      Telefone
                      <span className="ml-1 font-normal text-gray-600">
                        (opcional)
                      </span>
                    </label>

                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) =>
                        setBuyerPhone(e.target.value)
                      }
                      placeholder="(91) 99999-9999"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* ERRO */}

                {paymentError && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    {paymentError}
                  </div>
                )}

                {/* BOTÃO PAGAMENTO */}

                <button
                  onClick={handleCreatePayment}
                  disabled={creatingPayment}
                  className="mt-6 w-full rounded-2xl bg-orange-500 px-6 py-5 text-lg font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingPayment
                    ? "GERANDO PAGAMENTO..."
                    : "GERAR PAGAMENTO PIX"}
                </button>

                <button
                  onClick={handleCloseCheckout}
                  disabled={creatingPayment}
                  className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold text-gray-500 transition hover:text-white"
                >
                  Voltar
                </button>
              </div>
            )}

            {/* PAGAMENTO GERADO */}

            {payment && (
              <div className="mt-6 rounded-3xl border border-green-500/20 bg-green-500/[0.05] p-6">
                <div className="text-center">
                  <div className="text-4xl">💳</div>

                  <h2 className="mt-4 text-2xl font-black">
                    Pagamento PIX
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Faça o pagamento pelo PIX para concluir sua compra.
                  </p>
                </div>

                {/* QR CODE */}

                {payment.qrCode && (
                  <div className="mt-6 flex justify-center">
                    <div className="rounded-2xl bg-white p-4">
                      <img
                        src={
                          payment.qrCode.startsWith("data:")
                            ? payment.qrCode
                            : `data:image/png;base64,${payment.qrCode}`
                        }
                        alt="QR Code PIX"
                        className="h-56 w-56 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* CÓDIGO PIX */}

                {payment.pixCode && (
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-bold text-gray-300">
                      PIX Copia e Cola
                    </p>

                    <div className="break-all rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-5 text-gray-400">
                      {payment.pixCode}
                    </div>

                    <button
                      onClick={handleCopyPix}
                      className="mt-3 w-full rounded-xl bg-white px-4 py-4 font-black text-black transition hover:bg-gray-200"
                    >
                      {copied
                        ? "✓ PIX COPIADO"
                        : "COPIAR PIX"}
                    </button>
                  </div>
                )}

                {/* LINK DE PAGAMENTO */}

                {payment.paymentUrl && (
                  <a
                    href={payment.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block w-full rounded-xl bg-orange-500 px-4 py-4 text-center font-black text-black transition hover:bg-orange-400"
                  >
                    ABRIR PAGAMENTO
                  </a>
                )}

                {/* ID DA TRANSAÇÃO */}

                {payment.transactionId && (
                  <p className="mt-5 text-center text-xs text-gray-600">
                    Transação: {payment.transactionId}
                  </p>
                )}

                {/* CASO A RESPOSTA NÃO TENHA SIDO RECONHECIDA */}

                {!payment.qrCode &&
                  !payment.pixCode &&
                  !payment.paymentUrl && (
                    <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center">
                      <p className="text-sm text-yellow-400">
                        A cobrança foi criada, mas o formato do
                        pagamento retornado pela Pixou ainda precisa
                        ser identificado.
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Transação:{" "}
                        {payment.transactionId || "não informado"}
                      </p>
                    </div>
                  )}

                <button
                  onClick={handleCloseCheckout}
                  className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold text-gray-500 transition hover:text-white"
                >
                  Voltar para o produto
                </button>
              </div>
            )}

            {/* BENEFÍCIOS */}

            {!showCheckout && !payment && (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <div className="text-2xl">🔒</div>

                  <p className="mt-2 text-xs text-gray-400">
                    Compra segura
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <div className="text-2xl">⚡</div>

                  <p className="mt-2 text-xs text-gray-400">
                    Acesso digital
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <div className="text-2xl">💎</div>

                  <p className="mt-2 text-xs text-gray-400">
                    Produto digital
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-gray-500">
        © 2026 AMR.STORE — Todos os direitos reservados.
      </footer>
    </main>
  );
}
