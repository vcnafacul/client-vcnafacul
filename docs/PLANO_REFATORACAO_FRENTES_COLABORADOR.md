# 📋 Plano de Refatoração - Frentes do Colaborador

## 🔍 Análise da Implementação Atual

### Estado Atual (Implementação Existente)

A funcionalidade de frentes do colaborador foi implementada da seguinte forma:

#### 1. **Estrutura de Dados**
- `userAccount.collaboratorFrentes`: Array de IDs das frentes selecionadas
- Armazenado apenas no estado local (`userAccount`), não no store global
- Carregado do backend através do serviço `me()`

#### 2. **Componente Principal** (`src/pages/account/index.tsx`)
- **Localização atual**: As frentes aparecem abaixo do formulário (`AccountForm`)
- **Lógica de salvamento**: Integrada no método `update()`, que salva frentes apenas se `hasFrentesChange` for `true`
- **Estado gerenciado**:
  - `selectedFrentesIds`: IDs das frentes selecionadas
  - `hasFrentesChange`: Flag para detectar mudanças

#### 3. **Componente de Edição** (`CollaboratorFrentes.tsx`)
- **Funcionalidades**:
  - Input de busca para encontrar frentes
  - Dropdown com resultados filtrados
  - Exibição de frentes selecionadas como badges
  - Botão de remoção (X) em cada badge
- **Hook utilizado**: `useFrentesSelection` que gerencia:
  - Carregamento de todas as frentes disponíveis
  - Estado das frentes selecionadas
  - Callbacks para adicionar/remover frentes

#### 4. **Fluxo de Dados Atual**
```
1. Carregamento inicial (useEffect):
   - Busca dados do usuário via `me(token)`
   - Inicializa `selectedFrentesIds` com `userAccount.collaboratorFrentes`
   
2. Edição:
   - Usuário interage com `CollaboratorFrentes`
   - `handleFrentesChange` atualiza `selectedFrentesIds` e `hasFrentesChange`
   
3. Salvamento:
   - Ao clicar em "Salvar" no formulário
   - Se `hasFrentesChange === true`, chama `updateCollaboratorFrentes`
   - Atualiza estado local após sucesso
```

---

## 🎯 Objetivo da Refatoração

### Mudanças Solicitadas

1. **Nova Localização Visual**:
   - As frentes devem aparecer **abaixo da foto do perfil** (lado esquerdo)
   - Layout similar ao perfil do GitHub (informações do perfil abaixo da foto)

2. **Modo de Exibição**:
   - **Modo Visualização**: Mostrar apenas as frentes já selecionadas (read-only)
   - **Modo Edição**: Abrir em um modal quando clicar no botão "Editar"

3. **Separação de Responsabilidades**:
   - Componente de visualização separado do componente de edição
   - Modal contém toda a lógica de edição atual

---

## 📐 Plano de Implementação

### Fase 1: Criar Componente de Visualização

**Arquivo**: `src/pages/account/components/CollaboratorFrentesDisplay.tsx`

**Responsabilidades**:
- Exibir as frentes selecionadas como badges (somente leitura)
- Mostrar mensagem quando não houver frentes
- Layout compacto e visualmente agradável

**Props**:
```typescript
interface CollaboratorFrentesDisplayProps {
  frentesIds: string[];
  token: string;
}
```

**Funcionalidades**:
- Carregar dados completos das frentes a partir dos IDs
- Exibir badges com nome da frente e matéria
- Loading state enquanto carrega
- Mensagem quando `frentesIds` estiver vazio

---

### Fase 2: Criar Modal de Edição

**Arquivo**: `src/pages/account/components/ModalEditFrentes.tsx`

**Responsabilidades**:
- Encapsular o componente `CollaboratorFrentes` atual
- Gerenciar estado interno de edição
- Botões de "Salvar" e "Cancelar"
- Resetar mudanças ao cancelar

**Props**:
```typescript
interface ModalEditFrentesProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  initialSelectedIds: string[];
  onSave: (selectedIds: string[]) => Promise<void>;
}
```

**Funcionalidades**:
- Usar `Dialog` do shadcn/ui (já existe no projeto)
- Conter `CollaboratorFrentes` dentro do modal
- Gerenciar estado de edição independente do estado principal
- Ao salvar: chamar `onSave` e fechar modal
- Ao cancelar: resetar mudanças e fechar modal

---

### Fase 3: Refatorar Componente Principal

**Arquivo**: `src/pages/account/index.tsx`

**Modificações**:

1. **Adicionar modal ao useModals**:
   ```typescript
   const modals = useModals(["deleteImage", "editFrentes"]);
   ```

2. **Mover seção de frentes para lado esquerdo**:
   - Remover a seção atual que está abaixo do formulário
   - Adicionar abaixo da foto (dentro do `div` do cabeçalho)
   - Apenas para colaboradores

3. **Criar função de salvamento de frentes**:
   ```typescript
   const handleSaveFrentes = async (frentesIds: string[]) => {
     await executeAsync({
       action: () => updateCollaboratorFrentes(frentesIds, token),
       loadingMessage: "Salvando frentes de afinidade...",
       successMessage: "Frentes salvas com sucesso",
       errorMessage: (error: Error) => error.message,
       onSuccess: () => {
         setUserAccount({ ...userAccount!, collaboratorFrentes: frentesIds });
         setSelectedFrentesIds(frentesIds);
         setHasFrentesChange(false);
       },
     });
   };
   ```

4. **Remover lógica de frentes do método `update()`**:
   - Remover a verificação de `hasFrentesChange` do método `update()`
   - O salvamento agora será feito diretamente pelo modal

5. **Atualizar layout**:
   ```tsx
   <div className="flex flex-row md:flex-col gap-4">
     {/* Foto */}
     {userAccount?.collaborator ? (
       <ImageProfile ... />
     ) : (
       <LogoIcon ... />
     )}
     
     {/* Informações do usuário (mobile) */}
     <div className="flex flex-col px-8 pt-4 md:hidden ...">
       {/* Nome, sobrenome, descrição */}
     </div>
   </div>
   
   {/* NOVA SEÇÃO: Frentes (apenas colaborador, desktop) */}
   {userAccount?.collaborator && (
     <div className="hidden md:block mt-4">
       <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-semibold text-gray-700">
           Frentes de Afinidade
         </h3>
         <Button
           variant="outline"
           size="sm"
           onClick={modals.editFrentes.open}
         >
           Editar
         </Button>
       </div>
       <CollaboratorFrentesDisplay
         frentesIds={userAccount.collaboratorFrentes || []}
         token={token}
       />
     </div>
   )}
   ```

6. **Adicionar modal**:
   ```tsx
   <ModalEditFrentes
     isOpen={modals.editFrentes.isOpen}
     onClose={modals.editFrentes.close}
     token={token}
     initialSelectedIds={userAccount?.collaboratorFrentes || []}
     onSave={handleSaveFrentes}
   />
   ```

---

### Fase 4: Ajustes no Hook useFrentesSelection

**Arquivo**: `src/pages/account/hooks/useFrentesSelection.ts`

**Verificar se precisa de ajustes**:
- O hook já suporta `reset()` que pode ser usado no modal ao cancelar
- Verificar se o callback `onSelectionChange` funciona corretamente no contexto do modal

---

### Fase 5: Responsividade

**Considerações**:
- **Desktop**: Frentes aparecem abaixo da foto no lado esquerdo
- **Mobile**: Considerar onde colocar as frentes (talvez abaixo da foto também, mas com layout adaptado)
- Botão "Editar" deve ser acessível em ambos os layouts

---

## 🎨 Estrutura de Arquivos Final

```
src/pages/account/
├── index.tsx (modificado)
├── components/
│   ├── CollaboratorFrentes.tsx (mantido - usado no modal)
│   ├── CollaboratorFrentesDisplay.tsx (NOVO - visualização)
│   └── ModalEditFrentes.tsx (NOVO - modal de edição)
└── hooks/
    └── useFrentesSelection.ts (mantido)
```

---

## 🔄 Fluxo de Dados Novo

```
1. Carregamento inicial:
   - Busca dados do usuário via `me(token)`
   - `CollaboratorFrentesDisplay` recebe `userAccount.collaboratorFrentes`
   - Carrega dados completos das frentes para exibição

2. Visualização:
   - Usuário vê as frentes abaixo da foto
   - Apenas leitura, sem interação

3. Edição:
   - Usuário clica em "Editar"
   - Modal abre com `CollaboratorFrentes` (componente atual)
   - Estado de edição gerenciado dentro do modal
   - Usuário faz alterações

4. Salvamento:
   - Ao clicar em "Salvar" no modal
   - Modal chama `handleSaveFrentes` do componente pai
   - Atualiza backend via `updateCollaboratorFrentes`
   - Atualiza estado local (`userAccount` e `selectedFrentesIds`)
   - Fecha modal
   - `CollaboratorFrentesDisplay` atualiza automaticamente

5. Cancelamento:
   - Ao clicar em "Cancelar" ou fechar modal
   - Resetar estado interno do modal
   - Fechar modal sem salvar
```

---

## ✅ Checklist de Implementação

- [ ] Criar `CollaboratorFrentesDisplay.tsx`
  - [ ] Carregar dados das frentes a partir dos IDs
  - [ ] Exibir badges com nome e matéria
  - [ ] Loading state
  - [ ] Estado vazio (sem frentes)

- [ ] Criar `ModalEditFrentes.tsx`
  - [ ] Usar `Dialog` do shadcn/ui
  - [ ] Integrar `CollaboratorFrentes`
  - [ ] Botões de ação (Salvar/Cancelar)
  - [ ] Gerenciar estado interno
  - [ ] Resetar ao cancelar

- [ ] Refatorar `index.tsx`
  - [ ] Adicionar "editFrentes" ao `useModals`
  - [ ] Mover seção de frentes para lado esquerdo
  - [ ] Criar `handleSaveFrentes`
  - [ ] Remover lógica de frentes do `update()`
  - [ ] Remover `hasFrentesChange` e `handleFrentesChange` (se não usado)
  - [ ] Adicionar botão "Editar"
  - [ ] Integrar modal

- [ ] Testes
  - [ ] Visualização funciona corretamente
  - [ ] Modal abre e fecha
  - [ ] Edição funciona
  - [ ] Salvamento atualiza visualização
  - [ ] Cancelamento não salva mudanças
  - [ ] Responsividade (mobile/desktop)

---

## 🎯 Benefícios da Refatoração

1. **Melhor UX**: Layout mais limpo, similar ao GitHub
2. **Separação de Responsabilidades**: Visualização vs. Edição
3. **Performance**: Componente de visualização mais leve
4. **Manutenibilidade**: Código mais organizado e modular
5. **Reutilização**: Componentes podem ser reutilizados em outros contextos

---

## 📝 Notas Técnicas

- O componente `CollaboratorFrentes` atual será mantido e usado dentro do modal
- Não é necessário modificar o hook `useFrentesSelection`
- O serviço `updateCollaboratorFrentes` já existe e funciona corretamente
- Usar componentes do shadcn/ui já existentes (`Dialog`, `Button`, `Badge`)

