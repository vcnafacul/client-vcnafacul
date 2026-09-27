import { Link } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import BaseTemplate from "../../components/templates/baseTemplate";
import { GEOLOCATION_REGISTER } from "../../routes/path";

/**
 * Localiza Cursinho (`/localiza-cursinho`, tickets/022): o passo ANTES do
 * cadastro — a pessoa confere se o cursinho já está na plataforma.
 *
 * Card 04 = só o esqueleto. Cada `data-slot` é preenchido por um card:
 * lista (05), busca (06), mapa (05), card do mapa (07), cadastro (08).
 *
 * ⚠️ Breakpoints do projeto: `md` = 1200px. Metade/metade de 1200px para
 * cima; abaixo disso, mapa em cima (45vh) e lista embaixo.
 */
function GeoSearch() {
  return (
    <BaseTemplate solid className="bg-white">
      <div className="grid grid-cols-1 md:h-[calc(100vh-76px)] md:grid-cols-2">
        <section
          aria-labelledby="localiza-titulo"
          className="relative order-2 overflow-hidden md:order-1 md:overflow-y-auto"
        >
          {/*
            Menor que o `.graphism` da tela de cadastro (446px): nesta coluna,
            o tamanho padrão cobria o título e o texto.
          */}
          <TriangleGreen
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-6 h-24 w-24 rotate-180 md:-left-16 md:-top-10 md:h-40 md:w-40"
          />
          <div className="relative z-10 flex flex-col gap-6 px-4 pb-8 pt-14 sm:px-8 md:min-h-full md:px-12 md:pt-24">
            <header className="space-y-2">
              <h1
                id="localiza-titulo"
                className="text-3xl font-black text-marine md:text-4xl"
              >
                Localize um Cursinho
              </h1>
              <p className="text-slate-600">
                Antes de cadastrar um novo cursinho, verifique se este não se
                encontra em nossa plataforma.
              </p>
            </header>

            {/* 05: cursinhos da área visível do mapa */}
            <div data-slot="lista" className="flex-1" />

            {/*
              08 troca por botão + modal "você não encontrou?". Até lá, um
              link direto: se a develop subir antes do 05/08, a pessoa ainda
              consegue cadastrar.
            */}
            <div data-slot="cadastro" className="space-y-2 border-t pt-6">
              <p className="text-sm text-slate-600">
                Não encontrou um cursinho que conhece?
              </p>
              <Link
                to={GEOLOCATION_REGISTER}
                className="inline-flex rounded-full bg-orange px-6 py-3 font-bold text-white hover:opacity-90"
              >
                Cadastre um novo cursinho
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-label="Mapa de cursinhos"
          className="relative order-1 h-[45vh] bg-slate-100 md:order-2 md:h-full"
        >
          {/* 06: busca · 05: mapa · 07: card do cursinho */}
          <div data-slot="busca" />
          <div data-slot="mapa" className="h-full w-full" />
          <div data-slot="card-do-mapa" />
        </section>
      </div>
    </BaseTemplate>
  );
}

export default GeoSearch;
