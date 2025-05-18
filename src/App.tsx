import { useState } from "react";


const recognition = new  window.webkitSpeechRecognition()

recognition.lang = "es-AR"
recognition.continuous = false


function App() {
  return (
    <main>
      Hola
    </main>
  );
}

export default App;
