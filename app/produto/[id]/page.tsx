"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

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

export default function ProductPage() {
  const params = useParams();

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, old_price, image_url, purchase_url, active"
        )
        .eq("id", Number(productId))
        .eq("active", true)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar produto:", error);
        setProduct(null);
      } else {
        setProduct(data);
      }

      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <p className="text-gray-400">
          Carregando produto...
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <div className="text-center">

          <h1 className="text-3xl font-black">
            Produto não encontrado
          </h1>

          <p className="mt-3 text-gray-400">
            Esse produto pode ter sido removido ou desativado.
          </p>

          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-4 font-bold text-black"
          >
            VOLTAR PARA A LOJA
          </a>

        </div>
      </main>
    );
  }

  const currentPrice = Number(product.price ?? 0);
  const oldPrice = product.old_price !== null
    ? Number(product.old_price)
    : null;

  const discount =
    oldPrice && oldPrice > currentPrice
      ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
      : null;

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/95 backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <a
            href="/"
            className="text-xl font-black"
          >
            AMR<span className="text-orange-500">.</span>STORE
          </a>

          <a
            href="/"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Voltar
          </a>

        </div>

      </header>

      {/* HERO */}

      <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:pb-24 sm:pt-16">

        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">

          {/* IMAGEM */}

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">

            {product.image_url ? (

              <img
                src={product.image_url}
                alt={product.name}
                className="h-[330px] w-full object-cover sm:h-[500px]"
              />

            ) : (

              <div className="flex h-[330px] items-center justify-center bg-gradient-to-br from-orange-500/30 via-orange-600/10 to-black sm:h-[500px]">

                <div className="text-center">

                  <div className="text-7xl font-black">
                    AMR
                  </div>

                  <div className="mt-3 text-sm uppercase tracking-[0.35em] text-orange-400">
                    Produto Digital
                  </div>

                </div>

              </div>

            )}

          </div>

          {/* INFORMAÇÕES */}

          <div>

            <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-400">
              Oferta especial
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-6 text-base leading-7 text-gray-400 sm:text-lg">
                {product.description}
              </p>
            )}

            {/* PREÇO */}

            <div className="mt-8">

              {oldPrice !== null && oldPrice > currentPrice && (
                <div className="text-lg text-gray-500 line-through">
                  De R$ {oldPrice.toFixed(2).replace(".", ",")}
                </div>
              )}

              <div className="mt-1 flex items-center gap-3">

                <span className="text-5xl font-black">
                  R$ {currentPrice.toFixed(2).replace(".", ",")}
                </span>

                {discount !== null && (
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-bold text-green-400">
                    -{discount}%
                  </span>
                )}

              </div>

              <p className="mt-2 text-sm text-gray-500">
                Pagamento único • Acesso ao produto digital
              </p>

            </div>

            {/* CTA */}

            {product.purchase_url ? (

              <a
                href={product.purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full rounded-2xl bg-orange-500 px-6 py-5 text-center text-lg font-black text-black shadow-xl shadow-orange-500/20 transition hover:scale-[1.02] hover:bg-orange-400"
              >
                QUERO ACESSAR AGORA
              </a>

            ) : (

              <div className="mt-8 rounded-2xl bg-white/10 px-6 py-5 text-center font-bold text-gray-500">
                Link de compra não configurado
              </div>

            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
              🔒 Compra segura • Acesso digital
            </div>

          </div>

        </div>

      </section>

      {/* BENEFÍCIOS */}

      <section className="border-y border-white/10 bg-white/[0.02] px-5 py-16">

        <div className="mx-auto max-w-5xl">

          <div className="mx-auto max-w-2xl text-center">

            <span className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Por que escolher este produto?
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Tudo para facilitar sua criação de conteúdo
            </h2>

            <p className="mt-4 text-gray-400">
              Tenha acesso a um conteúdo pronto para economizar tempo e manter
              suas redes sociais sempre movimentadas.
            </p>

          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-3xl">⚡</div>
              <h3 className="mt-4 text-lg font-bold">
                Pronto para usar
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Economize tempo utilizando conteúdos que já estão preparados.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-3xl">📱</div>
              <h3 className="mt-4 text-lg font-bold">
                Para redes sociais
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Ideal para criar publicações e manter seu perfil ativo.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-3xl">🚀</div>
              <h3 className="mt-4 text-lg font-bold">
                Mais praticidade
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Tenha uma biblioteca de conteúdos para facilitar sua rotina.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* O QUE VOCÊ RECEBE */}

      <section className="px-5 py-16">

        <div className="mx-auto max-w-5xl">

          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/[0.04] p-8 sm:p-12">

            <span className="text-sm font-bold uppercase tracking-widest text-orange-400">
              O que você recebe
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Seu conteúdo digital em um só lugar
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              <div className="flex gap-3">
                <span className="text-orange-500">✓</span>
                <span className="text-gray-300">
                  Conteúdo digital pronto para utilização
                </span>
              </div>

              <div className="flex gap-3">
                <span className="text-orange-500">✓</span>
                <span className="text-gray-300">
                  Acesso ao produto após a compra
                </span>
              </div>

              <div className="flex gap-3">
                <span className="text-orange-500">✓</span>
                <span className="text-gray-300">
                  Material organizado e fácil de utilizar
                </span>
              </div>

              <div className="flex gap-3">
                <span className="text-orange-500">✓</span>
                <span className="text-gray-300">
                  Economia de tempo na criação
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* GARANTIA */}

      <section className="px-5 pb-16">

        <div className="mx-auto max-w-4xl">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-3xl">
              🛡️
            </div>

            <h2 className="mt-5 text-2xl font-black sm:text-3xl">
              Compra simples e segura
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-400">
              Você será direcionado para o link de compra configurado no
              produto. Após a confirmação do pagamento, siga as instruções
              fornecidas para acessar seu conteúdo digital.
            </p>

          </div>

        </div>

      </section>

      {/* CTA FINAL */}

      <section className="px-5 pb-20">

        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-black sm:p-12">

          <h2 className="text-3xl font-black sm:text-4xl">
            Pronto para começar?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-black/70">
            Aproveite a oferta e tenha acesso ao seu conteúdo digital.
          </p>

          {product.purchase_url && (
            <a
              href={product.purchase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block rounded-2xl bg-black px-8 py-5 text-lg font-black text-white transition hover:scale-105"
            >
              QUERO MEU PRODUTO
            </a>
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
