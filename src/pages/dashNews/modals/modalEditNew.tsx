import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { News } from "../../../dtos/news/news"

interface ModalEditNewProps extends ModalProps{
    news: News
}

function ModalEditNew({ news, handleClose } : ModalEditNewProps){
    return (
        <ModalTemplate>
            <div className="bg-white">
                {news.title}
                <Button onClick={handleClose}>Fechar</Button>
            </div>
        </ModalTemplate>
    )
}

export default ModalEditNew