import { useAppStore } from "@/stores/app-store";

import Container from "./components/Container";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CreateEscrow from "./components/CreateEscrow";

function App() {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);

  return (
    <main className="min-h-svh w-full">
      <Navbar />

      <Container>
        {view === "home" && <Hero />}

        {view === "create" && <CreateEscrow />}

        {view === "transaction" && (
          <section>
            <h2>Transaction</h2>

            <button onClick={() => setView("escrow")}>
              Transaction Complete
            </button>
          </section>
        )}

        {view === "escrow" && (
          <section>
            <h2>Escrow</h2>

            <button onClick={() => setView("home")}>Back to Home</button>
          </section>
        )}
      </Container>
    </main>
  );
}

export default App;
