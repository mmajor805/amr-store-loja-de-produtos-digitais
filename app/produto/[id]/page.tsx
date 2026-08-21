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

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <p className="text-gray-400">
          Carregando produto...
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">

        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">

          <div className="text-5xl">
            📦
          </div>

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
    oldPrice !== null &&
    oldPrice > price
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

              {oldPrice !== null &&
                oldPrice > price && (

                  <div className="flex flex-wrap items-center gap-3">

                    <span className="text-lg text-gray-500 line-through">
                      R${" "}
                      {oldPrice
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>

                    {discount !== null && (

                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                        {discount}% OFF
                      </span>

                    )}

                  </div>

                )}

              <div className="mt-1 text-4xl font-black">
                R${" "}
                {price
                  .toFixed(2)
                  .replace(".", ",")}
              </div>

            </div>

            {/* COMPRA */}

            {product.purchase_url ? (

              <a
                href={product.purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full rounded-2xl bg-orange-500 px-6 py-5 text-center text-lg font-black text-black shadow-lg shadow-orange-500/10 transition hover:bg-orange-400 hover:shadow-orange-500/20"
              >
                COMPRAR AGORA
              </a>

            ) : (

              <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center text-sm text-yellow-400">
                Link de compra ainda não disponível.
              </div>

            )}

            {/* BENEFÍCIOS */}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">

                <div className="text-2xl">
                  🔒
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Compra segura
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">

                <div className="text-2xl">
                  ⚡
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Acesso digital
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">

                <div className="text-2xl">
                  💎
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Produto digital
                </p>

              </div>

            </div>

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
