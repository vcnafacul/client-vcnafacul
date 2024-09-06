/* eslint-disable react-refresh/only-export-components */
import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { FilterProps } from "../components/atoms/filter";
import { SelectProps } from "../components/atoms/select";
import { CardDash } from "../components/molecules/cardDash";
import { Paginate } from "../utils/paginate";
import { ButtonProps } from "../components/molecules/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DashCardContextProps<T = any> {
  title: string,
  entities: T[];
  setEntities: Dispatch<SetStateAction<T[]>>;
  onClickCard: (id: number | string) => void,
  getMoreCards: (page: number) => Promise<Paginate<T>>,
  cardTransformation: (entity: T) => CardDash,
  limitCards: number,
  filterProps?: FilterProps,
  selectFiltes?: SelectProps[];
  buttons?: ButtonProps[]
  totalItems?: number
}

const DashCardContext = createContext<DashCardContextProps | null >(null)

function useDashCardContext() {
  const context = useContext(DashCardContext);
  if(!context) {
      throw new Error(
          "DashCardContext.* component must br rendered as child of DashCardTemplate component"
      )
  }
  return context
}

export {
  DashCardContext, useDashCardContext
};
