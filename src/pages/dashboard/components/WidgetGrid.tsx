import { useMemo, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { WidgetDef } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ORDER_STORAGE_KEY = 'dashboard:widget-order';

function getStoredOrder(): string[] | null {
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveOrder(ids: string[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(ids));
}

interface WidgetGridProps {
  widgets: WidgetDef[];
}

function filterWidgets(
  widgets: WidgetDef[],
  profiles: string[],
  permissions: Record<string, boolean>,
): WidgetDef[] {
  return widgets.filter((w) => {
    const hasProfile = w.profiles.some((p) => profiles.includes(p));
    if (!hasProfile) return false;

    if (w.excludeProfiles?.some((p) => profiles.includes(p))) return false;

    if (w.permissions?.length) {
      const hasPermission = w.permissions.some((perm) => permissions[perm]);
      if (!hasPermission) return false;
    }

    return true;
  });
}

function applyStoredOrder(widgets: WidgetDef[]): WidgetDef[] {
  const storedOrder = getStoredOrder();
  if (!storedOrder) return widgets;

  const widgetMap = new Map(widgets.map((w) => [w.id, w]));
  const ordered: WidgetDef[] = [];

  for (const id of storedOrder) {
    const widget = widgetMap.get(id);
    if (widget) {
      ordered.push(widget);
      widgetMap.delete(id);
    }
  }

  // Append any new widgets not in stored order
  for (const widget of widgetMap.values()) {
    ordered.push(widget);
  }

  return ordered;
}

function SortableWidget({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function WidgetGrid({ widgets }: WidgetGridProps) {
  const { profiles, permissao } = useAuthStore((s) => s.data);

  const visible = useMemo(
    () => filterWidgets(widgets, profiles, permissao),
    [widgets, profiles, permissao],
  );

  // Separate header (fixed) from draggable widgets
  const header = visible.find((w) => w.id === 'header');
  const draggableFiltered = visible.filter((w) => w.id !== 'header');

  const [orderedWidgets, setOrderedWidgets] = useState(() =>
    applyStoredOrder(draggableFiltered),
  );

  // Sync if filtered widgets change (e.g. profile change)
  useMemo(() => {
    const currentIds = new Set(draggableFiltered.map((w) => w.id));
    const orderedIds = new Set(orderedWidgets.map((w) => w.id));

    const added = draggableFiltered.filter((w) => !orderedIds.has(w.id));
    const kept = orderedWidgets.filter((w) => currentIds.has(w.id));

    if (added.length > 0 || kept.length !== orderedWidgets.length) {
      setOrderedWidgets([...kept, ...added]);
    }
  }, [draggableFiltered.map((w) => w.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setOrderedWidgets((prev) => {
          const oldIndex = prev.findIndex((w) => w.id === String(active.id));
          const newIndex = prev.findIndex((w) => w.id === String(over.id));
          const reordered = arrayMove(prev, oldIndex, newIndex);
          saveOrder(reordered.map((w) => w.id));
          return reordered;
        });
      }
    },
    [],
  );

  const HeaderComponent = header?.component;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {HeaderComponent && (
        <div className="col-span-full">
          <HeaderComponent />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedWidgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          {orderedWidgets.map((w) => {
            const Component = w.component;
            return (
              <SortableWidget key={w.id} id={w.id}>
                <Component />
              </SortableWidget>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}
