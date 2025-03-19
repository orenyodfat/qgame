import './App.css'
import GuessGame from "./GuessGame.jsx";
import {SocketProvider} from "./SocketProvider.jsx";
import {MOCK_USER_ID} from "./constants.js";
import {createContext} from "react";
import CountProvider from "./CountProvider.jsx";

//export const CountContext = createContext();
function App() {

  return (
      <SocketProvider userId={MOCK_USER_ID}>
          <div className="app-container">
                <h1>Real-Time Quiz Game</h1>
              <div className="game-container">
                  <CountProvider>
        <GuessGame/>
            </CountProvider>
      </div>
    </div>
          </SocketProvider>
  )
}

export default App;
