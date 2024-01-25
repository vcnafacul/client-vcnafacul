export interface ICard {
  id: number;
  tipo: string;
  subTitle?: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  item?: string[]
}

interface ICardProps extends ICard {
  className: string;
  color: string;
}

export interface ISimulateData {
  titleBook: string;
  subTitleBook: string;
  simulateCardsBook: ICardProps[];
  titleDay: string;
  subTitleDay: string;
  simulateCardsDay: ICardProps[];
}
