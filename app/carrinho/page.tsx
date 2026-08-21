"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CarrinhoPage() {
  const {
    cart,
    removeFromCart,
    clearCart,
    cartTotal,
  } = useCart();

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

          <Link
            href="/"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Continuar comprando
          </Link>

        </div>

      </header>

      {/* CONTEÚDO */}

      <section className="px-5 py-12 sm:py-16">

        <div className="mx-auto max-w-5xl">

          <div className="mb-10">

            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
              Sua compra
            </span>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Carrinho
            </h1>

            <p className="mt-3 text-gray-400">
              Confira os produtos selecionados antes de continuar.
            </p>

          </div>

          {/* CARRINHO VAZIO */}

          {cart.length === 0 && (

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

              <div className="text-6xl">
                🛒
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Seu carrinho está vazio
              </h2>

              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Você ainda não adicionou nenhum produto.
                Explore nossa loja e encontre algo que combine com você.
              </p>

              <Link
                href="/"
                className="mt-8 inline-block rounded-xl bg-orange-500 px-7 py-4 font-black text-black transition hover:bg-orange-400"
              >
                EXPLORAR PRODUTOS
              </Link>

            </div>

          )}

          {/* CARRINHO COM PRODUTOS */}

          {cart.length > 0 && (

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

              {/* LISTA */}

              <div className="space-y-4">

                {cart.map((product) => (

                  <div
                    key={product.id}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
                  >

                    {/* IMAGEM */}

                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-black sm:h-28 sm:w-28">

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500/30 to-black">

                          <span className="text-xl font-black">
                            AMR
                          </span>

                        </div>

                      )}

                    </div>

                    {/* INFORMAÇÕES */}

                    <div className="flex min-w-0 flex-1 flex-col justify-between">

                      <div>

                        <h2 className="font-bold leading-6">
                          {product.name}
                        </h2>

                        <p className="mt-2 text-lg font-black text-orange-500">
                          R${" "}
                          {product.price
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(product.id)
                        }
                        className="mt-3 w-fit text-sm text-gray-500 transition hover:text-red-400"
                      >
                        Remover
                      </button>

                    </div>

                  </div>

                ))}

                {/* LIMPAR */}

                <button
                  onClick={clearCart}
                  className="pt-3 text-sm text-gray-500 transition hover:text-red-400"
                >
                  Limpar carrinho
                </button>

              </div>

              {/* RESUMO */}

              <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-6">

                <h2 className="text-xl font-bold">
                  Resumo do pedido
                </h2>

                <div className="mt-6 space-y-4">

                  <div className="flex justify-between text-sm text-gray-400">

                    <span>
                      Produtos
                    </span>

                    <span>
                      {cart.length}
                    </span>

                  </div>

                  <div className="border-t border-white/10 pt-4">

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

                </div>

                <button
                  disabled
                  className="mt-6 w-full cursor-not-allowed rounded-xl bg-orange-500/40 px-5 py-4 font-black text-black"
                >
                  FINALIZAR COMPRA
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                  O pagamento será configurado na próxima etapa.
                </p>

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
