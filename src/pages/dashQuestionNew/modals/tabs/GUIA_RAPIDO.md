# 🚀 Guia Rápido - Modo de Edição

## ✅ Como Entrar no Modo Edição

### 1️⃣ Tab Classificação

1. **Abrir o modal** da questão
2. **Ir para a tab "Classificação"**
3. **Verificar se tem permissão** (`APROVAR_QUESTAO` ou `ADMIN`)
4. **Clicar no botão "Editar Classificação"** (canto superior direito)
5. ✨ Campos ficam editáveis!

```
┌──────────────────────────────────────────┐
│ 📋 Informações da Prova                  │
│                    [Editar Classificação]│ ← CLICAR AQUI
├──────────────────────────────────────────┤
│ Prova: [Dropdown editável]              │
│ Número: [Input editável]                │
│ ...                                      │
└──────────────────────────────────────────┘
```

### 2️⃣ Tab Conteúdo

1. **Abrir o modal** da questão
2. **Ir para a tab "Conteúdo"**
3. **Verificar se tem permissão** (`APROVAR_QUESTAO` ou `ADMIN`)
4. **Clicar no botão "Editar Conteúdo"** (canto superior direito)
5. ✨ Campos ficam editáveis!

```
┌──────────────────────────────────────────┐
│ 📝 Enunciado da Questão                  │
│                        [Editar Conteúdo] │ ← CLICAR AQUI
├──────────────────────────────────────────┤
│ Texto da Questão: [Textarea editável]   │
│ A) (●) Correta [Input editável]         │
│ B) ( ) Correta [Input editável]         │
│ ...                                      │
└──────────────────────────────────────────┘
```

---

## 🔑 Verificação de Permissões

O botão **"Editar"** só aparece se o usuário tiver uma destas permissões:

```typescript
// Em ModalQuestionDetailsRefactored.tsx
const canEdit = permissao["APROVAR_QUESTAO"] || permissao["ADMIN"];
```

### Cenários:

| Permissão | Botão Aparece? | Pode Editar? |
|-----------|----------------|--------------|
| `ADMIN` | ✅ Sim | ✅ Sim |
| `APROVAR_QUESTAO` | ✅ Sim | ✅ Sim |
| Sem permissão | ❌ Não | ❌ Não |

---

## 🎯 Fluxo Completo de Edição

### Passo a Passo:

```
1. Modal Aberto (Modo Visualização)
   ↓
2. Clicar em "Editar [Tab]"
   ↓
3. Campos ficam editáveis
   Badge "Modo Edição" aparece
   ↓
4. Modificar campos desejados
   Validação em tempo real
   ↓
5. Opções:
   
   A) Salvar:
      - Clicar em "Salvar [Tab]"
      - API é chamada (PATCH)
      - Toast de sucesso
      - Volta ao modo visualização
   
   B) Cancelar:
      - Clicar em "Cancelar"
      - Alterações descartadas
      - Volta ao modo visualização
```

---

## 🛠️ Problemas Corrigidos

### ✅ RadioGroupItem

**Problema:**
```typescript
// ❌ ANTES - Não existia no projeto
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
```

**Solução:**
```typescript
// ✅ DEPOIS - Usando input radio nativo
<input
  type="radio"
  value={alt.letra}
  checked={field.value === alt.letra}
  onChange={(e) => field.onChange(e.target.value)}
  className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
/>
```

### ✅ Como Entrar no Modo Edição

**Resposta:** Clicar no botão "Editar" que aparece no canto superior direito de cada tab (se tiver permissão).

---

## 📊 Estrutura Visual do Modo Edição

### Modo Visualização (Padrão):
```
┌──────────────────────────────────────────┐
│ 📋 Tab Title            [Editar ✏️]     │ ← Botão aparece aqui
├──────────────────────────────────────────┤
│ Campo 1: [Valor somente leitura]        │
│ Campo 2: [Valor somente leitura]        │
│ ...                                      │
└──────────────────────────────────────────┘
```

### Modo Edição (Após clicar em "Editar"):
```
┌──────────────────────────────────────────┐
│ 📋 Tab Title   [Modo Edição]            │ ← Badge de status
├──────────────────────────────────────────┤
│ Campo 1: [Input editável        ]       │
│ Campo 2: [Input editável        ]       │
│ ...                                      │
├──────────────────────────────────────────┤
│ ⚠️ Alterações não salvas                 │
│               [Cancelar] [Salvar Tab]    │ ← Barra de ações
└──────────────────────────────────────────┘
```

---

## 🎨 Indicadores Visuais

### Durante Edição:

| Indicador | Quando Aparece | Cor/Estilo |
|-----------|----------------|------------|
| **"Modo Edição"** | Sempre que edita | Azul (badge) |
| **"Alterações não salvas"** | Quando modifica campos | Amarelo (badge) |
| **Borda vermelha** | Campo com erro | Vermelho |
| **Mensagem de erro** | Abaixo do campo inválido | Vermelho com ícone |
| **"Salvando..."** | Durante salvamento | Loading spinner |

---

## ⌨️ Exemplos de Uso

### Exemplo 1: Editar Classificação

```typescript
// 1. Abrir modal
<ModalQuestionDetailsRefactored
  isOpen={true}
  onClose={() => {}}
  questionId="123abc"
/>

// 2. Ir para tab "Classificação"
// 3. Clicar em "Editar Classificação"
// 4. Modificar prova, número, área ENEM, etc.
// 5. Clicar em "Salvar Classificação"

// Resultado: PATCH /api/questions/123abc/classification
```

### Exemplo 2: Editar Conteúdo

```typescript
// 1. Abrir modal
<ModalQuestionDetailsRefactored
  isOpen={true}
  onClose={() => {}}
  questionId="456def"
/>

// 2. Ir para tab "Conteúdo"
// 3. Clicar em "Editar Conteúdo"
// 4. Modificar texto da questão
// 5. Modificar alternativas
// 6. Selecionar alternativa correta via radio button
// 7. Clicar em "Salvar Conteúdo"

// Resultado: PATCH /api/questions/456def/content
```

---

## 🐛 Troubleshooting

### Problema: Botão "Editar" não aparece

**Causa:** Usuário sem permissão

**Solução:** 
1. Verificar permissões do usuário
2. Garantir que tem `APROVAR_QUESTAO` ou `ADMIN`
3. Fazer login com usuário com permissão adequada

### Problema: Não consigo salvar

**Causas possíveis:**
1. ❌ Campos obrigatórios vazios
2. ❌ Validação de tamanho de texto
3. ❌ Alternativa correta não selecionada

**Soluções:**
1. ✅ Preencher todos os campos obrigatórios (marcados com *)
2. ✅ Respeitar limites de caracteres
3. ✅ Selecionar uma alternativa como correta

### Problema: Erros de validação

**Como ver erros:**
- Campos com erro têm **borda vermelha**
- Mensagem de erro aparece **abaixo do campo**
- Ícone ⚠️ indica problema

**Como corrigir:**
- Ler mensagem de erro
- Ajustar o campo conforme indicado
- Validação acontece em tempo real

---

## 📱 Responsividade

O modo de edição funciona em:
- ✅ Desktop (layout 2 colunas)
- ✅ Tablet (layout 1-2 colunas)
- ✅ Mobile (layout 1 coluna)

---

## 🎓 Resumo Rápido

### Para Editar uma Tab:
1. **Abrir modal** da questão
2. **Ir para a tab** desejada
3. **Clicar em "Editar"** (se tiver permissão)
4. **Modificar campos**
5. **Salvar** ou **Cancelar**

### Cada Tab é Independente:
- ✅ Salvamento separado
- ✅ Validações próprias
- ✅ API própria
- ✅ Estado independente

### Sempre Lembrar:
- 🔒 Precisa de permissão para editar
- 💾 Salvamento só da tab atual
- ✅ Validação em tempo real
- ⚠️ Indicadores visuais ajudam

---

## 🚀 Tudo Pronto!

O modo de edição está **100% funcional**! 

Basta:
1. Ter permissão
2. Clicar em "Editar"
3. Modificar
4. Salvar

**Simples assim!** 🎉

