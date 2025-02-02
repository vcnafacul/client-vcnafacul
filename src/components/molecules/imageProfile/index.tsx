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
            <div className='border border-zinc-600 rounded-full'>
                {src ? <img className='w-40 h-40 rounded-full relative object-cover' src={src} /> : 
                <div className='w-40 h-40 rounded-full bg-zinc-300 flex justify-center items-center'>
                    <PreviewIcon className='w-20 h-20' /></div>}
            </div>
            {src ? <div className={`absolute bottom-3 right-1 bg-zinc-200 border-zinc-400 py-2 px-2 select-none rounded-full border`} onClick={deleteImage}>
                <IoTrash className='w-4 h-4 fill-zinc-900' />
            </div> : <></>}
            <div className={`absolute bottom-3 left-0 bg-zinc-200 border-zinc-400 py-2 px-2 select-none rounded-full border`}>
                <EditIcon className='w-4 h-4 fill-zinc-900' />
                <input type='file' className='opacity-0 absolute w-10 h-10 bottom-0 left-0 rounded-full' accept=".jpg, .jpeg, .png" onChange={onChange}/>
            </div>
        </div></>
    )
}

export default ImageProfile