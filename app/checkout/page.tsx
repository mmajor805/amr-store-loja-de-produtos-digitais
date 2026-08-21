"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !email || !whatsapp) {
      alert("Preencha todos os campos.");
      return;
    }

    alert(
      "Dados preenchidos com sucesso! O pagamento será configurado na próxima etapa."
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

          {/* TÍTULO */}

          <div className="mb-10">

            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
              Finalização
            </span>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Finalizar compra
            </h1>

            <p className="mt-3 text-gray-400">
              Preencha seus dados para continuar.
            </p>

          </div>

          {/* CARRINHO VAZIO */}

          {cart.length === 0 && (

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

              <div className="text-5xl">
                🛒
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Seu carrinho está vazio
              </h2>

              <p className="mt-3 text-gray-500">
                Adicione pelo menos um produto antes de finalizar a compra.
              </p>

              <Link
                href="/"
                className="mt-7 inline-block rounded-xl bg-orange-500 px-7 py-4 font-black text-black transition hover:bg-orange-400"
              >
                VOLTAR PARA A LOJA
              </Link>

            </div>

          )}

          {/* CHECKOUT */}

          {cart.length > 0 && (

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
                  Usaremos esses dados para identificar sua compra e enviar
                  as informações do pedido.
                </p>

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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
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
                        Seus dados serão utilizados somente para processar
                        seu pedido.
                      </p>

                    </div>

                  </div>

                </div>

                {/* BOTÃO */}

                <button
                  type="submit"
                  className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400"
                >
                  PAGAR AGORA
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

                      <div className="min-w-0">

                        <p className="font-medium leading-5">
                          {product.name}
                        </p>

                      </div>

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
