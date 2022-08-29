import "./App.css";
import RainbowAndWagmiProvider from "./RainbowAndWagmiProvider";
import Profile from "./Profile";
import PohSemaphoreGroup from "./PohSemaphoreGroup";

function App() {
  return (
    <RainbowAndWagmiProvider>
      <div className="App">
        <Profile />
        <PohSemaphoreGroup />
      </div>
    </RainbowAndWagmiProvider>
  );
}

export default App;
