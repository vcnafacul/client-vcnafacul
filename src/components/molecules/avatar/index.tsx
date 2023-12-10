import  { ReactComponent as UserIcon } from "../../../assets/icons/user.svg";

function Avatar(){
    return (
        <div className="flex items-center cursor-pointer">
            <div className="m-1 bg-orange w-9 h-9 rounded-full flex justify-center items-center border-0">
                <UserIcon />
            </div>
        </div>
    )
}

export default Avatar