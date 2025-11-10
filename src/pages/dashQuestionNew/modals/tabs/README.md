# 📋 Estrutura de Tabs - Modal de Questões

Este documento descreve a arquitetura modular e independente das tabs do modal de questões.

## 🎯 Filosofia

Cada tab é **completamente independente** e possui:
- ✅ Seu próprio formulário (React Hook Form)
- ✅ Seu próprio estado local
- ✅ Sua própria API endpoint
- ✅ Suas próprias validações (Yup)
- ✅ Seus próprios tipos TypeScript

## 🏗️ Estrutura de Arquivos

```
tabs/
├── TabClassificacao/
│   ├── index.tsx                 # Componente principal da tab
│   ├── useClassificacaoForm.ts   # Hook com lógica do formulário
│   ├── schema.ts                 # Validações Yup
│   └── types.ts                  # Tipos TypeScript
├── TabConteudo/
│   ├── index.tsx                 # Componente principal da tab
│   ├── useConteudoForm.ts        # Hook com lógica do formulário
│   ├── schema.ts                 # Validações Yup
│   └── types.ts                  # Tipos TypeScript
└── TabImagens/
    └── index.tsx                 # (Futuro)
```

## 🔌 APIs Endpoint

### 1️⃣ Classificação
```typescript
PATCH /api/questions/:id/classification

Body: {
  prova: string,
  numero: number,
  enemArea: string,
  materia: string,
  frente1: string,
  frente2?: string,
  frente3?: string,
  provaClassification: boolean,
  subjectClassification: boolean
}
```

**Arquivo:** `src/services/question/updateClassification.ts`

### 2️⃣ Conteúdo
```typescript
PATCH /api/questions/:id/content

Body: {
  textoQuestao: string,
  pergunta?: string,
  textoAlternativaA: string,
  textoAlternativaB: string,
  textoAlternativaC: string,
  textoAlternativaD: string,
  textoAlternativaE: string,
  alternativa: string,
  textClassification: boolean,
  alternativeClassfication: boolean
}
```

**Arquivo:** `src/services/question/updateContent.ts`

### 3️⃣ Imagens (Futuro)
```typescript
PATCH /api/questions/:id/images

Body: {
  imageId: string,
  imageClassfication: boolean
}
```

## 📝 Schemas de Validação

### TabClassificacao
- **Campos obrigatórios:** prova, numero, enemArea, materia, frente1
- **Campos opcionais:** frente2, frente3
- **Validações:**
  - numero deve ser inteiro positivo > 0
  - Todos os IDs devem ter pelo menos 1 caractere

### TabConteudo
- **Campos obrigatórios:** textoQuestao, todas as 5 alternativas, alternativa correta
- **Campo opcional:** pergunta
- **Validações:**
  - textoQuestao: 10-5000 caracteres
  - Cada alternativa: 1-1000 caracteres
  - alternativa: deve ser exatamente "A", "B", "C", "D" ou "E"
  - Função auxiliar: `validateAlternativasUnicas()` para evitar duplicatas

## 🎨 Padrão de Implementação

Cada tab segue o mesmo padrão:

### 1. Schema (schema.ts)
```typescript
import * as yup from "yup";

export const [nome]Schema = yup.object({
  // Definições de campos
});

export type [Nome]FormData = yup.InferType<typeof [nome]Schema>;
```

### 2. Types (types.ts)
```typescript
export interface [Nome]FormData {
  // Campos do formulário
}

export interface Tab[Nome]Props {
  question: any;
  canEdit?: boolean;
}
```

### 3. Hook (use[Nome]Form.ts)
```typescript
export function use[Nome]Form({ question }) {
  const form = useForm({
    resolver: yupResolver([nome]Schema),
    defaultValues: { ... }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = async () => {
    // Chamar API específica
  };
  
  return {
    form,
    isEditing,
    handleEdit,
    handleSave,
    handleCancel
  };
}
```

### 4. Componente (index.tsx)
```typescript
export function Tab[Nome]({ question, canEdit }) {
  const {
    form,
    isEditing,
    handleSave,
    handleCancel
  } = use[Nome]Form({ question });
  
  return (
    <div>
      {/* Campos em modo view/edit */}
      
      {isEditing && (
        <ActionsBar
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
```

## ✅ Vantagens desta Abordagem

1. **Isolamento Total**: Uma tab não afeta as outras
2. **Desenvolvimento Incremental**: Implementa uma tab por vez
3. **Performance**: Salva apenas os dados modificados
4. **Testabilidade**: Testa cada tab isoladamente
5. **Manutenibilidade**: Mudanças são localizadas
6. **Escalabilidade**: Fácil adicionar novas tabs

## 🚀 Próximos Passos

- [x] Criar serviços de API (updateClassification, updateContent)
- [x] Criar schemas de validação
- [x] Criar tipos TypeScript
- [ ] Implementar hook useClassificacaoForm
- [ ] Implementar componente TabClassificacao completo
- [ ] Implementar hook useConteudoForm
- [ ] Implementar componente TabConteudo completo
- [ ] Implementar TabImagens (futuro)

## 📚 Referências

- Documentação: `/docs/REFATORACAO_MODAL_QUESTOES.md`
- Seção 7: Salvamento Granular por Tab
- React Hook Form: https://react-hook-form.com/
- Yup: https://github.com/jquense/yup

