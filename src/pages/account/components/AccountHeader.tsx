import { ReactComponent as LogoIcon } from '@/assets/images/home/logo.svg';
import ImageProfile from '@/components/molecules/imageProfile';
import { UserMe } from '@/types/user/userMe';

interface AccountHeaderProps {
  userAccount: UserMe | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
}

export function AccountHeader({
  userAccount,
  imagePreview,
  onImageChange,
  onDeleteImage,
}: AccountHeaderProps) {
  const displayName = userAccount?.useSocialName
    ? userAccount?.socialName
    : userAccount?.firstName;

  return (
    <div className="flex px-6 py-4 w-full md:w-[300px] rounded-bl-3xl shadow-sm">
      <div className="flex flex-row md:flex-col gap-4">
        {userAccount?.collaborator ? (
          <ImageProfile
            deleteImage={onDeleteImage}
            onChange={onImageChange}
            src={imagePreview ?? ""}
          />
        ) : (
          <LogoIcon className="w-24 h-24 p-2 bg-white border rounded-full animate-rotate" />
        )}
      </div>
      
      {/* Nome (mobile) */}
      <div className="flex flex-col px-8 pt-4 md:hidden justify-center">
        <span className="text-marine text-2xl font-extrabold leading-tight">
          {displayName}
        </span>
        <span className="text-marine text-lg font-medium">
          {userAccount?.lastName}
        </span>
        {userAccount?.collaborator && (
          <span className="text-marine text-sm font-semibold mt-1 opacity-80">
            {userAccount?.collaboratorDescription}
          </span>
        )}
      </div>
    </div>
  );
}

