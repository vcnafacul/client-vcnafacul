/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactComponent as PreviewIcon } from '../../../assets/icons/Icon-preview.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/edit.svg'
import { IoTrash } from "react-icons/io5";

interface DropdwonMenuProps {
    src: string;
    onChange: (event: any) => void;
    deleteImage: () => void;
}

function ImageProfile({src, onChange, deleteImage} : DropdwonMenuProps){
    return (
       <>
        <div className='relative m-4'>
            <div className='border border-input rounded-full'>
                {src ? <img className='w-40 h-40 rounded-full relative object-cover' src={src} /> : 
                <div className='w-40 h-40 rounded-full bg-muted flex justify-center items-center'>
                    <PreviewIcon className='w-20 h-20' /></div>}
            </div>
            {src ? <div className={`absolute bottom-3 right-1 bg-muted border-input py-2 px-2 select-none rounded-full border`} onClick={deleteImage}>
                <IoTrash className='w-4 h-4 fill-foreground' />
            </div> : <></>}
            <div className={`absolute bottom-3 left-0 bg-muted border-input py-2 px-2 select-none rounded-full border`}>
                <EditIcon className='w-4 h-4 fill-foreground' />
                <input type='file' className='opacity-0 absolute w-10 h-10 bottom-0 left-0 rounded-full' accept=".jpg, .jpeg, .png" onChange={onChange}/>
            </div>
        </div></>
    )
}

export default ImageProfile