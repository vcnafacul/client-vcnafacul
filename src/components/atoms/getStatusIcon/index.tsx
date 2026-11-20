import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { AlertCircle, Ban, CheckCircle2, Clock, FileText, LoaderCircle, Lock, MailCheck, UserCheck, UserX, XCircle } from "lucide-react";

export function getStatusIcon(status: StatusApplication) {
  switch (status) {
    case StatusApplication.UnderReview:
      return <LoaderCircle className="text-warning w-6 h-6 animate-rotate30" />;

    case StatusApplication.Rejected:
      return <XCircle className="text-destructive" />;

    case StatusApplication.Enrolled:
      return <CheckCircle2 className="text-success" />;

    case StatusApplication.DeclaredInterest:
      return <MailCheck className="text-info" />;

    case StatusApplication.CalledForEnrollment:
      return <UserCheck className="text-success" />;

    case StatusApplication.MissedDeadline:
      return <Clock className="text-muted-foreground" />;

    case StatusApplication.EnrollmentNotConfirmed:
      return <AlertCircle className="text-warning" />;

    case StatusApplication.EnrollmentCancelled:
      return <UserX className="text-destructive" />;

    case StatusApplication.SendedDocument:
      return <FileText className="text-info" />;

    case StatusApplication.EnrollmentClosed:
      return <Lock className="text-primary" />;

    default:
      return <Ban className="text-destructive" />;
  }
}
