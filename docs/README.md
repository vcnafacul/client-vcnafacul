# 📖 Documentação - VcNaFacul Client

Bem-vindo à documentação do frontend do projeto VcNaFacul!

## 📑 Índice de Documentos

### 🎣 Desenvolvimento

- **[Custom Hooks](./CUSTOM_HOOKS.md)** - Guia completo de hooks customizados implementados e oportunidades de refatoração
  - Hooks implementados: `useToastAsync`, `useModal`
  - Hooks pendentes: `usePaginatedData`, `useFormChanges`
  - Análise de padrões e melhores práticas

### 🚀 Quick Start

#### Hooks Implementados

1. **useToastAsync** - Simplifica operações assíncronas com feedback visual
```typescript
import { useToastAsync } from '@/hooks/useToastAsync';

const executeAsync = useToastAsync();
await executeAsync({
  action: () => minhaAPI(),
  loadingMessage: "Processando...",
  successMessage: "Sucesso!",
});
```

2. **useModal/useModals** - Gerenciamento de estados de modais
```typescript
import { useModals } from '@/hooks/useModal';

const modals = useModals(['create', 'edit', 'delete']);
<Modal isOpen={modals.create.isOpen} onClose={modals.create.close} />
```

---

## 🎯 Objetivos da Documentação

- ✅ Documentar padrões e decisões técnicas
- ✅ Facilitar onboarding de novos desenvolvedores
- ✅ Identificar oportunidades de refatoração
- ✅ Manter histórico de melhorias
- ✅ Compartilhar conhecimento da equipe

---

## 🤝 Contribuindo

Ao adicionar nova documentação:

1. Use Markdown para formatação
2. Inclua exemplos de código práticos
3. Atualize este README com links
4. Mantenha a consistência no formato
5. Documente decisões técnicas importantes

---

## 📊 Estrutura do Projeto

```
client-vcnafacul2/
├── docs/                    # 📖 Documentação
│   ├── README.md           # Este arquivo
│   └── CUSTOM_HOOKS.md     # Guia de hooks customizados
├── src/
│   ├── hooks/              # 🎣 Hooks customizados
│   │   ├── useToastAsync.ts
│   │   ├── useModal.ts
│   │   └── use-mobile.tsx
│   ├── components/         # 🧩 Componentes reutilizáveis
│   ├── pages/              # 📄 Páginas da aplicação
│   ├── services/           # 🌐 Chamadas de API
│   ├── store/              # 💾 Estado global (Zustand)
│   └── utils/              # 🛠️ Utilitários
└── ...
```

---

**Última atualização:** 2025-10-30


