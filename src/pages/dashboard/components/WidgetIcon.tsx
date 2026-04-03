import { LucideIcon } from 'lucide-react';

interface WidgetIconProps {
  icon: LucideIcon;
}

export function WidgetIcon({ icon: Icon }: WidgetIconProps) {
  return (
    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-marine/10">
      <Icon className="h-[14px] w-[14px] text-marine" />
    </div>
  );
}
