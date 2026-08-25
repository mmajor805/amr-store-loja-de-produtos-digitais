"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

import { useCart } from "../context/CartContext";

type PixData = {
  id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  net_amount?: number;
  created_at?: string;

  pix?: {
    code?: string;
    qrcode_base64?: string;
  };
};

/*
 * ==========================================
 * CPF
 * ==========================================
 */

function onlyNumbers(
  value: string
): string {
  return value.replace(
    /\D/g,
    ""
  );
}

function isValidCPF(
  value: string
): boolean {
  const cpf =
    onlyNumbers(value);

  if (
    cpf.length !== 11
  ) {
    return false;
  }

  if (
    /^(\d)\1{10}$/.test(
      cpf
    )
  ) {
    return false;
  }

  let sum = 0;

  for (
    let i = 0;
    i < 9;
    i++
  ) {
    sum +=
      Number(cpf[i]) *
      (10 - i);
  }

  let remainder =
    (sum * 10) % 11;

  if (
    remainder === 10
  ) {
    remainder = 0;
  }

  if (
    remainder !==
    Number(cpf[9])
  ) {
    return false;
  }

  sum = 0;

  for (
    let i = 0;
    i < 10;
    i++
  ) {
    sum +=
      Number(cpf[i]) *
      (11 - i);
  }

  remainder =
    (sum * 10) % 11;

  if (
    remainder === 10
  ) {
    remainder = 0;
  }

  return (
    remainder ===
    Number(cpf[10])
  );
}

/*
 * ==========================================
 * CNPJ
 * ==========================================
 */

function isValidCNPJ(
  value: string
): boolean {
  const cnpj =
    onlyNumbers(value);

  if (
    cnpj.length !== 14
  ) {
    return false;
  }

  if (
    /^(\d)\1{13}$/.test(
      cnpj
    )
  ) {
    return false;
  }

  const firstWeights = [
    5,
    4,
    3,
    2,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
  ];

  let sum = 0;

  for (
    let i = 0;
    i < 12;
    i++
  ) {
    sum +=
      Number(cnpj[i]) *
      firstWeights[i];
  }

  let remainder =
    sum % 11;

  const digit1 =
    remainder < 2
      ? 0
      : 11 - remainder;

  if (
    digit1 !==
    Number(cnpj[12])
  ) {
    return false;
  }

  const secondWeights = [
    6,
    5,
    4,
    3,
    2,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
  ];

  sum = 0;

  for (
    let i = 0;
    i < 13;
    i++
  ) {
    sum +=
      Number(cnpj[i]) *
      secondWeights[i];
  }

  remainder =
    sum % 11;

  const digit2 =
    remainder < 2
      ? 0
      : 11 - remainder;

  return (
    digit2 ===
    Number(cnpj[13])
  );
}

/*
 * ==========================================
 * DOCUMENTO
 * ==========================================
 */

function isValidDocument(
  value: string
): boolean {
  const document =
    onlyNumbers(value);

  if (
    document.length === 11
  ) {
    return isValidCPF(
      document
    );
  }

  if (
    document.length === 14
  ) {
    return isValidCNPJ(
      document
    );
  }

  return false;
}

/*
 * ==========================================
 * FORMATA CPF/CNPJ
 * ==========================================
 */

function formatDocument(
  value: string
): string {
  const numbers =
    onlyNumbers(value);

  /*
   * CPF
   */

  if (
    numbers.length <= 11
  ) {
    return numbers
      .replace(
        /^(\d{3})(\d)/,
        "$1.$2"
      )
      .replace(
        /^(\d{3})\.(\d{3})(\d)/,
        "$1.$2.$3"
      )
      .replace(
        /^(\d{3})\.(\d{3})\.(\d{3})(\d)/,
        "$1.$2.$3-$4"
      );
  }

  /*
   * CNPJ
   */

  return numbers
    .slice(0, 14)
    .replace(
      /^(\d{2})(\d)/,
      "$1.$2"
    )
    .replace(
      /^(\d{2})\.(\d{3})(\d)/,
      "$1.$2.$3"
    )
    .replace(
      /^(\d{2})\.(\d{3})\.(\d{3})(\d)/,
      "$1.$2.$3/$4"
    )
    .replace(
      /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
      "$1.$2.$3/$4-$5"
    );
}

/*
 * ==========================================
 * FORMATA TELEFONE
 * ==========================================
 */

function formatPhone(
  value: string
): string {
  const numbers =
    onlyNumbers(value)
      .slice(0, 11);

  if (
    numbers.length <= 2
  ) {
    return numbers;
  }

  if (
    numbers.length <= 7
  ) {
    return numbers.replace(
      /^(\d{2})(\d+)/,
      "($1) $2"
    );
  }

  return numbers.replace(
    /^(\d{2})(\d{5})(\d{0,4})/,
    "($1) $2-$3"
  );
}

/*
 * ==========================================
 * NORMALIZA TELEFONE
 * ==========================================
 */

function normalizePhone(
  value: string
): string {
  const numbers =
    onlyNumbers(value);

  if (
    numbers.length === 11
  ) {
    return `55${numbers}`;
  }

  if (
    numbers.length === 12 ||
    numbers.length === 13
  ) {
    return numbers;
  }

  return "";
}

export default function CheckoutPage() {
  const {
    cart,
    cartTotal,
  } = useCart();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [whatsapp, setWhatsapp] =
    useState("");

  const [document, setDocument] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [pix, setPix] =
    useState<PixData | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  /*
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setCopied(false);

    /*
     * CARRINHO
     */

    if (
      cart.length === 0
    ) {
      setError(
        "Seu carrinho está vazio."
      );
      return;
    }

    /*
     * NOME
     */

    const cleanName =
      name.trim();

    if (
      cleanName.length < 3
    ) {
      setError(
        "Digite seu nome completo."
      );
      return;
    }

    /*
     * E-MAIL
     */

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Digite seu e-mail."
      );
      return;
    }

    /*
     * WHATSAPP
     */

    const cleanPhone =
      normalizePhone(
        whatsapp
      );

    if (!cleanPhone) {
      setError(
        "Digite um WhatsApp válido com DDD."
      );
      return;
    }

    /*
     * CPF/CNPJ
     */

    const cleanDocument =
      onlyNumbers(
        document
      );

    if (
      !cleanDocument
    ) {
      setError(
        "Digite seu CPF ou CNPJ."
      );
      return;
    }

    if (
      !isValidDocument(
        cleanDocument
      )
    ) {
      setError(
        "O CPF ou CNPJ informado é inválido. Confira os números e tente novamente."
      );
      return;
    }

    /*
     * VALOR
     */

    if (
      cartTotal < 6
    ) {
      setError(
        "O valor mínimo para pagamento via Pix é R$ 6,00."
      );
      return;
    }

    const amountInCents =
      Math.round(
        cartTotal * 100
      );

    if (
      amountInCents < 600
    ) {
      setError(
        "O valor mínimo para pagamento via Pix é R$ 6,00."
      );
      return;
    }

    if (
      amountInCents > 300000
    ) {
      setError(
        "O valor máximo para pagamento via Pix é R$ 3.000,00."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * ID ÚNICO
       */

      const externalId =
        `pedido-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;

      /*
       * NOME DO PRODUTO
       */

      const productName =
        cart.length === 1
          ? cart[0].name
          : `${cart.length} produtos AMR.STORE`;

      /*
       * PAYLOAD
       */

      const payload = {
        external_id:
          externalId,

        amount:
          amountInCents,

        buyer: {
          name:
            cleanName,

          email:
            cleanEmail,

          phone:
            cleanPhone,

          document:
            cleanDocument,
        },

        product: {
          name:
            productName,
        },
      };

      console.log(
        "CHECKOUT - PAYLOAD:",
        {
          ...payload,
          buyer: {
            ...payload.buyer,
            document:
              "***DOCUMENTO***",
          },
        }
      );

      /*
       * CHAMADA
       */

      const response =
        await fetch(
          "/api/pixou/charge",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await response.json();

      console.log(
        "CHECKOUT - RESPONSE:",
        result
      );

      /*
       * ERRO
       */

      if (
        !response.ok
      ) {
        let message =
          result?.error ||
          "Não foi possível criar o pagamento.";

        /*
         * Detail string
         */

        if (
          typeof result?.detail ===
          "string"
        ) {
          message +=
            ` ${result.detail}`;
        }

        /*
         * Detail objeto
         */

        if (
          result?.detail &&
          typeof result.detail ===
            "object"
        ) {
          try {
            message +=
              ` ${JSON.stringify(
                result.detail
              )}`;
          } catch {}
        }

        throw new Error(
          message
        );
      }

      /*
       * DATA
       */

      if (
        !result?.data
      ) {
        throw new Error(
          "A Pixou Pay não retornou os dados da cobrança."
        );
      }

      /*
       * PIX
       */

      if (
        !result.data?.pix?.code
      ) {
        throw new Error(
          "A Pixou Pay não retornou o código Pix."
        );
      }

      /*
       * SUCESSO
       */

      setPix(
        result.data
      );
    } catch (err) {
      console.error(
        "ERRO AO CRIAR PIX:",
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

  /*
   * ==========================================
   * COPIAR PIX
   * ==========================================
   */

  async function copyPix() {
    const code =
      pix?.pix?.code;

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        code
      );

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
   * ==========================================
   * QR CODE
   * ==========================================
   */

  function getQrCodeSource(
    value?: string
  ): string | null {
    if (!value) {
      return null;
    }

    const cleanValue =
      value.trim();

    if (!cleanValue) {
      return null;
    }

    if (
      cleanValue.startsWith(
        "data:image/"
      ) ||
      cleanValue.startsWith(
        "http://"
      ) ||
      cleanValue.startsWith(
        "https://"
      )
    ) {
      return cleanValue;
    }

    const base64 =
      cleanValue.replace(
        /\s/g,
        ""
      );

    if (
      base64.startsWith(
        "PHN2Zy"
      ) ||
      base64.startsWith(
        "PD94bWwg"
      )
    ) {
      return `data:image/svg+xml;base64,${base64}`;
    }

    return `data:image/png;base64,${base64}`;
  }

  const qrCodeSource =
    getQrCodeSource(
      pix?.pix
        ?.qrcode_base64
    );

  /*
   * ==========================================
   * CARRINHO VAZIO
   * ==========================================
   */

  if (
    cart.length === 0 &&
    !pix
  ) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">

        <header className="border-b border-white/10">

          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

            <Link
              href="/"
              className="text-xl font-black"
            >
              AMR
              <span className="text-orange-500">
                .
              </span>
              STORE
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

  /*
   * ==========================================
   * PÁGINA PRINCIPAL
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <Link
            href="/"
            className="text-xl font-black"
          >
            AMR
            <span className="text-orange-500">
              .
            </span>
            STORE
          </Link>

          <span className="text-sm text-gray-400">
            Checkout seguro
          </span>

        </div>

      </header>

      <section className="px-5 py-10 sm:py-16">

        <div className="mx-auto max-w-5xl">

          {/*
           * ==================================
           * PIX GERADO
           * ==================================
           */}

          {pix ? (

            <div className="mx-auto max-w-lg">

              <div className="rounded-3xl border border-green-500/20 bg-white/[0.04] p-6 text-center sm:p-8">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl text-green-400">
                  ✓
                </div>

                <h1 className="mt-5 text-3xl font-black">
                  Pix gerado!
                </h1>

                <p className="mt-3 text-gray-400">
                  Faça o pagamento usando o QR Code abaixo.
                </p>

                <div className="mt-6">

                  <p className="text-sm text-gray-500">
                    Valor
                  </p>

                  <p className="mt-1 text-4xl font-black text-orange-500">
                    R${" "}
                    {(
                      pix.total_amount /
                      100
                    )
                      .toFixed(
                        2
                      )
                      .replace(
                        ".",
                        ","
                      )}
                  </p>

                </div>

                {qrCodeSource ? (

                  <div className="mx-auto mt-7 flex w-fit items-center justify-center rounded-2xl bg-white p-5">

                    <img
                      src={
                        qrCodeSource
                      }
                      alt="QR Code para pagamento Pix"
                      className="h-64 w-64 object-contain"
                      onError={(
                        event
                      ) => {
                        console.error(
                          "Erro ao carregar QR Code."
                        );

                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                ) : (

                  <div className="mx-auto mt-7 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                    <p className="text-sm text-yellow-400">
                      O QR Code não foi disponibilizado. Utilize o Pix Copia e Cola abaixo.
                    </p>

                  </div>

                )}

                <div className="mt-7 text-left">

                  <label className="mb-2 block text-sm font-bold">
                    Pix Copia e Cola
                  </label>

                  <textarea
                    readOnly
                    value={
                      pix.pix
                        ?.code ||
                      ""
                    }
                    className="h-32 w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-5 text-gray-300 outline-none focus:border-orange-500"
                  />

                </div>

                <button
                  type="button"
                  onClick={
                    copyPix
                  }
                  className="mt-4 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400"
                >
                  {copied
                    ? "✓ PIX COPIADO"
                    : "COPIAR PIX"}
                </button>

                <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-left">

                  <p className="font-bold text-yellow-400">
                    Aguarde a confirmação
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Após realizar o pagamento, aguarde a confirmação da transação.
                  </p>

                </div>

              </div>

            </div>

          ) : (

            <>
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

                {/*
                 * ==================================
                 * FORMULÁRIO
                 * ==================================
                 */}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
                >

                  <h2 className="text-2xl font-bold">
                    Seus dados
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Usaremos esses dados para identificar sua compra e processar o pedido.
                  </p>

                  {error && (

                    <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-400">
                      {error}
                    </div>

                  )}

                  {/*
                   * NOME
                   */}

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
                      onChange={(
                        event
                      ) =>
                        setName(
                          event.target
                            .value
                        )
                      }
                      placeholder="Digite seu nome completo"
                      required
                      disabled={
                        loading
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
                    />

                  </div>

                  {/*
                   * E-MAIL
                   */}

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
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target
                            .value
                        )
                      }
                      placeholder="seuemail@email.com"
                      required
                      disabled={
                        loading
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
                    />

                  </div>

                  {/*
                   * WHATSAPP
                   */}

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
                      inputMode="numeric"
                      value={
                        whatsapp
                      }
                      onChange={(
                        event
                      ) =>
                        setWhatsapp(
                          formatPhone(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      placeholder="(91) 99999-9999"
                      required
                      disabled={
                        loading
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
                    />

                    <p className="mt-2 text-xs text-gray-600">
                      Informe seu número com DDD.
                    </p>

                  </div>

                  {/*
                   * CPF/CNPJ
                   */}

                  <div className="mt-5">

                    <label
                      htmlFor="document"
                      className="mb-2 block text-sm font-bold"
                    >
                      CPF ou CNPJ
                    </label>

                    <input
                      id="document"
                      type="text"
                      inputMode="numeric"
                      value={
                        document
                      }
                      onChange={(
                        event
                      ) =>
                        setDocument(
                          formatDocument(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      placeholder="Digite seu CPF ou CNPJ"
                      required
                      disabled={
                        loading
                      }
                      maxLength={18}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none placeholder:text-gray-600 focus:border-orange-500 disabled:opacity-50"
                    />

                    <p className="mt-2 text-xs text-gray-600">
                      Necessário para processar o pagamento Pix.
                    </p>

                  </div>

                  {/*
                   * SEGURANÇA
                   */}

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
                          Seus dados serão utilizados somente para processar seu pedido.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/*
                   * PAGAR
                   */}

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "GERANDO PIX..."
                      : "PAGAR AGORA"}
                  </button>

                </form>

                {/*
                 * ==================================
                 * RESUMO
                 * ==================================
                 */}

                <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-6">

                  <h2 className="text-xl font-bold">
                    Resumo da compra
                  </h2>

                  <div className="mt-6 space-y-4">

                    {cart.map(
                      (
                        product
                      ) => (

                        <div
                          key={
                            product.id
                          }
                          className="flex justify-between gap-4"
                        >

                          <span className="text-sm leading-5 text-gray-300">
                            {
                              product.name
                            }
                          </span>

                          <span className="whitespace-nowrap font-bold">
                            R${" "}
                            {product.price
                              .toFixed(
                                2
                              )
                              .replace(
                                ".",
                                ","
                              )}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                  <div className="mt-6 border-t border-white/10 pt-5">

                    <div className="flex items-center justify-between">

                      <span className="text-gray-400">
                        Total
                      </span>

                      <span className="text-3xl font-black">
                        R${" "}
                        {cartTotal
                          .toFixed(
                            2
                          )
                          .replace(
                            ".",
                            ","
                          )}
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

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-gray-500">
        © 2026 AMR.STORE — Todos os direitos reservados.
      </footer>

    </main>
  );
}
