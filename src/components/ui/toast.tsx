import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import "./toast.css"

// Setup do react-toastify (tickets/059 §3). O visual está em toast.css; os padrões de
// `autoClose` por tipo estão em `@/lib/toast`.
// ⚠️ Toast é aviso de tela, nunca conteúdo: `print:hidden` evita que congele numa folha impressa.
function Toaster() {
  return (
    <ToastContainer
      className="print:hidden"
      position="top-right"
      limit={3}
      pauseOnHover
      pauseOnFocusLoss
      closeOnClick
      draggable
      closeButton
      newestOnTop
    />
  )
}

export { Toaster }
