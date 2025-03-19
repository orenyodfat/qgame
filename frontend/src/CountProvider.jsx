import {createContext, useContext} from "react";


const CountContext = createContext();

function CountProvider({ children }) {
   return (<CountContext.Provider value={3}>
       {children}
   </CountContext.Provider>);
}

export const useCount = () => useContext(CountContext);

export default CountProvider;