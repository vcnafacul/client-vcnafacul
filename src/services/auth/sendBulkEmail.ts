import fetchWrapper from "@/utils/fetchWrapper";
import { send_bulk_email } from "../urls";

interface SendBulkEmailProps {
  userIds?: string[];
  subject: string;
  message: string;
  sendToAll?: boolean;
}

export async function sendBulkEmail(data: SendBulkEmailProps, token: string) {
  const response = await fetchWrapper(send_bulk_email, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (response.status !== 201) {
    throw new Error(`Erro ao enviar email em massa`);
  }
}
