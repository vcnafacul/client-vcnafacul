export type Profile = 'common' | 'student' | 'collaborator';

export type WidgetDef = {
  id: string;
  component: React.ComponentType;
  profiles: Profile[];
  excludeProfiles?: Profile[];
  permissions?: string[];
  gridSpan?: { desktop: number };
};
