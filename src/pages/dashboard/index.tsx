import { WidgetGrid } from './components/WidgetGrid';
import { widgetRegistry } from './widgetRegistry';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e8ecf1]">
      <div className="w-full max-w-7xl mx-auto px-4 pb-8">
        <WidgetGrid widgets={widgetRegistry} />
      </div>
    </div>
  );
}
