import {jwtDecode} from "jwt-decode";
import {Navigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
import {Button, Card, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import NavBar from "../components/NavBar";
import env from "../config/env"

function ProvaForm() {
    const [nome, setNome] = useState("")
    const [duracao, setDuracao] = useState("")
    const [numDocente, setNumDocente] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [provaId, setProvaId] = useState(null)

    useEffect(() => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return <Navigate to="/login" />

            const decodedToken = jwtDecode(token);
            setNumDocente(decodedToken._id);
        } catch {
            return <Navigate to="/login" />
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault()
        axios.post(`${env.apigatewayAP}/provas?token=${localStorage.token}`, {
            nome: nome,
            duracao: parseInt(duracao),
            numDocente: numDocente
        })
            .then(result => {
                toast.success("Prova criada com sucesso!", {
                    position: toast.POSITION.TOP_CENTER
                })
                setProvaId(result.data.data.id_prova)
                setIsSubmitted(true)
            })
            .catch(err => {
                console.log(err)
                toast.error("Não foi possível criar a prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    }

    const registerForm = (
        <>
            <NavBar/>
            <ToastContainer />
            <Container>
                <Card className='mt-4 d-flex justify-content-center' style={{ boxShadow: '0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%)' }} >
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Container className="my-3">
                                <h4 className="mb-3">Criar Prova</h4>
                                <FloatingLabel className="mb-3 form-outline" label="Nome">
                                    <Form.Control type="text" placeholder="Nome" value={nome}
                                                  onChange={(e) => setNome(e.target.value)}/>
                                </FloatingLabel>

                                <FloatingLabel className="mb-3 form-outline" label="Duração">
                                    <Form.Control type="text" placeholder="Duração" value={duracao}
                                                  onChange={(e) => setDuracao(e.target.value)}/>
                                </FloatingLabel>

                                <div className="d-flex justify-content-center">
                                    <Button type="submit" variant="outline-dark">Criar Prova</Button>
                                </div>
                            </Container>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )

    return (
        <>
            {isSubmitted ? <Navigate to={`/provas/${provaId}`} /> : registerForm}
        </>
    )
}

export default ProvaForm
