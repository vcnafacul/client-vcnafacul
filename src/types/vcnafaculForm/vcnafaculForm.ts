export enum AnswerType {
  Text = 'Text',
  Number = 'Number',
  Boolean = 'Boolean',
  Options = 'Options',
}

export enum AnswerCollectionType {
  Single = 'single',
  Multiple = 'multiple',
}

export interface VcnafaculFormBaseSchema {
    _id: string;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface VcnafaculFormQuestion extends VcnafaculFormBaseSchema {
    text: string;
    helpText: string;
    answerType: AnswerType;
    collection: AnswerCollectionType;
    options?: string[];
    active: boolean;
}

export interface VcnafaculFormSection extends VcnafaculFormBaseSchema {
    name: string;
    questions: VcnafaculFormQuestion[];
    active: boolean;
}

export interface VcnafaculForm extends VcnafaculFormBaseSchema {
    name: string;
    inscriptionId: string;
    sections: VcnafaculFormSection[];
    blocked: boolean;
    active: boolean;
}

