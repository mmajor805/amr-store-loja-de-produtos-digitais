const products = [
  {
    id: 1,
    name: "Pack 500 Reels para Viralizar",
    description:
      "500 vídeos prontos para você criar conteúdos para Instagram e TikTok.",
    price: "R$ 14,90",
    oldPrice: "R$ 29,90",
    badge: "MAIS VENDIDO",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div>
            <h1 className="text-xl font-bold">
              AMR<span className="text-orange-500">.</span>STORE
            </h1>
          </div>

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

          <h2 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            Conteúdo pronto para você
            <span className="block text-orange-500">
              crescer nas redes sociais.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Encontre packs de conteúdos digitais prontos para facilitar sua
            criação e ajudar você a manter suas redes sempre movimentadas.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h3 className="text-2xl font-bold">Produtos em destaque</h3>
            <p className="mt-2 text-gray-400">
              Escolha o conteúdo ideal para suas redes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl"
              >
                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-orange-500/30 via-orange-600/10 to-black">
                  <div className="text-center">
                    <div className="text-5xl font-black">500</div>
                    <div className="mt-1 text-sm uppercase tracking-widest text-orange-400">
                      Reels
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                    {product.badge}
                  </span>

                  <h4 className="mt-5 text-xl font-bold">
                    {product.name}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {product.description}
                  </p>

                  <div className="mt-6">
                    <span className="text-sm text-gray-500 line-through">
                      {product.oldPrice}
                    </span>

                    <div className="mt-1 text-3xl font-black">
                      {product.price}
                    </div>
                  </div>

                  <button className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-4 font-bold text-black transition hover:bg-orange-400">
                    QUERO MEU PACK
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-gray-500">
        © 2026 AMR.STORE — Todos os direitos reservados.
      </footer>
    </main>
  );
}
