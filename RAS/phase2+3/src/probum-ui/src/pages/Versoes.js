import {Navigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import env from "../config/env";
import {toast, ToastContainer} from "react-toastify";
import {jwtDecode} from "jwt-decode";
import {Button, Card, Container, Form, Modal} from "react-bootstrap";
import NavBar from "../components/NavBar";
import {Table} from "@mui/material";

function Versoes() {
    const params = useParams()
    const [prova, setProva] = useState(null)
    const [versaoNum, setVersaoNum] = useState('')
    const [idSala, setIdSala] = useState('')
    const [horaInicio, setHoraInicio] = useState('')
    const [idAlunos, setIdAlunos] = useState('')
    const [versoes, setVersoes] = useState([])
    const [showFormVersao, setFormVersao] = useState(false);
    const [refreshVersoes, setRefreshVersoes] = useState(0);
    const [salasDisponiveis, setSalasDisponiveis] = useState([]);
    const [numAlunos, setNumAlunos] = useState(0);

    const handleCloseFormVersao = () => setFormVersao(false);
    const handleShowFormVersao = () => setFormVersao(true);

    useEffect(() => {
        axios.get(`${env.apigatewayAP}/versoes/${params.id}?token=${localStorage.token}`)
            .then(result => {
                console.log(result.data)
                setVersoes(result.data)
            })
            .catch(err => {
                toast.error("Não foi possível obter as versões da prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })

    }, [refreshVersoes]);

    useEffect(() => {
        axios.get(`${env.apigatewayAP}/provas/${params.id}?token=${localStorage.token}`)
            .then(result => {
                setProva(result.data.prova)
            })
            .catch(err => {
                console.log(err.message)
                toast.error("Não foi possível obter a prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })

    }, []);

    const carregarSalasDisponiveis = () => {
        const startTime = new Date(horaInicio);
        const endTime = new Date(startTime); // Cria uma nova instância de Date baseada em startTime
        endTime.setMinutes(startTime.getMinutes() + prova.duracao); // Adiciona a duração ao startTime

        axios.get(`${env.apigatewayAP}/salas?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}&numAlunos=${numAlunos}&token=${localStorage.token}`)
            .then(result => {
                console.log(result.data)
                setSalasDisponiveis(result.data);
            })
            .catch(err => {
                toast.error("Não foi possível obter as salas disponíveis!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    }

    useEffect(() => {
        if (horaInicio && numAlunos) {
            carregarSalasDisponiveis();
        }
    }, [horaInicio, numAlunos]);

    let decodedToken
    try {
        decodedToken = jwtDecode(localStorage.getItem("token"));
    } catch {
        return <Navigate to="/login" />
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const ids = content.split(/,|\n/).map(id => id.trim()).filter(Boolean);
                setIdAlunos(ids);
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const startTime = new Date(horaInicio);
        const endTime = new Date(startTime); // Cria uma nova instância de Date baseada em startTime
        endTime.setMinutes(startTime.getMinutes() + prova.duracao); // Adiciona a duração ao startTime

        axios.put(`${env.apigatewayAP}/alocaSalas?token=${localStorage.token}`,
        [{"id" : idSala, "startTime": startTime, "endTime": endTime }]
        )
            .then(data => {
                axios.post(`${env.apigatewayAP}/versoes?token=${localStorage.token}`, {
                    idProva: parseInt(params.id),
                    versaoNum: parseInt(versaoNum),
                    idSala: idSala,
                    horaInicio: new Date(horaInicio).toISOString(),
                    idAlunos: idAlunos
                })
                    .then(data => {
                        setRefreshVersoes(prev => prev + 1);
                        toast.success("Versão adicionada com sucesso!", {
                            position: toast.POSITION.TOP_CENTER
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        toast.error("Não foi possível adicionar a versão!", {
                            position: toast.POSITION.TOP_CENTER
                        })
                    })
            })
            .catch(err => {
                console.log(err)
                toast.error("Não foi possível reservar a sala!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    };


    const versaoForm = (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Número da Versão</Form.Label>
                    <Form.Control
                        type="number"
                        value={versaoNum}
                        onChange={e => setVersaoNum(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Número de Alunos</Form.Label>
                    <Form.Control
                        type="number"
                        value={numAlunos}
                        onChange={e => setNumAlunos(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Hora de Início</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={horaInicio}
                        onChange={e => setHoraInicio(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Selecione uma Sala</Form.Label>
                    <Form.Control
                        as="select"
                        value={idSala}
                        onChange={e => setIdSala(e.target.value)}
                    >
                        <option value="">Selecione uma sala</option>
                        {salasDisponiveis.map(sala => (
                            <option key={sala.id} value={sala._id}>
                                Sala {sala.building}.{sala.floor}.{sala.room} - Capacidade: {sala.capacity}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>IDs dos Alunos (upload de arquivo)</Form.Label>
                    <Form.Control
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Enviar
                </Button>
            </Form>
        </>
    )

    return (
        <>
            <NavBar/>
            <ToastContainer/>
            <Container>
                <Card className='mt-4 d-flex justify-content-center' style={{ boxShadow: '0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%)' }} >
                    <Card.Body>
                        <Container className="my-3 vw-100">
                            <Button className="mb-3" variant="outline-dark" onClick={handleShowFormVersao}>
                                Adicionar Versão
                            </Button>

                            <Table>
                                <thead>
                                <tr>
                                    <th>Número da Versão</th>
                                    <th>Sala</th>
                                    <th>Hora de Início</th>
                                    <th>Alunos</th>
                                </tr>
                                </thead>
                                <tbody>
                                {versoes.map(versao => (
                                    <tr key={versao.id_versao}>
                                        <td>{versao.num_versao}</td>
                                        <td>{versao.id_sala}</td>
                                        <td>{new Date(versao.horario).toLocaleString()}</td>
                                        <td>{versao.num_mec.join(", ")}</td>
                                        <td>
                                            <Button href={`/questoes/${versao.id_versao}/consultar`} className="btn-sm" variant="outline-dark">Consultar Questões</Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Container>
                    </Card.Body>
                </Card>
            </Container>

            <Modal show={showFormVersao} onHide={handleCloseFormVersao}>
                <Modal.Header closeButton>
                    <Modal.Title>Adicionar Versao</Modal.Title>
                </Modal.Header>
                <Modal.Body>{versaoForm}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseFormVersao}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )


}

export default Versoes