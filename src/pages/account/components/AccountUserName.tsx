import { UserMe } from '@/types/user/userMe';

interface AccountUserNameProps {
  userAccount: UserMe | null;
}

export function AccountUserName({ userAccount }: AccountUserNameProps) {
  const displayName = userAccount?.useSocialName
    ? userAccount?.socialName
    : userAccount?.firstName;

  return (
    <div className="md:flex flex-col px-8 pt-4 hidden">
      <span className="text-foreground text-h1 font-extrabold leading-tight">
        {displayName}
      </span>
      <span className="text-foreground text-h3 font-medium">
        {userAccount?.lastName}
      </span>
      {userAccount?.collaborator && (
        <span className="text-foreground text-body font-semibold mt-1 opacity-80">
          {userAccount?.collaboratorDescription}
        </span>
      )}
    </div>
  );
}

