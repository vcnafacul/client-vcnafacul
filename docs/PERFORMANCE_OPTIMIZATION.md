# 🚀 Relatório de Otimização de Performance

**Data de Análise:** Novembro 2025  
**Versão do React:** 19.0.0  
**Status:** 📋 Pendente de Implementação

---

## 📋 Índice

- [Resumo Executivo](#resumo-executivo)
- [Gargalos Críticos (Prioridade Máxima)](#-gargalos-críticos-prioridade-máxima)
  - [1. Computação Pesada Dentro de Loop](#1-️-computação-pesada-dentro-de-loop)
  - [2. Carregamento de Múltiplas Imagens](#2-️-carregamento-de-múltiplas-imagens-sem-otimização)
  - [3. Re-renders Desnecessários](#3-️-re-renders-desnecessários-em-listas)
- [Gargalos Médios](#-gargalos-médios)
  - [4. Processamento Pesado em Charts](#4--processamento-pesado-em-rendercharts)
  - [5. Imagens sem Lazy Loading](#5-️-imagens-sem-lazy-loading)
- [Otimizações Gerais](#-otimizações-gerais)
  - [6. Code Splitting](#6--code-splitting-e-lazy-loading-de-rotas)
  - [7. Debounce em Inputs](#7--debounce-em-inputs-de-busca)
- [Plano de Ação](#-plano-de-ação)
- [Métricas de Acompanhamento](#-métricas-de-acompanhamento)

---

## 📊 Resumo Executivo

Este documento identifica os principais gargalos de performance encontrados no projeto VcNaFacul e propõe soluções práticas para cada um deles. As otimizações estão categorizadas por prioridade e impacto esperado.

### Impacto Total Estimado
- **Redução de tempo de renderização:** 70-90%
- **Redução de carregamento inicial:** 50-60%
- **Melhoria na interatividade:** 80%

---

## 🔴 Gargalos Críticos (Prioridade Máxima)

### 1. ⚠️ Computação Pesada Dentro de Loop

**Status:** ✅ **IMPLEMENTADO**  
**Impacto Estimado:** 90% de melhoria  
**Esforço:** Baixo (2-4 horas)

#### 📍 Localização
- **Arquivo:** `src/pages/partnerPrepForm/index.tsx`
- **Linhas:** 539-568

#### 🐛 Problema

```typescript
{entities.map((entity) => {
  // ❌ PROBLEMA: flatMap executado N vezes!
  const allQuestions = entities.flatMap(
    (section) => section.questions
  );

  return (
    <ExpandableSection
      key={entity._id}
      section={entity}
      allQuestions={allQuestions}
      // ❌ Função inline criada a cada render
      setSection={(section) => {
        setEntities((prev) =>
          prev.map((e) =>
            e._id === section._id ? section : e
          )
        );
      }}
      // ❌ Mais funções inline
      handleEditSection={() => {
        setSectionSelected(entity);
        modals.modalUpdateSection.open();
      }}
      // ... outras props
    />
  );
})}
```

**Impacto:**
- Se você tem 10 seções com 20 questões cada:
  - **200 operações de flatMap desnecessárias** em cada render
  - **10 funções inline** criadas (perde referência)
  - **Re-renders em cascata** nos componentes filhos

#### ✅ Solução

```typescript
export default function PartnerPrepForm() {
  const { data: { token } } = useAuthStore();
  
  // ✅ Memoizar allQuestions FORA do loop (computado apenas 1 vez)
  const allQuestions = useMemo(() => {
    return entities.flatMap((section) => section.questions);
  }, [entities]);

  // ✅ Memoizar handlers para manter referência estável
  const handleSetSection = useCallback((section: SectionForm) => {
    setEntities((prev) =>
      prev.map((e) => (e._id === section._id ? section : e))
    );
  }, []);

  const handleEditSectionFactory = useCallback((entity: SectionForm) => {
    return () => {
      setSectionSelected(entity);
      modals.modalUpdateSection.open();
    };
  }, [modals]);

  return (
    <TableBody>
      {entities.map((entity) => (
        <ExpandableSection
          key={entity._id}
          section={entity}
          allQuestions={allQuestions} // ✅ Referência estável
          setSection={handleSetSection} // ✅ Referência estável
          handleAddQuestion={handleAddQuestion}
          handleEditSection={handleEditSectionFactory(entity)}
          handleDeleteSection={handleDeleteSection}
          handleToggleSection={handleToggleSection}
          handleReorderQuestions={handleReorderQuestions}
          handleDuplicateSection={handleOpenDuplicateModal}
        />
      ))}
    </TableBody>
  );
}
```

#### 📈 Ganhos Esperados
- ✅ **90% de redução** no tempo de renderização da lista
- ✅ **Elimina N-1 computações** desnecessárias de flatMap
- ✅ **Previne re-renders** em componentes filhos

#### ✅ Checklist de Implementação
- [x] Adicionar `useMemo` para `allQuestions`
- [x] Adicionar `useCallback` para `handleSetSection`
- [x] Importar hooks necessários (`useMemo`, `useCallback`)
- [x] Remover `flatMap` de dentro do loop
- [x] Atualizar componente `CreateQuestion` para usar versão memoizada
- [ ] Testar com lista de 20+ seções
- [ ] Validar com React DevTools Profiler
- [ ] Medir métricas antes/depois

---

### 2. 🖼️ Carregamento de Múltiplas Imagens Sem Otimização

**Status:** 🔴 Crítico  
**Impacto Estimado:** 80% de melhoria  
**Esforço:** Médio (6-8 horas)

#### 📍 Localização
- **Arquivo:** `src/pages/studentsEnrolled/modals/printerStudentCards.tsx`
- **Linhas:** 138-186

#### 🐛 Problema

```typescript
useEffect(() => {
  const fetchAllPhotos = async () => {
    setIsLoading(true);
    try {
      // ❌ Carrega TODAS as fotos de uma vez!
      const fetchPhotos = entities
        .filter((entity) => entity.photo)
        .map(async (entity) => {
          const blob = await getProfilePhoto(entity.photo, token);
          // Conversão HEIC...
          return { id: entity.photo, url: URL.createObjectURL(convertedBlob) };
        });

      const results = await Promise.allSettled(fetchPhotos);
      // ...
    } finally {
      setIsLoading(false);
    }
  };
  fetchAllPhotos();
}, [entities, token]);
```

**Impacto:**
- **100 alunos = 100 requisições simultâneas** 🔥
- Bloqueia a interface durante o carregamento
- Alto uso de memória
- Timeout em redes lentas

#### ✅ Solução: Lazy Loading com Intersection Observer

```typescript
import { useIntersectionObserver } from 'react-intersection-observer';

export function PrinterStudentCards({ 
  isOpen, 
  handleClose, 
  entities 
}: PrinterStudentCardsProps) {
  const [photos, setPhotos] = useState<Map<string, string>>(new Map());
  const [loadingPhotos, setLoadingPhotos] = useState<Set<string>>(new Set());
  const { data: { token } } = useAuthStore();

  // ✅ Carregar foto individual sob demanda
  const loadPhoto = useCallback(async (photoId: string) => {
    if (photos.has(photoId) || loadingPhotos.has(photoId)) return;

    setLoadingPhotos(prev => new Set(prev).add(photoId));

    try {
      const blob = await getProfilePhoto(photoId, token);
      const fileType = blob.type;
      
      const convertedBlob =
        fileType === "image/heic" || fileType === "image/heif"
          ? ((await heic2any({ blob, toType: "image/jpeg" })) as Blob)
          : blob;
      
      const url = URL.createObjectURL(convertedBlob);
      setPhotos(prev => new Map(prev).set(photoId, url));
    } catch (error) {
      console.error("Erro ao carregar a imagem:", error);
    } finally {
      setLoadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  }, [token, photos, loadingPhotos]);

  // ✅ Carregar primeiras fotos em batch (viewport inicial)
  useEffect(() => {
    if (!isOpen) return;

    const loadInitialBatch = async () => {
      const photosToLoad = entities
        .filter(e => e.photo)
        .slice(0, 10); // Primeiras 10 fotos
      
      for (const entity of photosToLoad) {
        await loadPhoto(entity.photo);
      }
    };

    loadInitialBatch();
  }, [isOpen, entities]);

  // ✅ Cleanup para evitar vazamento de memória
  useEffect(() => {
    return () => {
      photos.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  // ✅ Componente de imagem lazy
  const LazyStudentPhoto = ({ photoId }: { photoId: string }) => {
    const { ref, inView } = useIntersectionObserver({
      threshold: 0,
      triggerOnce: true, // Carrega apenas uma vez
    });

    useEffect(() => {
      if (inView && photoId) {
        loadPhoto(photoId);
      }
    }, [inView, photoId]);

    const isLoading = loadingPhotos.has(photoId);
    const photoUrl = photos.get(photoId);

    return (
      <div ref={ref} style={{ minHeight: '100px' }}>
        {isLoading && <Skeleton variant="rectangular" width={80} height={100} />}
        {photoUrl && (
          <img 
            src={photoUrl} 
            alt="Student" 
            style={{ width: '80px', height: '100px', objectFit: 'cover' }}
          />
        )}
      </div>
    );
  };

  return (
    <ModalTemplate isOpen={isOpen} handleClose={handleClose}>
      <div className="grid grid-cols-4 gap-4">
        {entities.map(entity => (
          <div key={entity.id}>
            <LazyStudentPhoto photoId={entity.photo} />
            <p>{entity.name}</p>
          </div>
        ))}
      </div>
    </ModalTemplate>
  );
}
```

#### 📈 Ganhos Esperados
- ✅ **80% de redução** no tempo de carregamento inicial
- ✅ **90% menos requisições** simultâneas (apenas viewport visível)
- ✅ Interface **não bloqueia** durante carregamento
- ✅ Melhor experiência em redes lentas

#### ✅ Checklist de Implementação
- [ ] Instalar `react-intersection-observer` se necessário
- [ ] Implementar hook `loadPhoto` com cache
- [ ] Criar componente `LazyStudentPhoto`
- [ ] Implementar batch loading inicial (10 primeiras)
- [ ] Adicionar skeleton loading state
- [ ] Testar com 100+ estudantes
- [ ] Verificar cleanup de URLs com DevTools

---

### 3. 🔁 Re-renders Desnecessários em Listas

**Status:** 🔴 Crítico  
**Impacto Estimado:** 60% de melhoria  
**Esforço:** Médio (4-6 horas por componente)

#### 📍 Localização
- `src/pages/partnerPrepForm/components/expandableSection.tsx`
- `src/pages/partnerPrepForm/components/renderQuestionsTable.tsx`
- `src/components/organisms/renderCharts/index.tsx`
- ~15 outros componentes de lista

#### 🐛 Problema

Componentes de lista não estão memoizados, causando re-renders em cascata quando:
- Estado do parent muda
- Qualquer item da lista é atualizado
- Props são recriadas (funções inline)

#### ✅ Solução: React.memo com Comparador Customizado

```typescript
// ✅ Antes
export function ExpandableSection({ 
  section, 
  allQuestions,
  // ... props 
}) {
  // ... implementação
}

// ✅ Depois
export const ExpandableSection = React.memo(function ExpandableSection({
  section,
  allQuestions,
  setSection,
  handleAddQuestion,
  handleEditSection,
  handleDeleteSection,
  handleToggleSection,
  handleReorderQuestions,
  handleDuplicateSection,
}: ExpandableSectionProps) {
  // ... implementação
  
}, (prevProps, nextProps) => {
  // ✅ Custom comparator para otimizar
  // Retorna true se as props NÃO mudaram (não precisa re-render)
  return (
    prevProps.section._id === nextProps.section._id &&
    prevProps.section.updatedAt === nextProps.section.updatedAt &&
    prevProps.allQuestions.length === nextProps.allQuestions.length &&
    prevProps.section.questions.length === nextProps.section.questions.length
  );
});

ExpandableSection.displayName = 'ExpandableSection';
```

#### 📈 Ganhos Esperados
- ✅ **60% de redução** em re-renders desnecessários
- ✅ **Melhor responsividade** em interações
- ✅ **Menos trabalho** para o garbage collector

#### ✅ Checklist de Implementação
- [ ] Identificar componentes de lista (15 arquivos)
- [ ] Envolver com `React.memo`
- [ ] Implementar comparador customizado para cada um
- [ ] Garantir que props são estáveis (useCallback/useMemo)
- [ ] Testar com React DevTools Profiler
- [ ] Validar que re-renders diminuíram

#### 📝 Lista de Componentes para Memoizar
```typescript
// Alta prioridade
- [ ] ExpandableSection
- [ ] RenderQuestionsTable
- [ ] SortableQuestionRow
- [ ] QuestionCard
- [ ] StudentCard

// Média prioridade
- [ ] ModalDetalhes
- [ ] FormSection
- [ ] ChartComponent
- [ ] MapMarker
```

---

## 🟡 Gargalos Médios

### 4. 📊 Processamento Pesado em renderCharts

**Status:** 🟡 Médio  
**Impacto Estimado:** 50% de melhoria  
**Esforço:** Baixo (2-3 horas)

#### 📍 Localização
- **Arquivo:** `src/components/organisms/renderCharts/index.tsx`
- **Linhas:** 274-313

#### 🐛 Problema

```typescript
{processedQuestions
  .filter((q) => q.totalResponses > 0)
  .map((question) => (
    <label key={question.questionId}>
      <input
        type="checkbox"
        // ❌ O(n) lookup em cada render
        checked={selectedQuestions.includes(question.questionId)}
        // ❌ Função inline recriada N vezes
        onChange={(e) => {
          setHasUserInteracted(true);
          if (e.target.checked) {
            setSelectedQuestions((prev) => [...prev, question.questionId]);
          } else {
            setSelectedQuestions((prev) =>
              prev.filter((id) => id !== question.questionId)
            );
          }
        }}
      />
      {/* ... */}
    </label>
  ))}
```

**Impacto:**
- `.includes()` é O(n) → executado para cada questão
- Funções inline recriadas em cada render
- Filter não memoizado

#### ✅ Solução

```typescript
export default function RenderCharts({ data }: { data: StudentsInfo }) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  // ✅ Usar Set para lookup O(1) em vez de Array O(n)
  const selectedQuestionsSet = useMemo(
    () => new Set(selectedQuestions),
    [selectedQuestions]
  );

  // ✅ Memoizar questões filtradas
  const filteredQuestions = useMemo(
    () => processedQuestions.filter((q) => q.totalResponses > 0),
    [processedQuestions]
  );

  // ✅ Handler memoizado
  const handleToggleQuestion = useCallback(
    (questionId: string, checked: boolean) => {
      setHasUserInteracted(true);
      if (checked) {
        setSelectedQuestions((prev) => [...prev, questionId]);
      } else {
        setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
      }
    },
    []
  );

  // ✅ Componente memoizado para evitar re-renders
  const QuestionCheckbox = React.memo(({ 
    question 
  }: { 
    question: ProcessedQuestion 
  }) => (
    <label className="flex items-start gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
      <input
        type="checkbox"
        checked={selectedQuestionsSet.has(question.questionId)} // ✅ O(1)
        onChange={(e) => handleToggleQuestion(question.questionId, e.target.checked)}
        className="rounded mt-0.5"
      />
      <div className="flex-1">
        <span className="text-sm text-gray-800">{question.question}</span>
        <div className="text-xs text-gray-500 mt-1">
          {question.totalResponses} respostas • {question.uniqueAnswers.length} opções
        </div>
      </div>
    </label>
  ));
  QuestionCheckbox.displayName = 'QuestionCheckbox';

  return (
    <div className="max-h-60 overflow-y-auto space-y-2">
      {filteredQuestions.map((question) => (
        <QuestionCheckbox 
          key={question.questionId} 
          question={question} 
        />
      ))}
    </div>
  );
}
```

#### 📈 Ganhos Esperados
- ✅ **50% de redução** em tempo de processamento
- ✅ Lookup O(1) em vez de O(n)
- ✅ Menos re-renders em checkboxes

#### ✅ Checklist de Implementação
- [ ] Converter `selectedQuestions` array para Set
- [ ] Memoizar `filteredQuestions`
- [ ] Extrair e memoizar `QuestionCheckbox`
- [ ] Memoizar `handleToggleQuestion`
- [ ] Testar com 50+ questões

---

### 5. 🖼️ Imagens sem Lazy Loading

**Status:** 🟡 Médio  
**Impacto Estimado:** 40% de melhoria  
**Esforço:** Muito Baixo (1-2 horas)

#### 📍 Localização
- `src/components/organisms/hero/index.tsx` (linha 82-86)
- `src/components/templates/simulateTemplate/index.tsx` (linha 89-92)
- `src/pages/simulate/index.tsx` (linha 198)
- ~10 outros componentes

#### 🐛 Problema

```typescript
// ❌ Carrega imagem imediatamente
<img src={slide.image} alt={slide.title} />

// ❌ Carrega imagens de questões sem lazy
<img 
  src={`${BASE_URL}/images/${questionSelected.imageId}.png`}
/>
```

**Impacto:**
- Carrega todas as imagens do carrossel mesmo se usuário não ver
- Carrega todas questões de simulado (pode ser 100+ imagens)
- Aumenta tempo de carregamento inicial
- Desperdiça banda em dispositivos móveis

#### ✅ Solução 1: Loading Nativo do Browser (Mais Simples)

```typescript
// ✅ Hero carousel
<img 
  src={slide.image} 
  alt={slide.title}
  loading="lazy"
  decoding="async"
/>

// ✅ Questões de simulado
<img 
  src={`${BASE_URL}/images/${questionSelected.imageId}.png`}
  alt={`Questão ${questionSelected.numero + 1}`}
  loading="lazy"
  decoding="async"
  onError={(e) => {
    e.currentTarget.src = '/placeholder-question.png';
  }}
/>
```

#### ✅ Solução 2: Intersection Observer (Mais Controle)

```typescript
// Hook reutilizável
function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Carrega 50px antes de entrar no viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return { imgRef, imageSrc, isLoaded, setIsLoaded };
}

// Componente
function LazyImage({ src, alt, className }: LazyImageProps) {
  const { imgRef, imageSrc, isLoaded, setIsLoaded } = useLazyImage(src);

  return (
    <div ref={imgRef} className={className}>
      {!isLoaded && (
        <Skeleton variant="rectangular" width="100%" height={300} />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
      )}
    </div>
  );
}

// Uso
<LazyImage 
  src={`${BASE_URL}/images/${questionSelected.imageId}.png`}
  alt={`Questão ${questionSelected.numero + 1}`}
  className="question-image"
/>
```

#### 📈 Ganhos Esperados
- ✅ **40% de redução** no tempo de carregamento inicial
- ✅ **50-70% menos banda** utilizada
- ✅ Melhor performance em mobile
- ✅ Melhora score do Lighthouse

#### ✅ Checklist de Implementação

**Opção 1: Loading Nativo (Recomendado para começar)**
- [ ] Adicionar `loading="lazy"` em todas as `<img>`
- [ ] Adicionar `decoding="async"` para não bloquear render
- [ ] Adicionar `onError` para fallback
- [ ] Testar em Chrome/Firefox/Safari

**Opção 2: Intersection Observer (Para mais controle)**
- [ ] Criar hook `useLazyImage`
- [ ] Criar componente `LazyImage`
- [ ] Adicionar skeleton loading state
- [ ] Substituir `<img>` por `<LazyImage>`
- [ ] Testar com React DevTools

#### 📝 Arquivos para Atualizar
```typescript
- [ ] src/components/organisms/hero/index.tsx
- [ ] src/components/templates/simulateTemplate/index.tsx
- [ ] src/pages/simulate/index.tsx
- [ ] src/components/organisms/aboutUs/index.tsx
- [ ] src/components/organisms/features/index.tsx
- [ ] src/components/organisms/supporters/index.tsx
- [ ] src/pages/dashQuestion/modals/modalDetalhes.tsx (linha 674-703)
- [ ] src/components/atoms/modalImage/index.tsx
```

---

## 🟢 Otimizações Gerais

### 6. 📦 Code Splitting e Lazy Loading de Rotas

**Status:** 🟢 Recomendado  
**Impacto Estimado:** 30-40% no carregamento inicial  
**Esforço:** Médio (4-6 horas)

#### 🐛 Problema

Todas as páginas são carregadas no bundle inicial, mesmo as que o usuário não vai acessar.

```typescript
// ❌ Import síncrono
import DashQuestion from './pages/dashQuestion';
import PartnerPrepForm from './pages/partnerPrepForm';
import RenderCharts from './components/organisms/renderCharts';
```

**Impacto:**
- Bundle inicial grande (> 2MB)
- Tempo de carregamento lento
- Código não utilizado carregado

#### ✅ Solução

```typescript
// ✅ Lazy loading de rotas
import { lazy, Suspense } from 'react';
import { MoonLoader } from 'react-spinners';

// Páginas grandes/complexas
const DashQuestion = lazy(() => import('./pages/dashQuestion'));
const PartnerPrepForm = lazy(() => import('./pages/partnerPrepForm'));
const PartnerPrepInscritionStudentManager = lazy(() => 
  import('./pages/partnerPrepInscritionStudentManager')
);
const StudentsEnrolled = lazy(() => import('./pages/studentsEnrolled'));
const RenderCharts = lazy(() => import('./components/organisms/renderCharts'));

// Componente de loading global
function RouteLoadingFallback() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <MoonLoader color="#FF7600" size={60} speedMultiplier={0.4} />
    </div>
  );
}

// Wrapper para rotas lazy
function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      {children}
    </Suspense>
  );
}

// Uso nas rotas
function Routes() {
  return (
    <Routes>
      <Route 
        path="/dash/questions" 
        element={
          <LazyRoute>
            <DashQuestion />
          </LazyRoute>
        } 
      />
      <Route 
        path="/partner/prep-form" 
        element={
          <LazyRoute>
            <PartnerPrepForm />
          </LazyRoute>
        } 
      />
      {/* ... outras rotas */}
    </Routes>
  );
}
```

#### 📈 Ganhos Esperados
- ✅ **30-40% de redução** no bundle inicial
- ✅ **Chunks separados** por rota
- ✅ Carrega apenas o necessário
- ✅ Melhora TTI (Time to Interactive)

#### ✅ Checklist de Implementação
- [ ] Identificar rotas mais pesadas (usar bundle analyzer)
- [ ] Converter imports para `lazy()`
- [ ] Criar componente `RouteLoadingFallback`
- [ ] Envolver rotas com `<Suspense>`
- [ ] Configurar Vite para code splitting adequado
- [ ] Testar navegação entre rotas
- [ ] Validar chunks gerados no build
- [ ] Verificar tamanho dos bundles

#### 🔧 Configuração do Vite

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/x-data-grid'],
          'charts-vendor': ['@nivo/bar', '@nivo/pie', '@nivo/line'],
          
          // Feature chunks
          'dash-pages': [
            './src/pages/dashQuestion',
            './src/pages/dashContent',
            './src/pages/dashGeo',
          ],
          'partner-pages': [
            './src/pages/partnerPrepForm',
            './src/pages/partnerClass',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

---

### 7. 🔄 Debounce em Inputs de Busca

**Status:** 🟢 Recomendado  
**Impacto Estimado:** 20-30% em interações  
**Esforço:** Baixo (1-2 horas)

#### 📍 Localização
- `src/pages/dashQuestion/index.tsx` - filtro de questões
- `src/pages/dashContent/index.tsx` - busca de conteúdo
- `src/pages/studentsEnrolled/index.tsx` - filtro de estudantes
- Todos os inputs de busca

#### 🐛 Problema

```typescript
// ❌ Re-render e fetch a cada tecla digitada
<input 
  value={filterText}
  onChange={(e) => {
    setFilterText(e.target.value);
    // Busca executada IMEDIATAMENTE
    fetchData(e.target.value);
  }}
/>
```

**Impacto:**
- Múltiplas requisições desnecessárias
- Re-renders excessivos
- Experiência ruim (lag ao digitar)
- Sobrecarga no backend

#### ✅ Solução 1: useDeferredValue (React 18+)

```typescript
import { useDeferredValue } from 'react';

function DashQuestion() {
  const [filterText, setFilterText] = useState('');
  
  // ✅ Adia a atualização do valor
  const deferredFilterText = useDeferredValue(filterText);

  // ✅ useEffect só dispara com valor deferido
  useEffect(() => {
    if (deferredFilterText) {
      fetchQuestions(deferredFilterText);
    }
  }, [deferredFilterText]);

  return (
    <input 
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      placeholder="Buscar questões..."
    />
  );
}
```

#### ✅ Solução 2: Custom Hook com Debounce

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Uso
function DashQuestion() {
  const [filterText, setFilterText] = useState('');
  const debouncedFilterText = useDebounce(filterText, 500);

  useEffect(() => {
    if (debouncedFilterText) {
      fetchQuestions(debouncedFilterText);
    }
  }, [debouncedFilterText]);

  return (
    <input 
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      placeholder="Buscar questões..."
    />
  );
}
```

#### ✅ Solução 3: Lodash Debounce (Mais Controle)

```typescript
import { debounce } from 'lodash';
import { useMemo } from 'react';

function DashQuestion() {
  const [filterText, setFilterText] = useState('');

  // ✅ Memoizar função debounced
  const debouncedSearch = useMemo(
    () => debounce((text: string) => {
      fetchQuestions(text);
    }, 500, {
      leading: false,  // Não executa no início
      trailing: true,  // Executa no fim
    }),
    []
  );

  // ✅ Cleanup ao desmontar
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <input 
      value={filterText}
      onChange={(e) => {
        const value = e.target.value;
        setFilterText(value);
        debouncedSearch(value);
      }}
      placeholder="Buscar questões..."
    />
  );
}
```

#### 📈 Ganhos Esperados
- ✅ **80-90% de redução** em requisições
- ✅ **Melhor responsividade** ao digitar
- ✅ **Menos carga** no backend
- ✅ Experiência mais fluída

#### ✅ Checklist de Implementação
- [ ] Criar hook `useDebounce` (ou usar lodash)
- [ ] Identificar todos os inputs de busca (10+ arquivos)
- [ ] Aplicar debounce nos handlers
- [ ] Definir delay apropriado (300-500ms)
- [ ] Adicionar indicador visual de loading
- [ ] Testar experiência de digitação
- [ ] Validar redução de requisições no Network tab

#### 📝 Arquivos para Atualizar
```typescript
- [ ] src/pages/dashQuestion/index.tsx
- [ ] src/pages/dashContent/index.tsx
- [ ] src/pages/studentsEnrolled/index.tsx
- [ ] src/pages/dashGeo/index.tsx
- [ ] src/pages/partnerClass/index.tsx
- [ ] Todos os componentes de busca/filtro
```

---

## 🎯 Plano de Ação

### Fase 1: Quick Wins (Semana 1) - 4-8 horas

Implementações rápidas com alto impacto:

- [ ] **Dia 1-2:** Adicionar `loading="lazy"` em todas `<img>` tags
  - Arquivos: ~10 componentes
  - Tempo: 1-2 horas
  - Ganho: 40%

- [x] **Dia 2-3:** Mover `flatMap` para fora do loop com `useMemo` ✅ **CONCLUÍDO**
  - Arquivo: `partnerPrepForm/index.tsx`
  - Tempo: 2 horas
  - Ganho: 90%

- [ ] **Dia 3-4:** Implementar debounce nos filtros principais
  - Arquivos: 5 páginas principais
  - Tempo: 2-3 horas
  - Ganho: 30%

- [ ] **Dia 4-5:** Converter lookup de array para Set em `renderCharts`
  - Arquivo: `renderCharts/index.tsx`
  - Tempo: 1 hora
  - Ganho: 50%

**Total Semana 1:** 6-8 horas | **Ganho médio: 50-60%**

---

### Fase 2: Otimizações Médias (Semana 2) - 12-16 horas

Implementações que requerem mais refatoração:

- [ ] **Dia 1-2:** Implementar lazy loading de fotos com Intersection Observer
  - Arquivo: `printerStudentCards.tsx`
  - Tempo: 6-8 horas
  - Ganho: 80%

- [ ] **Dia 3-4:** Memoizar componentes de lista principais (5 componentes)
  - Arquivos: `ExpandableSection`, `QuestionCard`, etc
  - Tempo: 4-6 horas
  - Ganho: 60%

- [ ] **Dia 5:** Adicionar `useCallback` em handlers inline
  - Arquivos: ~10 componentes
  - Tempo: 2-3 horas
  - Ganho: 30%

**Total Semana 2:** 12-17 horas | **Ganho médio: 55-65%**

---

### Fase 3: Otimizações Avançadas (Semana 3) - 10-15 horas

Otimizações estruturais:

- [ ] **Dia 1-2:** Implementar code splitting nas rotas
  - Arquivos: Configuração de rotas + Vite config
  - Tempo: 4-6 horas
  - Ganho: 30-40% no bundle inicial

- [ ] **Dia 3-4:** Configurar chunks manuais no Vite
  - Arquivo: `vite.config.ts`
  - Tempo: 2-3 horas
  - Ganho: 20%

- [ ] **Dia 4-5:** Implementar virtualização em listas grandes (react-window)
  - Arquivos: DataGrid customizados
  - Tempo: 4-6 horas
  - Ganho: 70% em listas 100+ itens

**Total Semana 3:** 10-15 horas | **Ganho médio: 40-50%**

---

### Fase 4: Análise e Refinamento (Semana 4) - 4-6 horas

- [ ] Executar Lighthouse audit
- [ ] Usar React DevTools Profiler
- [ ] Bundle analyzer para validar chunks
- [ ] Testes de performance em mobile
- [ ] Documentar melhorias e métricas

---

## 📊 Métricas de Acompanhamento

### Antes vs Depois

Use estas métricas para medir o impacto:

#### Lighthouse Scores (Objetivo: 90+)
```bash
# Rodar lighthouse
npm run build
npm run preview
lighthouse http://localhost:4173 --view
```

**Métricas esperadas:**

| Métrica | Antes | Meta | Medição Atual |
|---------|-------|------|---------------|
| Performance Score | ? | 90+ | [ ] |
| First Contentful Paint | ? | < 1.5s | [ ] |
| Largest Contentful Paint | ? | < 2.5s | [ ] |
| Time to Interactive | ? | < 3.5s | [ ] |
| Total Blocking Time | ? | < 200ms | [ ] |
| Cumulative Layout Shift | ? | < 0.1 | [ ] |

#### Bundle Size

```bash
# Análise de bundle
npm run build
npx vite-bundle-visualizer
```

**Métricas esperadas:**

| Arquivo | Antes | Meta | Atual |
|---------|-------|------|-------|
| Bundle inicial | ? | < 500KB | [ ] |
| Chunks lazy | N/A | < 300KB cada | [ ] |
| Total gzipped | ? | < 1MB | [ ] |

#### React DevTools Profiler

**Componentes críticos para medir:**

| Componente | Antes (ms) | Meta (ms) | Atual (ms) |
|------------|------------|-----------|------------|
| PartnerPrepForm render | ? | < 50ms | [ ] |
| ExpandableSection list | ? | < 30ms | [ ] |
| RenderCharts | ? | < 100ms | [ ] |
| StudentCards grid | ? | < 80ms | [ ] |

#### Network Requests

| Cenário | Antes | Meta | Atual |
|---------|-------|------|-------|
| Carregar lista de fotos | ? req | < 10 req iniciais | [ ] |
| Digitação em busca | ? req/s | < 1 req/500ms | [ ] |
| Carregamento de imagens | Todas de uma vez | Lazy + batch | [ ] |

---

## 🛠️ Ferramentas Recomendadas

### Análise de Performance

```bash
# 1. Bundle analyzer
npm install --save-dev vite-bundle-visualizer
npx vite-bundle-visualizer

# 2. Lighthouse CI
npm install --save-dev @lhci/cli
npx lhci autorun

# 3. React DevTools
# Instalar extensão do Chrome/Firefox
# Usar aba "Profiler" para medir renders
```

### Monitoring Contínuo

```typescript
// Adicionar Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Enviar para seu analytics (Google Analytics, etc)
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## ✅ Checklist Geral de Implementação

### Preparação
- [ ] Criar branch `feature/performance-optimization`
- [ ] Instalar dependências necessárias
- [ ] Configurar ferramentas de análise
- [ ] Documentar métricas "antes"

### Implementação Fase 1 (Quick Wins)
- [ ] Lazy loading de imagens
- [ ] Otimizar flatMap
- [ ] Debounce em filtros
- [ ] Set em vez de Array

### Implementação Fase 2 (Médias)
- [ ] Lazy loading de fotos
- [ ] Memoização de componentes
- [ ] useCallback em handlers

### Implementação Fase 3 (Avançadas)
- [ ] Code splitting
- [ ] Chunks manuais
- [ ] Virtualização

### Validação
- [ ] Rodar Lighthouse (score 90+)
- [ ] React DevTools Profiler
- [ ] Bundle analyzer
- [ ] Testes manuais em mobile
- [ ] Documentar métricas "depois"

### Finalização
- [ ] Code review
- [ ] Testes E2E
- [ ] Merge para main
- [ ] Deploy
- [ ] Monitorar métricas em produção

---

## 📚 Recursos Adicionais

### Documentação
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

### Artigos Recomendados
- [Optimizing React Performance](https://kentcdodds.com/blog/optimize-react-re-renders)
- [useMemo and useCallback](https://react.dev/reference/react/useMemo)
- [Code Splitting](https://react.dev/reference/react/lazy)

---

## 📝 Notas

- Este documento deve ser atualizado conforme otimizações são implementadas
- Marcar checkboxes ✅ ao completar cada item
- Documentar métricas antes/depois
- Compartilhar aprendizados com o time

---

**Última atualização:** Novembro 2025  
**Responsável:** Time de Desenvolvimento  
**Status:** 🔴 Pendente de Implementação

