import {Navigate, useParams} from "react-router-dom"
import {Container, Card, Button, Form, Modal, ListGroup} from "react-bootstrap"
import { ToastContainer, toast } from "react-toastify"
import NavBar from "../components/NavBar";
import {useEffect, useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import env from "../config/env";

function Prova() {
    const params = useParams()
    const [nome, setNome] = useState("")
    const [duracao, setDuracao] = useState(0)
    const [backtrack, setBacktrack] = useState(false)
    const [random, setRandom] = useState(false)
    const [provaId, setProvaId] = useState(params.id)
    const [alunos, setAlunos] = useState([])
    const [salas, setSalas] = useState([])
    const [estado, setEstado] = useState(0);
    const [showAlunos, setShowAlunos] = useState(false);
    const [showSalas, setShowSalas] = useState(false);

    const handleCloseAlunos = () => setShowAlunos(false);
    const handleShowAlunos = () => setShowAlunos(true);
    const handleCloseSalas = () => setShowSalas(false);
    const handleShowSalas = () => setShowSalas(true);

    useEffect(() => {
        axios.get(`${env.apigatewayAP}/provas/${params.id}?token=${localStorage.token}`)
            .then(result => {
                console.log(result.data)
                setNome(result.data.prova.nome)
                setProvaId(result.data.prova.id_prova)
                setDuracao(result.data.prova.duracao)
                setRandom(result.data.prova.random)
                setBacktrack(result.data.prova.backtrack)
                setAlunos(result.data.alunos || [])
                setSalas(result.data.salas)
                setEstado(result.data.prova.estado)
            })
            .catch(err => {
                toast.error("Não foi possível obter a prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })

    }, []);

    let decodedToken
    try {
        decodedToken = jwtDecode(localStorage.getItem("token"));
    } catch {
        return <Navigate to="/login" />
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        axios.put(`${env.apigatewayAP}/provas/${provaId}?token=${localStorage.token}`, {
            random: random,
            backtrack: backtrack
        })
            .then(data => {
                toast.success("Configurações atualizadas com sucesso!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
            .catch(err => {
                toast.error("Não foi possível atualziar as configurações da prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    }

    const alunosModal = (
        <>
            <Modal show={showAlunos} onHide={handleCloseAlunos}>
                <Modal.Header closeButton>
                    <Modal.Title>Alunos</Modal.Title>
                </Modal.Header>
                <Modal.Body>{alunos}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAlunos}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )

    const salasModal = (
        <>
            <Modal show={showSalas} onHide={handleCloseSalas}>
                <Modal.Header closeButton>
                    <Modal.Title>Salas</Modal.Title>
                </Modal.Header>
                <Modal.Body>{salas}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSalas}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )

    const docentePart = (
        <>
            <p>Estado: {estado === 0 ? 'Classificações não disponíveis' : 'Classificações disponíveis'}</p>
            <Button className="mb-3" variant="outline-dark" onClick={handleShowAlunos}>
                Alunos
            </Button>
            {alunosModal}
            <Button className="ms-2 mb-3" variant="outline-dark" onClick={handleShowSalas}>
                Salas
            </Button>
            {salasModal}
            <h5 className="mb-3">Configuração</h5>
            <Form onSubmit={handleSubmit}>
                <Form.Check className="mb-3" type="checkbox" label="Random" checked={random}
                            onChange={(e) => setRandom(e.target.checked)}/>
                <Form.Check className="mb-3" type="checkbox" label="Backtrack" checked={backtrack}
                            onChange={(e) => setBacktrack(e.target.checked)}/>
                <div className="mb-3 d-flex justify-content-start">
                    <Button type="submit" variant="outline-dark">Atualizar configurações</Button>
                </div>
            </Form>
            <div className="d-flex justify-content-start">
                <Button href={`/versoes/${provaId}`} variant="outline-dark">Consultar Versões</Button>
                {estado === 0 &&
                    <Button className="ms-3" variant="outline-dark" onClick={() => publicarClassificacoes(provaId)}>Publicar
                        Classificações</Button>}
                {estado === 0 && <Button className="ms-3" variant="outline-dark" onClick={() => corrigirProva(provaId)}>Corrigir
                    Prova</Button>}
            </div>
        </>
    )

    const studentPart = (
        <>
            <div className="d-flex justify-content-start">
                { estado === 1 && <Button variant="outline-dark" onClick={() => consultarCorrecao(provaId)}>Consultar Correção</Button> }
                { estado === 0 && <Button className="ms-3" variant="outline-dark" href={`/provas/${provaId}/responder/${decodedToken._id}`}>Responder à prova</Button> }
            </div>
        </>
    )

    const publicarClassificacoes = (id) => {
        axios.put(`${env.apigatewayAP}/provas/${id}/classificacoes/publicar?token=${localStorage.token}`, {alunos : alunos})
            .then(result => {
                toast.success("Classificações publicadas com sucesso!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
            .catch(err => {
                toast.error("Não foi possível publicar as classificações da prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    };

    const corrigirProva = (id) => {
        axios.get(`${env.apigatewayAP}/provas/${id}/correcaoAutomatica?token=${localStorage.token}`)
            .then(result => {
                toast.success("Prova corrigida com sucesso!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
            .catch(err => {
                toast.error("Não foi possível corrigir a a prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    };

    const consultarCorrecao = (id) => {
        // Aqui você adicionaria a lógica para corrigir as classificações
    };

    return (
        <>
            <NavBar/>
            <ToastContainer/>
            <Container>
                <Card className='mt-4 d-flex justify-content-center' style={{ boxShadow: '0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%)' }} >
                    <Card.Body>
                        <Container className="my-3">
                            <h4 className="mb-3">Prova: {nome}</h4>
                            <p className="mb-3">Duração: {duracao}</p>
                            { decodedToken.type !== 0 && docentePart }
                            { decodedToken.type === 0 && studentPart }
                        </Container>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )

}

export default Prova