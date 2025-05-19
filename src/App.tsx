import { useState, useRef } from "react";

const recognition = new window.webkitSpeechRecognition();
recognition.lang = "es-AR";
recognition.continuous = true;

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const transcriptRef = useRef<string>("");

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = "";
    for (let i = 0; i < event.results.length; ++i) {
      interimTranscript += event.results[i][0].transcript;
    }
    transcriptRef.current = interimTranscript;
  };

  function handleRecording() {
    if (!isRecording) {
      setIsRecording(true);
      transcriptRef.current = "";
      recognition.start();
    } else {
      setIsRecording(false);
      recognition.stop();
      setTimeout(() => {
        console.log(transcriptRef.current);
      }, 300);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full flex flex-col items-center">
        <div className="flex items-center gap-4 mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
            alt="Hospital"
            className="w-14 h-14"
          />
          <h1 className="text-3xl font-bold text-blue-900">
            Ayudante de Historia Clínica
          </h1>
        </div>
        <p className="text-gray-700 mb-8 text-center">
          Ingrese el nombre del paciente y presione el botón para grabar la
          consulta.
        </p>
        <button
          className={`transition-all duration-200 mb-6 w-40 h-40 rounded-full flex items-center justify-center text-xl font-semibold shadow-lg
            ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-gray-500 hover:bg-gray-700 text-white"
            }
          `}
          onClick={handleRecording}
        >
          {isRecording ? "Detener" : "Grabar"}
        </button>
        <button className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow">
          Generar resumen de consulta
        </button>
      </div>
      <footer className="mt-10 text-gray-400 text-sm">
        © {new Date().getFullYear()} Sanatorio Boratti - Desarrollado por <a href="https://www.linkedin.com/in/ignacio-mercado/">Ignacio Mercado</a>
      </footer>
    </main>
  );
}

export default App;