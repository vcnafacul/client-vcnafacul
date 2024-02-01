import { StatusEnum } from "../generic/statusEnum"

export enum StatusContent {
  Pending_Upload = 3
}

export type CombinedEnum  = StatusEnum | StatusContent;