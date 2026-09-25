import Container from "./components/Container";
import Navbar from "./components/Navbar";

function App() {
  return (
    <main className="min-h-svh w-full">
      <Navbar />
      <Container className="min-h-svh">App</Container>
    </main>
  );
}

export default App;
