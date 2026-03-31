import { WidgetGrid } from './components/WidgetGrid';
import { widgetRegistry } from './widgetRegistry';

export default function Dashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-8">
      <WidgetGrid widgets={widgetRegistry} />
    </div>
  );
}
