import { useAppStore } from "@/stores/app-store";

import Container from "./components/Container";
import Navbar from "./components/Navbar";
import CreateEscrow from "./components/screens/CreateEscrow";
import Transaction from "./components/screens/Transaction";
import Escrow from "./components/screens/Escrow";
import Hero from "./components/screens/Hero";

function App() {
  const view = useAppStore((state) => state.view);

  return (
    <main className="min-h-svh w-full">
      <Navbar />

      <Container>
        {view === "home" && <Hero />}

        {view === "create" && <CreateEscrow />}

        {view === "transaction" && <Transaction />}

        {view === "escrow" && <Escrow />}
      </Container>
    </main>
  );
}

export default App;
