import { useNavigate } from "react-router-dom"
import { HOME_PATH } from "../../routes/path"
import { useAuthStore } from "../../store/auth"

function Logout() {

    const navivate = useNavigate()
    const { logout } = useAuthStore()

    logout()
    navivate(HOME_PATH)

    return <></>
}

export default Logout