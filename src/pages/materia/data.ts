import { ReactComponent as LPT } from '../../assets/icons/materias/LPT.svg'
import { ReactComponent as Grammar } from '../../assets/icons/materias/Grammar.svg'
import { ReactComponent as Literature } from '../../assets/icons/materias/Literature.svg'
import { ReactComponent as English } from '../../assets/icons/materias/English.svg'
import { ReactComponent as Languages } from '../../assets/icons/materias/Languages.svg'
import { ReactComponent as Biology } from '../../assets/icons/materias/Biology.svg'
import { ReactComponent as Astronaut } from '../../assets/icons/materias/Astronaut.svg'
import { ReactComponent as Science } from '../../assets/icons/materias/Science.svg'
import { ReactComponent as Math } from '../../assets/icons/materias/Math.svg'
import { ReactComponent as History } from '../../assets/icons/materias/History.svg'
import { ReactComponent as Geo } from '../../assets/icons/materias/Geo.svg'
import { ReactComponent as Thoughts } from '../../assets/icons/materias/Thoughts.svg'
import { ReactComponent as TakingEarth } from '../../assets/icons/materias/TakingEarth.svg'
import { Materias } from '../../enums/content/materias'

export interface MateriaPage {
    title: string
    image: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    id: Materias
}

export interface DataMateriaProps {
    LPT: MateriaPage
}

export const dataMateria = {
    LPT : {
        title: 'da Leitura e Produção de Texto',
        image: LPT,
        id: Materias.LPT
    },
    Gramatica : {
        title: 'da Gramática',
        image: Grammar,
        id: Materias.Gramatica
    },
    Literatura : {
        title: 'da Literatura',
        image: Literature,
        id: Materias.Literatura
    },
    Ingles : {
        title: 'do Inglês',
        image: English,
        id: Materias.Ingles
    },
    Espanhol : {
        title: 'do Espanhol',
        image: Languages,
        id: Materias.Espanhol
    },
    Biologia : {
        title: 'da Biologia',
        image: Biology,
        id: Materias.Biologia
    },
    Fisica : {
        title: 'da Física',
        image: Astronaut,
        id: Materias.Fisica
    },
    Quimica : {
        title: 'da Química',
        image: Science,
        id: Materias.Quimica
    },
    Matematica : {
        title: 'da Matematica',
        image: Math,
        id: Materias.Matematica
    },
    Historia : {
        title: 'da História',
        image: History,
        id: Materias.Historia
    }
    ,
    Geografia : {
        title: 'da Geografia',
        image: Geo,
        id: Materias.Geografia
    }
    ,
    Filosofia : {
        title: 'da Filosofia',
        image: Thoughts,
        id: Materias.Filosofia
    }
    ,
    Sociologia : {
        title: 'da Sociologia',
        image: TakingEarth,
        id: Materias.Sociologia
    }
} as DataMateriaProps