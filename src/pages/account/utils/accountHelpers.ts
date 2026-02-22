import { UserMe } from '@/types/user/userMe';
import { AuthUpdate } from '@/store/auth';

export function hasFormChanges(
  userAccount: UserMe,
  formData: AuthUpdate
): boolean {
  return (
    formData.firstName !== userAccount.firstName ||
    formData.lastName !== userAccount.lastName ||
    formData.socialName !== userAccount.socialName ||
    new Date(formData.birthday).toISOString() !== userAccount.birthday ||
    formData.city !== userAccount.city ||
    formData.state !== userAccount.state ||
    formData.phone !== userAccount.phone ||
    formData.gender !== userAccount.gender ||
    formData.about !== userAccount.about ||
    formData.useSocialName !== userAccount.useSocialName
  );
}

export function validateFileSize(file: File, maxSizeMB: number = 1): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

