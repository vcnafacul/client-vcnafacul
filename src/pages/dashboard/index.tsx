import { WidgetGrid } from './components/WidgetGrid';
import { widgetRegistry } from './widgetRegistry';

export default function Dashboard() {
  return (
    <div className="bg-slate-200/50 h-full">
      <div className="w-full mx-auto px-16 pt-8">
        <WidgetGrid widgets={widgetRegistry} />
      </div>
    </div>
  );
}
