/**
 * Papéis de cor, densidade e foco da Dash V2.
 *
 * ⚠️ **Isto não inventa paleta.** Toda cor aqui já existe no `tailwind.config.js`;
 * o que este arquivo acrescenta é **regra de uso** — hoje a mesma cor significa
 * coisas diferentes em telas diferentes, e é isso que o épico ataca.
 *
 * ⚠️ Classes do Tailwind em constantes, e **não** variáveis CSS novas no
 * `index.css`: as `--primary`/`--secondary` de lá pertencem ao shadcn, estão em
 * cinza neutro e não têm relação com a marca. Mexer nelas mudaria todos os
 * componentes de `components/ui/` de uma vez.
 *
 * ⚠️ Nenhuma tela do V1 importa este arquivo. Ele é consumido só pelos
 * componentes novos.
 *
 * Contrastes medidos (script em revisão do PR, fórmula WCAG 2.x):
 *
 *   marine / branco ........ 15.05:1  ✅ texto
 *   darkGrey / branco ....... 7.57:1  ✅ texto
 *   grey / branco ........... 4.95:1  ✅ texto
 *   marine / orange ......... 5.62:1  ✅ texto  ← o botão principal
 *   branco / orange ......... 2.68:1  ❌ reprovado, e é o que o V1 faz hoje
 */
export const dashV2 = {
  /** Superfície de conteúdo: tabela, toolbar, modal. */
  surface: "bg-white",
  /** Fundo da área da dash, atrás da superfície. */
  page: "bg-backgroundGrey",
  /** Divisória. Em listagem, borda de 1px vale mais que sombra — sombra por linha vira ruído. */
  border: "border-lightGray",

  /** Texto. `marine` cumpre o papel do preto sem a dureza do #000000. */
  text: {
    primary: "text-marine",
    secondary: "text-darkGrey",
    muted: "text-grey",
  },

  /**
   * Campo com valor inválido (ex.: intervalo de datas com "até" antes de "de").
   *
   * ⚠️ Só a **borda** fica vermelha. O texto do aviso continua em
   * `text.secondary`: `red` sobre branco dá 3.88:1 e reprova no AA de texto
   * pequeno — a mensagem carrega o significado, e o vermelho é reforço.
   */
  invalid: "border-red",

  /**
   * Ação. ⚠️ **No máximo um `primary` por tela** — a que cria o registro dali.
   * Espalhado em cinco botões, o laranja deixa de apontar para lugar nenhum.
   *
   * ⚠️ O texto do primário é `marine`, não branco: branco sobre #FF7600 dá
   * 2.68:1 e reprova até no limite de 3:1 de componente gráfico. `marine` sobre
   * o mesmo laranja dá 5.62:1, mantém o laranja exato da marca, e é o que o V2
   * usa. O `typeStyle="primary"` do V1 continua com texto branco e não é tocado.
   */
  action: {
    primary: "bg-orange text-marine",
    secondary: "bg-white border border-lightGray text-marine",
    ghost: "text-marine",
    destructive: "bg-red text-white",

    /**
     * Item de menu (o `⋯` da toolbar): `ghost` mais o realce de linha.
     * `backgroundGrey` é o mesmo cinza do fundo da dash — sobre a superfície
     * branca do popover ele marca a linha sob o cursor sem virar um segundo
     * botão.
     */
    menuItem: "text-marine hover:bg-backgroundGrey",

    /**
     * Destrutivo em superfície clara — linha de menu, e não botão.
     *
     * ⚠️ **Não é duplicata do `destructive`, é outro papel.** `bg-red
     * text-white` é o botão de ação, que ocupa o tamanho do próprio rótulo;
     * numa linha de menu ele vira um bloco vermelho de largura inteira e grita
     * muito mais alto do que a ação merece — ainda mais quando divide o menu
     * com itens neutros. Aqui o vermelho fica no texto e só o hover pinta o
     * fundo, em 10%.
     *
     * ⚠️ `red` (#F43535) sobre branco dá 3.88:1: passa no limite de 3:1 de
     * componente gráfico e no AA de texto grande, mas **não** no AA de texto
     * pequeno. Por isso o rótulo do item nunca é só a cor — quem lê "Excluir"
     * tem a informação inteira, e o vermelho é reforço.
     */
    destructiveGhost: "text-red hover:bg-red/10",
  },

  /** Foco de teclado, em TUDO que recebe foco. Substitui o `blue-500` do `Select`. */
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1",

  /**
   * Densidade. 40px alinha com o `rowHeight={40}` do MUI DataGrid em
   * `studentsEnrolled`.
   *
   * ⚠️ `hover` é o mesmo cinza do fundo da dash (`page`), e é de propósito: numa
   * listagem, a linha sob o cursor precisa de um realce que não compita com o
   * status nem com a coluna-chave. Fica aqui, e não escrito à mão no
   * `DashTable`, porque a catraca de paleta só enxerga este arquivo.
   */
  row: { base: "h-10", compact: "h-8", hover: "hover:bg-backgroundGrey" },
  header: "h-9",
  cell: "px-3 text-sm",

  /**
   * Barra de progresso de duas faixas (`dashProvas`, ticket `06`).
   *
   * ⚠️ Fica aqui, e não escrita à mão na célula, porque a catraca de paleta
   * (`tokens.test.ts`) só enxerga este arquivo — uma classe de cor num `.tsx`
   * passa despercebida.
   *
   * ⚠️ **`pending` é o mesmo `darkOrange` do ponto de `running`, a 40%.** Um
   * segundo laranja "claro" inventado para a barra seria exatamente a deriva de
   * paleta que este épico combate; a opacidade mantém uma única família e ainda
   * lê como "menos concluído" ao lado do `done` cheio.
   *
   * ⚠️ Cor não é o portador do significado aqui: a célula sempre traz o texto
   * `validadas/total` e um `title` com as três contagens. Quem não distingue as
   * faixas tem a informação inteira mesmo assim.
   */
  progress: {
    /** O que falta cadastrar. */
    track: "bg-lightGray",
    /** Validadas. */
    done: "bg-green3",
    /** Cadastradas e ainda não validadas. */
    pending: "bg-darkOrange/40",
  },

  /**
   * Status: **a cor vai no marcador, o texto fica em `marine`.**
   *
   * ⚠️ Nenhuma cor de acento desta paleta carrega texto pequeno sobre branco —
   * `green3` 3.77:1, `red` 3.88:1, `darkOrange` 2.45:1. Colorir o texto do badge,
   * que é o reflexo natural, produz um rótulo que muita gente não lê. Por isso o
   * texto é sempre `marine` (13:1+ sobre qualquer um dos chips).
   *
   * ⚠️ **O ponto é pista rápida, não o portador do significado.** Medido, ponto
   * contra o próprio chip: `done` 3.36:1, `missing` 3.38:1, `neutral` 4.46:1 — e
   * `running` **2.21:1**, que é fraco. Nenhum laranja da paleta alcança 3:1 sobre
   * fundo alaranjado claro (testados `orange` 2.42 e o chip em /5, 2.54). Fica
   * assim de propósito: quem lê o rótulo tem a informação inteira, e a
   * alternativa seria um segundo laranja no produto — a deriva que este épico
   * existe para corrigir.
   *
   * ⚠️ `yellow` saiu de status: 1.27:1 sobre branco, invisível até como marcador.
   * Onde significava "pendente", use `running`. O amarelo segue livre para
   * ilustração e gráfico.
   *
   * ---
   *
   * **`icon`: a cor do status quando ele é um ícone sozinho sobre branco.**
   *
   * ⚠️ **Não é o `dot` com outro prefixo.** O ponto vive sobre o próprio chip
   * (o `bg-` da cor a 10%), o ícone vive sobre a superfície branca — são fundos
   * diferentes, então são medições diferentes. Sobre branco: `green3` 3.77:1,
   * `red` 3.88:1, `grey` 4.95:1, `darkGrey` 7.57:1 — todos passam no limite de
   * 3:1 de componente gráfico.
   *
   * ⚠️ **`running` é a exceção, e ela é obrigatória: nenhum laranja desta
   * paleta alcança 3:1 sobre branco** — `darkOrange` 2.45:1 e `orange` 2.68:1.
   * Um ícone laranja seria um status que parte das pessoas simplesmente não
   * enxerga. As duas saídas seriam inventar um laranja escuro (a deriva de
   * paleta que este arquivo existe para impedir) ou tirar a cor do papel de
   * portador. É a segunda: `running` sai em `darkGrey`, e **quem distingue o
   * estado é a forma do ícone** — um relógio não se confunde com um cadeado
   * nem com um check. A cor é reforço.
   */
  status: {
    done: { chip: "bg-green3/10", dot: "bg-green3", icon: "text-green3" },
    // ⚠️ `icon` **não** acompanha o `dot` aqui, e é de propósito. Ver o bloco
    // sobre `icon` logo acima do `status`.
    running: {
      chip: "bg-orange/10",
      dot: "bg-darkOrange",
      icon: "text-darkGrey",
    },
    missing: { chip: "bg-red/10", dot: "bg-red", icon: "text-red" },
    /**
     * "Começou, mas ainda está longe" — o estágio antes do `running`.
     *
     * ⚠️ Existe porque `running` sozinho não dava conta: no banco de provas,
     * "Em cadastro" e "Em validação" são estados diferentes e saíam com o
     * mesmo chip laranja, indistinguíveis de relance.
     *
     * ⚠️ `blueGeo` é cor **da paleta da marca**, não o `blue-500` do Tailwind
     * que vazou para o `Select` do V1 — a catraca continua barrando aquele.
     * Medido: 3.54:1 sobre branco, ponto contra o próprio chip **3.18:1** (o
     * melhor de todos os tons daqui) e `marine` sobre o chip 13.52:1.
     */
    info: { chip: "bg-blueGeo/10", dot: "bg-blueGeo", icon: "text-blueGeo" },
    // `grey`, e não `gray2`: sobre `bg-lightGray/40` o gray2 dá 2.19:1 e o grey
    // dá 4.46:1, sem sair da paleta nem mudar a família de cor.
    neutral: { chip: "bg-lightGray/40", dot: "bg-grey", icon: "text-grey" },
  },
} as const;

export type StatusV2 = keyof typeof dashV2.status;
