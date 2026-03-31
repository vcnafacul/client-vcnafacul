import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getDisplayName(user: {
  firstName: string;
  lastName: string;
  socialName?: string;
  useSocialName: boolean;
}): string {
  if (user.useSocialName && user.socialName) {
    return user.socialName;
  }
  return `${user.firstName} ${user.lastName}`;
}

export function HeaderWidget() {
  const user = useAuthStore((s) => s.data.user);

  const displayName = getDisplayName(user);
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-marine text-white text-xl font-bold">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-marine">
            Olá, {displayName}!
          </h2>
          <p className="text-sm text-gray-500">
            Bem-vindo(a) de volta ao Você na Facul
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
