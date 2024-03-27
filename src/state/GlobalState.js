import { entity } from 'simpler-state';
export const siteTitle = entity('MEGA Notify');
export const setSiteTitle = (title) => {
  siteTitle.set(title);
};

//-- Exemplo
// export const reset = () => {
//   counter.set(0)
// }
// export const increment = by => {
//   counter.set(value => value + by)
//   // --OR-->  counter.set(counter.get() + by)
// }

// ---- Antigo
// import * as React from 'react';
// const GlobalContext = React.createContext({
//   siteTitle: 'MEGA Notify',
// });
// export default GlobalContext;
