/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from "react-router-dom"
import { HOME_PATH } from "../../routes/path"
import { useAuthStore } from "../../store/auth"
import { useEffect } from "react"
function Logout() {

    const navivate = useNavigate()
    const { logout } = useAuthStore()
    
    useEffect(() => {
        logout()
        navivate(HOME_PATH)
    }, [])

    return <></>
}

export default Logout