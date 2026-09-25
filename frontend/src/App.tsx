import { useState } from "react";

import Container from "./components/Container";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

type AppView = "home" | "create" | "transaction" | "escrow";

function App() {
  const [view, setView] = useState<AppView>("home");

  function handleOpenEscrow(escrowId: string) {
    console.log("Open escrow:", escrowId);
    setView("escrow");
  }

  return (
    <main className="min-h-svh w-full">
      <Navbar />

      <Container>
        {view === "home" && (
          <Hero
            onCreateEscrow={() => setView("create")}
            onOpenEscrow={handleOpenEscrow}
          />
        )}

        {view === "create" && (
          <section>
            <h2>Create Escrow</h2>

            <button onClick={() => setView("transaction")}>Continue</button>
          </section>
        )}

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
