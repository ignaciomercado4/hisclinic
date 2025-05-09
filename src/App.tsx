import { useState } from "react";


const recognition = new  window.webkitSpeechRecognition()

recognition.lang = "es-AR"
recognition.continuous = false


function App() {
  const [isRecording, setIsRecording] = useState<boolean>(false)

  function handleStartRecording() {
    setIsRecording(true)
    recognition.start();
    recognition.addEventListener("result", event => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("")

      console.log(transcript);
    })
  }

  function handleEndRecording() {
    setIsRecording(false)
    recognition.stop();
  }

  return (
    <main className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] px-4">
      <header className="text-xl font-bold leading-[4rem]">AI Chat</header>
      <section className="py-8 grid place-content-center">
        <button 
          className={`h-96 w-96 rounded-full border-8 border-neutral-600 transition-colors text-xl ${isRecording ? "bg-green-500" : "bg-red-500"}`}
          onClick={() => setIsRecording((isRecording) => !isRecording)}
          >{`${isRecording ? "Escuchando..." : ""}`}</button>
      </section>
      <footer className="text-center leading-[4rem] opacity-70">
        © {new Date().getFullYear()} Ignacio Mercado
      </footer>
    </main>
  );
}

export default App;
