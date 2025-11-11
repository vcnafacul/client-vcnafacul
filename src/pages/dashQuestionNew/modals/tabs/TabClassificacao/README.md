# 📋 Tab Classificação - Implementação Completa

## ✅ Status: IMPLEMENTADO

A Tab de Classificação está completamente implementada com capacidade de edição independente.

## 📁 Estrutura de Arquivos

```
TabClassificacao/
├── index.tsx                   ✅ Componente principal (view + edit)
├── useClassificacaoForm.ts     ✅ Hook com lógica do formulário
├── schema.ts                   ✅ Validações Yup
├── types.ts                    ✅ Tipos TypeScript
└── README.md                   ✅ Esta documentação
```

## 🎯 Funcionalidades Implementadas

### 1. Modo Visualização (View)
- ✅ Exibição de todos os campos de classificação
- ✅ Campos em formato somente leitura
- ✅ Link para visualizar prova (se disponível)
- ✅ Checkboxes de revisão desabilitados
- ✅ Botão "Editar Classificação" (apenas para usuários com permissão)

### 2. Modo Edição (Edit)
- ✅ Campos editáveis com validação em tempo real
- ✅ Dropdowns para:
  - Prova
  - Área ENEM
  - Disciplina
  - Frente Principal
  - Frente Secundária (opcional)
  - Frente Terciária (opcional)
- ✅ Input numérico para número da questão
- ✅ Checkboxes editáveis para flags de revisão:
  - provaClassification
  - subjectClassification

### 3. Validações
- ✅ Campos obrigatórios: prova, numero, enemArea, materia, frente1
- ✅ Número deve ser inteiro positivo > 0
- ✅ Validação em tempo real (onChange)
- ✅ Mensagens de erro específicas por campo
- ✅ Indicador visual de campos inválidos (borda vermelha)

### 4. Estado e Feedback
- ✅ Indicador "Modo Edição" quando ativo
- ✅ Indicador "Alterações não salvas" quando isDirty
- ✅ Botões desabilitados quando salvando
- ✅ Loading spinner durante salvamento
- ✅ Toast de sucesso/erro após salvar

### 5. Ações
- ✅ **Editar**: Ativa modo edição
- ✅ **Salvar**: Envia apenas dados desta tab para API
- ✅ **Cancelar**: Descarta alterações e volta ao modo view

## 🔌 API Endpoint

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

**Serviço:** `src/services/question/updateClassification.ts`

## 🎨 Componentes UI Utilizados

- `Card` / `CardHeader` / `CardContent` - Layout
- `Button` - Ações
- `Input` - Campos de texto/número
- `Select` - Dropdowns
- `Checkbox` - Flags de revisão
- `Loader2` - Loading spinner
- `AlertCircle` - Ícone de erro

## 📊 Fluxo de Uso

### Visualização → Edição → Salvamento

```
1. Usuário visualiza a questão (modo view)
   ↓
2. Clica em "Editar Classificação" (se tem permissão)
   ↓
3. Campos ficam editáveis
   ↓
4. Usuário modifica campos
   ↓
5. Validações ocorrem em tempo real
   ↓
6. Usuário clica em "Salvar Classificação"
   ↓
7. API é chamada (PATCH /classification)
   ↓
8. Toast de sucesso
   ↓
9. Volta ao modo view com dados atualizados
```

### Cancelamento

```
1. Usuário está editando
   ↓
2. Clica em "Cancelar"
   ↓
3. Alterações são descartadas
   ↓
4. Formulário volta aos valores originais
   ↓
5. Volta ao modo view
```

## 🔐 Permissões

A edição só está disponível para usuários com:
- `APROVAR_QUESTAO` **OU**
- `ADMIN`

Verificação feita em: `ModalQuestionDetailsRefactored.tsx`

```typescript
const canEdit = permissao["APROVAR_QUESTAO"] || permissao["ADMIN"];
```

## 📝 Dados dos Dropdowns

Os dados para popular os dropdowns vêm de:

```typescript
// Chamado em ModalQuestionDetailsRefactored.tsx
const infos = await getInfosQuestion(token);

// Estrutura esperada:
{
  provas: [{ _id, nome, filename }],
  enemAreas: ["Ciências da Natureza", "Ciências Humanas", ...],
  materias: [{ _id, nome }],
  frentes: [{ _id, nome }]
}
```

## 🧪 Testando

### Modo Visualização
1. Abrir modal de questão
2. Ver dados exibidos corretamente
3. Verificar que campos estão desabilitados
4. Verificar que botão "Editar" aparece (se tem permissão)

### Modo Edição
1. Clicar em "Editar Classificação"
2. Modificar campos
3. Verificar validações em tempo real
4. Tentar salvar com erros (deve bloquear)
5. Corrigir erros e salvar
6. Verificar toast de sucesso
7. Verificar que dados foram atualizados

### Cancelamento
1. Entrar no modo edição
2. Modificar campos
3. Clicar em "Cancelar"
4. Verificar que alterações foram descartadas

## 🐛 Tratamento de Erros

- ✅ Validação de formulário (Yup)
- ✅ Erros de API (toast)
- ✅ Campos inválidos destacados
- ✅ Mensagens de erro específicas
- ✅ Try/catch em operações assíncronas

## 🚀 Próximos Passos

- ⏳ Implementar Tab Conteúdo (Opção B)
- ⏳ Implementar Tab Imagens
- ⏳ Adicionar confirmação ao cancelar com mudanças
- ⏳ Adicionar modal de confirmação ao sair com alterações não salvas
- ⏳ Implementar salvamento automático (auto-save)

## 📚 Referências

- Documentação geral: `/docs/REFATORACAO_MODAL_QUESTOES.md`
- README geral: `/src/pages/dashQuestionNew/modals/tabs/README.md`
- Hook Form: https://react-hook-form.com/
- Yup: https://github.com/jquense/yup

---

**Data de Implementação:** Novembro 2025  
**Status:** ✅ Concluído e Testado  
**Próximo:** Opção B - Tab Conteúdo

