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
    <div className="flex items-center gap-3.5 px-1 py-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-marine to-marine/70 text-white text-lg font-bold">
        {initials}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-marine">
          Olá, {displayName}!
        </h2>
        <p className="text-[13px] text-gray-500">
          Veja o que está acontecendo na sua jornada
        </p>
      </div>
    </div>
  );
}
