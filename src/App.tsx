import { useState, useRef } from "react";

const recognition = new window.webkitSpeechRecognition();
recognition.lang = "es-AR";
recognition.continuous = true;

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const transcriptRef = useRef("");
  const [result, setResult] = useState("");
  const [patientName, setPatientName] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `Eres un asistente médico especializado en generar resúmenes de consultas médicas para historias clínicas.
      IMPORTANTE: No solicites más información. No respondas con preguntas. No digas que estás listo para ayudar.
      Tu tarea es generar directamente un resumen estructurado y conciso de la consulta médica basado únicamente en la transcripción proporcionada.
      Incluye todos los detalles médicos importantes mencionados en la transcripción, como síntomas, diagnósticos, temperaturas, presión arterial, 
      medicamentos, etc.
      Formato del resumen:
      - Paciente: [nombre del paciente]
      - Motivo de consulta: [extraído de la transcripción]
      - Sintomatología: [extraído de la transcripción]
      - Diagnóstico: [extraído de la transcripción]
      - Plan de tratamiento: [extraído de la transcripción]
      
      Si alguna sección no tiene información disponible en la transcripción, indica "No especificado" en esa sección.
      No inventes información. Usa solo los datos proporcionados en la transcripción.`,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = 0; i < event.results.length; ++i) {
      interimTranscript += event.results[i][0].transcript;
    }
    transcriptRef.current = interimTranscript;
  };

  async function handleRecording() {
    if (!isRecording) {
      if (!patientName.trim()) {
        alert("Por favor ingrese el nombre del paciente antes de grabar");
        return;
      }
      setIsRecording(true);
      transcriptRef.current = "";
      recognition.start();
    } else {
      await handleEndRecording();
    }
  }

  async function handleEndRecording() {
    setIsRecording(false);
    recognition.stop();
    setIsProcessing(true);

    // verifica si hay transcripción
    if (!transcriptRef.current.trim()) {
      setIsProcessing(false);
      alert(
        "No se detectó ninguna transcripción. Por favor intente grabar nuevamente.",
      );
      return;
    }

    // formato del mensaje que incluye el nombre del paciente y especifica claramente que ya contiene la transcripción
    const userMessage = `Genera un resumen de la siguiente consulta médica. Nombre del paciente: ${patientName}. 
    Transcripción: "${transcriptRef.current}". No solicites más información, esta es toda la transcripción disponible.`;

    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          messages: updatedMessages,
          stream: false,
        }),
      }).then((res) => res.json());

      console.log("Respuesta completa:", response);

      if (response.message && response.message.content) {
        console.log("Contenido de la respuesta:", response.message.content);
        setResult(response.message.content);
      } else {
        console.error("Estructura de respuesta inesperada:", response);
        setResult(
          "Error al procesar la respuesta. Revise la consola para más detalles.",
        );
      }
    } catch (error) {
      console.error("Error al obtener respuesta:", error);
      setResult(
        "Error de conexión al servidor. Verifique que Ollama esté funcionando correctamente.",
      );
    } finally {
      setIsProcessing(false);
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

        <div className="w-full mb-6">
          <label htmlFor="patientName" className="block text-gray-700 mb-2">
            Nombre del paciente:
          </label>
          <input
            id="patientName"
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese nombre completo del paciente"
            disabled={isRecording}
          />
        </div>

        <button
          className={`transition-all duration-200 mb-6 w-40 h-40 rounded-full flex items-center justify-center text-xl font-semibold shadow-lg
            ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
            ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={handleRecording}
          disabled={isProcessing}
        >
          {isRecording ? "Detener" : isProcessing ? "Procesando..." : "Grabar"}
        </button>

        {transcriptRef.current && !isRecording && (
          <div className="mt-2 w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Transcripción:</h3>
            <p className="text-gray-600 text-sm max-h-40 overflow-y-auto">
              {transcriptRef.current}
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 text-blue-600">Generando resumen...</div>
        )}

        {result && !isProcessing && (
          <div className="mt-6 w-full p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              Resumen de la consulta:
            </h3>
            <p className="text-gray-700">{result}</p>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  alert("Resumen copiado al portapapeles");
                }}
              >
                Copiar resumen
              </button>
            </div>
          </div>
        )}
      </div>
      <footer className="mt-10 text-gray-400 text-sm">
        © {new Date().getFullYear()} Sanatorio Boratti - Desarrollado por{" "}
        <a
          href="https://www.linkedin.com/in/ignacio-mercado/"
          className="text-blue-500 hover:underline"
        >
          Ignacio Mercado
        </a>
      </footer>
    </main>
  );
}

export default App;
