import {Navigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import env from "../config/env";
import {toast, ToastContainer} from "react-toastify";
import {jwtDecode} from "jwt-decode";
import NavBar from "../components/NavBar";
import {Button, Card, Container, Form, Modal} from "react-bootstrap";
import {Table} from "@mui/material";

function Questoes() {
    const params = useParams()
    const [questoes, setQuestoes] = useState([])
    const [questoesPorSubmeter, setQuestoesPorSubmeter] = useState([])
    const [solucao, setSolucao] = useState('')
    const [erroJSON, setErroJSON] = useState('');
    const [tipo, setTipo] = useState('')
    const [imagem, setImagem] = useState('')
    const [descricao, setDescricao] = useState('')
    const [cotacao, setCotacao] = useState('')
    const [showFormQuestao, setFormQuestao] = useState(false);

    const handleCloseFormQuestao = () => setFormQuestao(false);
    const handleShowFormQuestao = () => setFormQuestao(true);

    useEffect(() => {
        axios.get(`${env.apigatewayAP}/questoes/${params.id}?token=${localStorage.token}`)
            .then(result => {
                setQuestoes(result.data)
            })
            .catch(err => {
                toast.error("Não foi possível obter as questões da versão!", {
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

    const handleSubmitForm = (event) => {
        event.preventDefault();

        let questao = {
            solucao: solucao,
            tipo: parseInt(tipo),
            imagem: imagem,
            descricao: descricao,
            cotacao: parseInt(cotacao)
        }
        setQuestoesPorSubmeter(prevQuestoesPorSubmeter => [...prevQuestoesPorSubmeter, questao]);
        setQuestoes(prevQuestoes => [...prevQuestoes, questao]);
        toast.success("Questão guardada com sucesso!", {
            position: toast.POSITION.TOP_CENTER
        })
    };

    const handleJSONChange = (e) => {
        const valor = e.target.value;
        setSolucao(valor); // Atualiza o valor do textarea

        // Tenta fazer o parse do JSON
        try {
            const obj = JSON.parse(valor);
            setErroJSON(''); // Limpa qualquer erro anterior se o parse foi bem-sucedido
            // Aqui você pode usar 'obj', que é o objeto JavaScript parseado do JSON
        } catch (erro) {
            setErroJSON('JSON inválido.'); // Define a mensagem de erro
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post(`${env.apigatewayAP}/questoes/${params.id}?token=${localStorage.token}`, {
            questoes: questoesPorSubmeter
        })
            .then(data => {
                toast.success("Questoes adicionadas com sucesso!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
            .catch(err => {
                console.log(err)
                toast.error("Não foi possível adicionar as questões!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    }


    const questaoForm = (
        <>
            <Form onSubmit={handleSubmitForm}>
                <Form.Group className="mb-3">
                    <Form.Label>Tipo da Questão</Form.Label>
                    <Form.Control
                        type="number"
                        value={tipo}
                        onChange={e => setTipo(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                        <Form.Label>Cotação da Questão</Form.Label>
                    <Form.Control
                        type="number"
                        value={cotacao}
                        onChange={e => setCotacao(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Descrição</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Insira a descrição"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Imagem (URL)</Form.Label>
                    <Form.Control
                        type="url"
                        placeholder="Insira o URL da imagem"
                        value={imagem}
                        onChange={(e) => setImagem(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Solução (JSON)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Insira a solução em formato JSON"
                        value={solucao}
                        onChange={handleJSONChange}
                    />
                    {erroJSON && <div style={{ color: 'red' }}>{erroJSON}</div>}
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
                <Card className='mt-4'>
                    <Card.Body>
                        <Container className="my-3">
                            <Button className="mb-3" variant="outline-dark" onClick={handleShowFormQuestao}>
                                Adicionar Questão
                            </Button>
                            <Button className="mb-3 ms-3" variant="outline-dark" onClick={handleSubmit}>
                                Submeter Questoẽs Adicionadas
                            </Button>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Imagem</th>
                                    <th>Descrição</th>
                                    <th>Cotação</th>
                                    <th>Solução</th>
                                </tr>
                                </thead>
                                <tbody>
                                {questoes.map((questao, index) => (
                                    <tr key={index}>
                                        <td>{questao.tipo}</td>
                                        <td>{questao.imagem}</td>
                                        <td>{questao.descricao}</td>
                                        <td>{questao.cotacao}</td>
                                        <td>{questao.solucao}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Container>
                    </Card.Body>
                </Card>
            </Container>

            <Modal show={showFormQuestao} onHide={handleCloseFormQuestao}>
                <Modal.Header closeButton>
                    <Modal.Title>Adicioner Questao</Modal.Title>
                </Modal.Header>
                <Modal.Body>{questaoForm}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseFormQuestao}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Questoes