import fetchWrapper from '@/utils/fetchWrapper';
import {
  dashboardPublicStudentsServed,
  dashboardPublicStudentsEnrolled,
  partnerPrepCourse,
  question_summary,
  content_summary,
} from '@/services/urls';

export interface ImpactStats {
  studentsServed: number;
  partnerCourses: number;
  studentsEnrolled: number;
  questionsTotal: number;
  contentApproved: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetchWrapper(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Erro ao buscar ${url}`);
  return res.json();
}

export async function fetchImpactStats(): Promise<ImpactStats> {
  const [served, enrolled, partnerCount, questions, content] =
    await Promise.all([
      fetchJson<{ total: number }>(dashboardPublicStudentsServed),
      fetchJson<{ total: number }>(dashboardPublicStudentsEnrolled),
      fetchJson<number>(`${partnerPrepCourse}/summary`),
      fetchJson<{ questionTotal: number }>(question_summary),
      fetchJson<{ contentApproved: number }>(content_summary),
    ]);

  return {
    studentsServed: served.total,
    partnerCourses: partnerCount,
    studentsEnrolled: enrolled.total,
    questionsTotal: questions.questionTotal,
    contentApproved: content.contentApproved,
  };
}
