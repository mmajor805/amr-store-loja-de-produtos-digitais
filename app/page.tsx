"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  image_url: string | null;
  purchase_url: string | null;
  active: boolean;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Erro ao carregar produtos");
        }

        const data = await response.json();

        setProducts(data || []);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

          <a
            href="/"
            className="text-xl font-bold"
          >
            AMR<span className="text-orange-500">.</span>STORE
          </a>

          <span className="text-sm text-gray-400">
            Produtos Digitais
          </span>

        </div>
      </header>

      <section className="px-5 pb-16 pt-16">

        <div className="mx-auto max-w-4xl text-center">

          <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400">
            CONTEÚDO DIGITAL
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            Conteúdo pronto para você
            <span className="block text-orange-500">
              crescer nas redes sociais.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Encontre packs de conteúdos digitais prontos para facilitar sua
            criação e ajudar você a manter suas redes sempre movimentadas.
          </p>

        </div>

      </section>

      <section className="px-5 pb-20">

        <div className="mx-auto max-w-6xl">

          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              Produtos em destaque
            </h2>

            <p className="mt-2 text-gray-400">
              Escolha o conteúdo ideal para suas redes.
            </p>
          </div>

          {loading ? (

            <div className="py-10 text-center text-gray-400">
              Carregando produtos...
            </div>

          ) : products.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-400">
              Nenhum produto disponível no momento.
            </div>

          ) : (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {products.map((product) => (

                <article
                  key={product.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl transition hover:-translate-y-1 hover:border-orange-500/40"
                >

                  <a
                    href={`/produto/${product.id}`}
                    className="block"
                  >

                    <div className="relative">

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-52 w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-52 items-center justify-center bg-gradient-to-br from-orange-500/30 via-orange-600/10 to-black">

                          <div className="text-center">

                            <div className="text-5xl font-black">
                              AMR
                            </div>

                            <div className="mt-1 text-sm uppercase tracking-widest text-orange-400">
                              Produto Digital
                            </div>

                          </div>

                        </div>

                      )}

                    </div>

                    <div className="p-6">

                      <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                        PRODUTO DIGITAL
                      </span>

                      <h3 className="mt-5 text-xl font-bold">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-6">

                        {product.old_price !== null && (
                          <span className="text-sm text-gray-500 line-through">
                            R$ {Number(product.old_price)
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        )}

                        <div className="mt-1 text-3xl font-black">
                          R$ {Number(product.price ?? 0)
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>

                      </div>

                    </div>

                  </a>

                  <div className="px-6 pb-6">

                    <a
                      href={`/produto/${product.id}`}
                      className="block w-full rounded-xl bg-orange-500 px-5 py-4 text-center font-bold text-black transition hover:bg-orange-400"
                    >
                      VER PRODUTO
                    </a>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-gray-500">
        © 2026 AMR.STORE — Todos os direitos reservados.
      </footer>

    </main>
  );
}
