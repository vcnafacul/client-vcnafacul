# API de Reordenação de Questões

## 📋 Resumo

Implementação frontend completa de Drag-and-Drop para reordenar questões dentro de uma seção no formulário de preparação.

## 🔌 Endpoint Necessário no BFF

### PATCH `/section-form/:sectionId/questions/reorder`

Reordena as questões de uma seção específica.

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Path Parameters
- `sectionId` (string): ID da seção que terá suas questões reordenadas

#### Request Body
```typescript
{
  questionIds: string[] // Array com os IDs das questões na nova ordem desejada
}
```

#### Exemplo de Request
```bash
PATCH /section-form/507f1f77bcf86cd799439011/questions/reorder
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "questionIds": [
    "60d5ec49f1b2c72b8c8e4a01",
    "60d5ec49f1b2c72b8c8e4a03",
    "60d5ec49f1b2c72b8c8e4a02",
    "60d5ec49f1b2c72b8c8e4a04"
  ]
}
```

#### Response Esperado

**Sucesso (200 OK)**
```json
{
  "message": "Questões reordenadas com sucesso"
}
```

**Erro (400 Bad Request)**
```json
{
  "message": "IDs de questões inválidos ou incompletos"
}
```

**Erro (401 Unauthorized)**
```json
{
  "message": "Token inválido ou expirado"
}
```

**Erro (404 Not Found)**
```json
{
  "message": "Seção não encontrada"
}
```

## 🔧 Sugestão de Implementação no Backend

### Lógica Recomendada

1. **Validar Autorização**: Verificar se o usuário tem permissão para editar a seção
2. **Validar IDs**: Garantir que todos os IDs no array pertencem à seção
3. **Validar Completude**: Verificar se todos os IDs das questões da seção estão presentes
4. **Atualizar Ordem**: Iterar pelo array e atualizar o campo `order` de cada questão

### Pseudo-código

```typescript
async function reorderQuestions(sectionId: string, questionIds: string[]) {
  // 1. Buscar seção
  const section = await Section.findById(sectionId);
  if (!section) throw new NotFoundError('Seção não encontrada');
  
  // 2. Validar que todos os IDs pertencem à seção
  const sectionQuestionIds = section.questions.map(q => q._id.toString());
  const allValid = questionIds.every(id => sectionQuestionIds.includes(id));
  if (!allValid) throw new BadRequestError('IDs inválidos');
  
  // 3. Validar que todos os IDs estão presentes
  if (questionIds.length !== section.questions.length) {
    throw new BadRequestError('Lista incompleta de questões');
  }
  
  // 4. Atualizar ordem em uma transação (se usar MongoDB)
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    for (let i = 0; i < questionIds.length; i++) {
      await Question.findByIdAndUpdate(
        questionIds[i],
        { order: i },
        { session }
      );
    }
    
    await session.commitTransaction();
    return { message: 'Questões reordenadas com sucesso' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Exemplo com Prisma (se usar SQL)

```typescript
async function reorderQuestions(sectionId: string, questionIds: string[]) {
  // Validações...
  
  await prisma.$transaction(
    questionIds.map((questionId, index) =>
      prisma.question.update({
        where: { id: questionId },
        data: { order: index }
      })
    )
  );
  
  return { message: 'Questões reordenadas com sucesso' };
}
```

## 📊 Campo `order` na Tabela/Collection

### Estrutura Atualizada da Question

```typescript
interface Question {
  _id: string;
  text: string;
  helpText?: string;
  answerType: 'Text' | 'Number' | 'Boolean' | 'Options';
  collection: 'single' | 'multiple';
  options?: string[];
  conditions?: ComplexCondition;
  active: boolean;
  order: number; // ⬅️ NOVO CAMPO
  createdAt: Date;
  updatedAt: Date;
}
```

### Migration Necessária

**MongoDB**
```javascript
db.questions.find().forEach(function(question) {
  // Se não tem order, atribuir baseado na posição atual
  if (question.order === undefined) {
    db.questions.update(
      { _id: question._id },
      { $set: { order: 0 } }
    );
  }
});
```

**SQL (Exemplo com Prisma)**
```sql
-- 1. Adicionar coluna
ALTER TABLE questions ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- 2. Atualizar ordens existentes (baseado em created_at)
WITH ordered_questions AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY section_id ORDER BY created_at) - 1 as new_order
  FROM questions
)
UPDATE questions
SET "order" = ordered_questions.new_order
FROM ordered_questions
WHERE questions.id = ordered_questions.id;
```

## 🎯 Comportamento no Frontend

### Atualização Otimista
O frontend implementa **atualização otimista**:
1. Usuário arrasta questão
2. UI atualiza imediatamente
3. API é chamada em background
4. Se API falhar, UI reverte para estado anterior

### Feedback Visual
- Ícone de "arrastar" (⋮⋮) visível em cada linha
- Opacidade reduzida durante o arraste
- Linha indicadora de posição de drop
- Cursor muda para "grabbing" durante o arraste

## 🔍 Notas Importantes

1. **Ordenação nas Queries**: Certifique-se de que ao buscar questões, elas venham ordenadas pelo campo `order`:
   ```typescript
   questions.sort((a, b) => a.order - b.order)
   ```

2. **Criação de Novas Questões**: Ao criar uma nova questão, atribuir `order` como o último índice + 1

3. **Exclusão de Questões**: Opcionalmente, pode-se reordenar as questões restantes para manter sequência contínua

4. **Performance**: Para seções com muitas questões (100+), considerar implementar debounce ou batch updates

## 📝 Checklist de Implementação

- [ ] Adicionar campo `order` no modelo/schema da Question
- [ ] Criar migration para adicionar campo em registros existentes
- [ ] Implementar endpoint PATCH `/section-form/:sectionId/questions/reorder`
- [ ] Adicionar validações de autorização e integridade
- [ ] Garantir que queries de listagem ordenem por `order`
- [ ] Atualizar criação de questões para incluir `order`
- [ ] Testar endpoint com diferentes cenários
- [ ] (Opcional) Adicionar logs de auditoria para rastreabilidade

## 🧪 Casos de Teste Recomendados

1. ✅ Reordenar questões em uma seção vazia - deve falhar
2. ✅ Reordenar com IDs inválidos - deve retornar 400
3. ✅ Reordenar com lista incompleta - deve retornar 400
4. ✅ Reordenar sem autenticação - deve retornar 401
5. ✅ Reordenar seção inexistente - deve retornar 404
6. ✅ Reordenar com sucesso - deve retornar 200 e atualizar ordens
7. ✅ Verificar que a ordem persiste após recarregar
8. ✅ Reordenar múltiplas vezes rapidamente - deve processar corretamente

---

**Contato**: Se tiver dúvidas sobre a implementação, consulte o código em:
- Frontend Service: `/src/services/partnerPrepForm/reorderQuestions.ts`
- Frontend Component: `/src/pages/partnerPrepForm/components/sortableQuestionRow.tsx`

