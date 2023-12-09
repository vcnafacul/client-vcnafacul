/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from "react-router-dom"
import { HOME_PATH } from "../../routes/path"
import { useAuthStore } from "../../store/auth"
import { delay } from "../../utils/delay"
import { useEffect } from "react"
import Text from "../../components/atoms/text"
import { ReactComponent as DropImage } from '../../assets/images/dashboard/undraw_mic_drop_uuyg.svg'

function Logout() {

    const navivate = useNavigate()
    const { logout } = useAuthStore()
    
    useEffect(() => {
        logout()
        delay(3000)
        .then(_ => {
            navivate(HOME_PATH)
        })
    }, [])

    return <div className="w-full flex flex-col justify-center items-center h-screen">
        <Text>Sua sessão expirou</Text>
        <DropImage className="h-[80vh]" />
    </div>
}

export default Logout