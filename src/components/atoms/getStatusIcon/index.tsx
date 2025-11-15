import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  MailCheck,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { RiLoader2Fill } from "react-icons/ri";

export function getStatusIcon(status: StatusApplication) {
  switch (status) {
    case StatusApplication.UnderReview:
      return <RiLoader2Fill className="text-orange w-6 h-6 animate-rotate30" />;

    case StatusApplication.Rejected:
      return <XCircle className="text-red" />;

    case StatusApplication.Enrolled:
      return <CheckCircle2 className="text-green2" />;

    case StatusApplication.DeclaredInterest:
      return <MailCheck className="text-blue-500" />;

    case StatusApplication.CalledForEnrollment:
      return <UserCheck className="text-green" />;

    case StatusApplication.MissedDeadline:
      return <Clock className="text-gray-500" />;

    case StatusApplication.EnrollmentNotConfirmed:
      return <AlertCircle className="text-amber-500" />;

    case StatusApplication.EnrollmentCancelled:
      return <UserX className="text-red" />;

    case StatusApplication.SendedDocument:
      return <FileText className="text-blue-500" />;

    case StatusApplication.EnrollmentClosed:
      return <Lock className="text-indigo-600" />;

    default:
      return <Ban className="text-red" />;
  }
}
