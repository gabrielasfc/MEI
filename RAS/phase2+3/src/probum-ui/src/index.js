import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Prova from "./pages/Prova";
import Error from "./components/Error";
import Alunos from "./pages/Alunos";
import Docentes from "./pages/Docentes";
import Questoes from "./pages/Questoes";
import Perfil from "./pages/Perfil";
import ProvaForm from "./pages/ProvaForm";
import Salas from "./pages/Salas";
import Notificacoes from "./pages/Notificacoes";
import Provas from "./pages/Provas";
import Versoes from "./pages/Versoes";
import ResponderProva from "./pages/ResponderProva";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                
                <Route path="/login" element={<Login />} />
                <Route path="/alunos" element={<Alunos />} />
                <Route path="/docentes" element={<Docentes />} />
                <Route path="/perfil" element={<Perfil />} />

                <Route path="/provas/criar" element={<ProvaForm />} />
                <Route path="/provas/:id/responder/:num" element={<ResponderProva />} />
                <Route path="/provas/:id" element={<Prova />} />
                <Route path="/provas" element={<Provas />} />
                <Route path="/versoes/:id" element={<Versoes />} />
                <Route path="/questoes/:id/consultar" element={<Questoes />} />

                <Route path="/salas" element={<Salas />} />

                <Route path="/notificacoes" element={<Notificacoes />} />

                <Route
                    path="*"
                    element={
                        <Error error={{ message: "Página Inexistente" }} />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
