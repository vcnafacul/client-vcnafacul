import BaseTemplate from "@/components/templates/baseTemplate";
import { InviteMemberAccept } from "@/services/prepCourse/invite-member-accept";
import { useAuthStore } from "@/store/auth";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AcceptInvite from "./accept-invite";
import ErrorInvite from "./error-invite";
import NotAuth from "./not-auth";
import ProcessingInvite from "./processing-invite";

export default function InviteMemberProcessing() {
  const location = useLocation();
  const getToken = (queryString.parse(location.search).token as string) || "";
  const {
    data: { token },
    logout,
  } = useAuthStore();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (token) {
      InviteMemberAccept(getToken)
        .then(() => {
          setProcessing(false);
          new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
            logout();
            navigate("/login");
          });
        })
        .catch((error) => {
          setError(error.message);
          setProcessing(false);
        });
    }
  }, []);

  return (
    <BaseTemplate solid>
      <div className="flex justify-center items-center py-16">
        {!token ? (
          <NotAuth />
        ) : error ? (
          <ErrorInvite error={error} />
        ) : processing ? (
          <ProcessingInvite />
        ) : (
          <AcceptInvite />
        )}
      </div>
    </BaseTemplate>
  );
}
