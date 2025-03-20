import { getAttendanceRecord } from '@/services/prepCourse/attendanceRecord/getAttendanceRecord';
import { ClassEntity } from '@/types/partnerPrepCourse/classEntity';
import { useEffect, useState } from 'react';

export const useClassDeletion = (selectedClass: ClassEntity, token: string) => {
  const [isDeletionDisabled, setIsDeletionDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkDeletionStatus = async () => {
      try {
        setIsLoading(true);

        const hasStudents = selectedClass.number_students > 0;

        let hasAttendanceRecords = false;
        if (!hasStudents) {
          const response = await getAttendanceRecord(token, 1, 10, selectedClass.id);
          hasAttendanceRecords = (response.totalItems) > 0;
        }

        setIsDeletionDisabled(hasStudents || hasAttendanceRecords);
      } catch (err) {
        console.error("Erro ao buscar registros de frequência:", err);
        setIsDeletionDisabled(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkDeletionStatus();
  }, [selectedClass, token]);

  return { isDeletionDisabled, isLoading };
};
