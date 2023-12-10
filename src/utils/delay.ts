export const delay = (milissegundos: number) => {
    return new Promise(resolve => {
      setTimeout(resolve, milissegundos);
    });
  }