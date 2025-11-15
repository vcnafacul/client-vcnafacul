# 🧪 Instruções para Testar Ganho de Performance

## ✅ Otimização Aplicada: `partnerPrepForm/index.tsx`

**Data:** Novembro 2025  
**Otimização:** Remoção de `flatMap` dentro do loop + Memoização

---

## 📊 O que foi otimizado?

### Antes da Otimização ❌

```typescript
{entities.map((entity) => {
  // ❌ PROBLEMA: flatMap executado N vezes!
  const allQuestions = entities.flatMap(
    (section) => section.questions
  );

  return (
    <ExpandableSection
      allQuestions={allQuestions}
      // ❌ Função inline recriada a cada render
      setSection={(section) => {
        setEntities((prev) =>
          prev.map((e) => e._id === section._id ? section : e)
        );
      }}
    />
  );
})}
```

**Problema:**
- Com 10 seções e 20 questões cada:
  - `flatMap` executado **10 vezes** (uma por seção)
  - **200 operações** desnecessárias por render
  - Funções inline recriadas = re-renders em cascata

### Depois da Otimização ✅

```typescript
// ✅ Computado apenas 1 vez quando entities mudar
const allQuestions = useMemo(() => {
  return entities.flatMap((section) => section.questions);
}, [entities]);

// ✅ Referência estável
const handleSetSection = useCallback((section: SectionForm) => {
  setEntities((prev) =>
    prev.map((e) => (e._id === section._id ? section : e))
  );
}, []);

// ✅ Usa versões memoizadas
{entities.map((entity) => (
  <ExpandableSection
    allQuestions={allQuestions}
    setSection={handleSetSection}
  />
))}
```

**Solução:**
- `flatMap` executado apenas **1 vez**
- Handlers com referência estável
- Previne re-renders desnecessários

---

## 🧪 Como Testar

### Passo 1: Preparar o Ambiente

```bash
# 1. Certifique-se de estar no diretório correto
cd /home/fernando/vcnafacul/client-vcnafacul2

# 2. Instale dependências (se necessário)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

### Passo 2: Abrir React DevTools

1. Abra o Chrome/Firefox
2. Acesse a aplicação (geralmente `http://localhost:5173`)
3. Abra o DevTools (F12)
4. Vá para a aba **"Profiler"** (React DevTools extension)

### Passo 3: Realizar Medições

#### A) Teste de Renderização Inicial

1. **No React DevTools Profiler:**
   - Clique no botão ⚫ (Record) para iniciar
   - Navegue para a página `/partner/prep-form`
   - Aguarde a página carregar completamente
   - Clique no botão ⏹️ (Stop) para finalizar

2. **Analise os resultados:**
   - Procure pelo componente `PartnerPrepForm`
   - Veja o tempo de render (em ms)
   - Anote o valor

**Esperado:**
- ✅ Tempo de render < 50ms (com otimização)
- ❌ Tempo seria ~200-500ms (sem otimização)

#### B) Teste de Interação (Expandir Seções)

1. **No React DevTools Profiler:**
   - Inicie a gravação ⚫
   - Clique para expandir uma seção
   - Pare a gravação ⏹️

2. **Analise:**
   - Veja quantos componentes re-renderizaram
   - Procure por `ExpandableSection`
   - Verifique se outros componentes re-renderizaram desnecessariamente

**Esperado:**
- ✅ Apenas a seção clicada deve re-renderizar
- ✅ Outras seções NÃO devem re-renderizar
- ❌ Sem otimização: todas as seções re-renderizam

#### C) Teste com Muitas Seções

Se possível, teste com dados de produção ou mock com:
- 20+ seções
- 50+ questões no total

**Como criar mock data (se necessário):**

```typescript
// Adicionar temporariamente no componente
useEffect(() => {
  if (entities.length === 0) {
    // Mock de 20 seções para teste
    const mockSections = Array.from({ length: 20 }, (_, i) => ({
      _id: `section-${i}`,
      name: `Seção ${i + 1}`,
      active: true,
      questions: Array.from({ length: 10 }, (_, j) => ({
        _id: `question-${i}-${j}`,
        text: `Pergunta ${j + 1}`,
        active: true,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setEntities(mockSections);
  }
}, []);
```

### Passo 4: Medições com Console Performance

```typescript
// Adicionar temporariamente no início do componente render
console.time('PartnerPrepForm-Render');

// No final do return
console.timeEnd('PartnerPrepForm-Render');
```

Verifique o console do navegador:
- ✅ Com otimização: 5-20ms
- ❌ Sem otimização: 50-200ms+

---

## 📊 Métricas Esperadas

### Renderização Inicial

| Métrica | Antes | Depois (Esperado) | Real (Medido) |
|---------|-------|-------------------|---------------|
| Tempo de render | ~200-500ms | < 50ms | [ ] ms |
| Execuções de flatMap | N (ex: 10x) | 1x | ✅ |
| Re-renders filho | Todos | Nenhum | [ ] |

### Interação (Expandir/Recolher)

| Métrica | Antes | Depois (Esperado) | Real (Medido) |
|---------|-------|-------------------|---------------|
| Componentes re-renderizados | Todos (~10-20) | Apenas 1 | [ ] |
| Tempo de interação | ~100-200ms | < 30ms | [ ] ms |

### Com 20 Seções

| Métrica | Antes | Depois (Esperado) | Real (Medido) |
|---------|-------|-------------------|---------------|
| flatMap execuções | 20x | 1x | ✅ |
| Tempo total render | ~1000ms+ | < 100ms | [ ] ms |
| FPS durante scroll | ~30fps | 60fps | [ ] fps |

---

## 🔍 Validações Adicionais

### 1. Verificar no Chrome DevTools Performance

```bash
1. F12 > Performance tab
2. Clique no botão Record (⚫)
3. Navegue para a página
4. Interact com a interface
5. Pare o record (⏹️)
6. Analise o Flame Chart
```

**Procure por:**
- ✅ Menos tempo gasto em "Scripting" (amarelo)
- ✅ Menos "Recalculate Style" e "Layout"
- ✅ Mais tempo em "Idle" (cinza)

### 2. Verificar Memória

```bash
1. F12 > Memory tab
2. Tire um Heap Snapshot antes
3. Interaja com a página (expandir/recolher seções)
4. Tire outro Heap Snapshot
5. Compare os dois
```

**Esperado:**
- ✅ Sem vazamento de memória
- ✅ Menos objetos na memória
- ✅ Garbage collector mais eficiente

### 3. Lighthouse (Performance Score)

```bash
# Rodar Lighthouse
npm run build
npm run preview

# Em outro terminal
npx lighthouse http://localhost:4173/partner/prep-form --view
```

**Esperado:**
- ✅ Performance Score: 90+
- ✅ Time to Interactive: < 3.5s
- ✅ Total Blocking Time: < 200ms

---

## ✅ Checklist de Validação

- [ ] Renderização inicial < 50ms
- [ ] Apenas componente interagido re-renderiza
- [ ] flatMap executado apenas 1 vez
- [ ] Sem re-renders em cascata
- [ ] Lighthouse score 90+
- [ ] Experiência visual mais fluida
- [ ] Scroll suave (60fps)
- [ ] Sem warnings no console

---

## 🐛 Troubleshooting

### Se não ver melhoria:

1. **Limpar cache do browser:**
   ```bash
   Ctrl + Shift + Delete > Limpar cache
   ```

2. **Rebuild do projeto:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Verificar se as otimizações foram aplicadas:**
   ```typescript
   // Adicionar console.log temporário
   const allQuestions = useMemo(() => {
     console.log('🔄 allQuestions recalculado!');
     return entities.flatMap((section) => section.questions);
   }, [entities]);
   ```
   - Deve aparecer apenas **1 vez** por mudança em entities
   - Se aparecer múltiplas vezes, algo está errado

4. **Verificar dependências do useMemo:**
   ```typescript
   // ✅ Correto
   useMemo(() => { ... }, [entities]);
   
   // ❌ Errado (sempre recalcula)
   useMemo(() => { ... }, [entities, outraCoisa]);
   ```

### Se houver erros:

1. **Erro de tipo TypeScript:**
   ```bash
   npm run build
   # Verificar se há erros de tipo
   ```

2. **Erro em runtime:**
   - Verifique o console do browser
   - Verifique se `allQuestions` não é undefined
   - Verifique se `handleSetSection` está sendo chamado corretamente

---

## 📝 Documentar Resultados

Após os testes, documente as métricas reais no arquivo:
`docs/PERFORMANCE_OPTIMIZATION.md`

**Seção para atualizar:**

```markdown
#### 📈 Resultados Reais (Após Implementação)

**Ambiente de Teste:**
- Navegador: Chrome 120
- Número de seções testadas: 10
- Número de questões testadas: 200

**Métricas:**
- ✅ Tempo de renderização inicial: X ms (antes: Y ms)
- ✅ Ganho percentual: Z%
- ✅ flatMap execuções: 1x (antes: Nx)
- ✅ Re-renders evitados: N-1 componentes

**Conclusão:**
[Descrever se os ganhos foram conforme o esperado]
```

---

## 🎯 Próximos Passos

Se os resultados forem positivos:

1. ✅ Marcar otimização como validada no documento
2. 🔄 Passar para próxima otimização (Fase 1, Item 3: Debounce)
3. 📊 Compartilhar métricas com o time
4. 🚀 Aplicar pattern similar em outros componentes

Se os resultados não forem satisfatórios:

1. 🔍 Investigar com React DevTools Profiler
2. 📝 Documentar o problema encontrado
3. 🤔 Considerar otimizações adicionais (React.memo no ExpandableSection)

---

**Última atualização:** Novembro 2025  
**Status:** ⏳ Aguardando testes  
**Próxima ação:** Executar testes e documentar resultados

