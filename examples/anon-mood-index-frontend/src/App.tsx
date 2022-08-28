import "./App.css";
import RainbowAndWagmiProvider from "./RainbowAndWagmiProvider";
import Profile from "./Profile";
import AverageMoodIndex from "./AverageMoodIndex";

function App() {
  return (
    <RainbowAndWagmiProvider>
      <div className="App">
        <AverageMoodIndex />
        <Profile />
      </div>
    </RainbowAndWagmiProvider>
  );
}

export default App;
