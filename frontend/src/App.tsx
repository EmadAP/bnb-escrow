import { useState } from "react";

import Container from "./components/Container";
import Navbar from "./components/Navbar";

type AppView = "home" | "create" | "lookup" | "transaction" | "escrow";

function App() {
  const [view, setView] = useState<AppView>("home");

  return (
    <main className="min-h-svh w-full">
      <Navbar />

      <Container>
        {view === "home" && (
          <section>
            <h2>Home</h2>

            <div className="mt-4 flex gap-4">
              <button onClick={() => setView("create")}>
                Create an Escrow
              </button>

              <button onClick={() => setView("lookup")}>
                Open Existing Escrow
              </button>
            </div>
          </section>
        )}

        {view === "create" && (
          <section>
            <h2>Create Escrow</h2>

            <button onClick={() => setView("transaction")}>Continue</button>
          </section>
        )}

        {view === "lookup" && (
          <section>
            <h2>Open Existing Escrow</h2>

            <button onClick={() => setView("escrow")}>Open Escrow</button>
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
