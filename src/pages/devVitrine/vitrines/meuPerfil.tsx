import Account from "@/pages/account";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

/** Meu perfil com menu lateral (2026-10-19). Seção: `?secao=frentes|notificacoes`. */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#0B2747"/><circle cx="80" cy="64" r="30" fill="#FF7600"/><rect x="36" y="104" width="88" height="40" rx="20" fill="#FF7600"/></svg>`;
const foto = { buffer: btoa(SVG), contentType: "image/svg+xml" };

const usuario = (colaborador: boolean) => ({
  id: "u1",
  firstName: "Isabela",
  lastName: "Moreira dos Santos",
  socialName: "",
  useSocialName: false,
  email: "isabela@cursinho.org.br",
  phone: "11987654321",
  gender: 1,
  birthday: "1998-05-12T12:00:00.000Z",
  state: "SP",
  city: "São José dos Campos",
  about: "Professora de Matemática há 6 anos, voluntária no cursinho desde 2023.",
  collaborator: colaborador,
  collaboratorDescription: colaborador ? "Professora de Matemática · Cursinho Alfa" : null,
  collaboratorPhoto: colaborador ? "collaborators/isabela.svg" : null,
  collaboratorFrentes: [],
  afinidades: colaborador
    ? [
        ["f1", "Álgebra", "m1", "Matemática"],
        ["f2", "Geometria", "m1", "Matemática"],
        ["f3", "Mecânica", "m2", "Física"],
      ].map(([frenteId, frenteNome, materiaId, materiaNome]) => ({
        frenteId,
        frenteNome,
        materiaId,
        materiaNome,
        adicionadoEm: "2026-03-01T12:00:00.000Z",
      }))
    : [],
});

const rotas = (colaborador: boolean): RotaFalsa[] => [
  { caminho: /\/user\/me$/, resposta: { corpo: usuario(colaborador) } },
  { caminho: /\/collaborator\/.+\/photo$/, resposta: { corpo: foto } },
];

export const vitrineMeuPerfil: Vitrine = {
  slug: "meu-perfil",
  titulo: "Meu perfil",
  arquivo: "src/pages/account/index.tsx",
  estados: [
    { slug: "colaborador", titulo: "Colaborador", rotas: rotas(true), render: () => <Account /> },
    { slug: "estudante", titulo: "Estudante", rotas: rotas(false), render: () => <Account /> },
  ],
};
