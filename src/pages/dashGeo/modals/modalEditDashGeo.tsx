import Text from "../../../components/atoms/text";
import ModalTemplate from "../../../components/templates/modalTemplate"
import { Geolocation } from "../../../types/geolocation/geolocation"

interface ModalEditDashGeoProps {
    geo: Geolocation;
}

function ModalEditDashGeo({ geo } : ModalEditDashGeoProps){
    return (
        <ModalTemplate>
            <div className="bg-white w-fit h-fit p-4 grid grid-cols-2 md:grid-cols-4">
                <div className="col-span-2">
                    <Text size="secondary">Informação do Cursinho</Text>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <div>
                        <Text size="secondary">Cadastrado Por</Text>
                    </div>
                    <div>
                        <Text size="secondary">Última Edição Por</Text>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <Text size="secondary">Endereço do Cursinho</Text>
                </div>
            </div>
        </ModalTemplate>
    )
}
export default ModalEditDashGeo