export enum Edicao {
    Regular = 'Regular',
    Digital = 'Digital',
    Reaplicacao = 'Reaplicação/PPL'
  }
  

export const edicaoArray = Object.keys(Edicao)
  .filter((key): key is keyof typeof Edicao => key in Edicao)
  .map(key => Edicao[key as keyof typeof Edicao]);