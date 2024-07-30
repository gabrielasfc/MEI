import {useEffect, useState} from "react";
import axios from "axios";
import env from "../config/env";
import {toast, ToastContainer} from "react-toastify";
import {Navigate, useSearchParams} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import NavBar from "../components/NavBar";
import {Button, Card, Container, ListGroup} from "react-bootstrap";

function Provas() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [provas, setProvas] = useState([])

    useEffect(() => {
        axios.get(`${env.apigatewayAP}/provas?num_mec=${searchParams.get("num_mec")}&token=${localStorage.token}`)
            .then(result => {
                setProvas(result.data.data)
                console.log(result.data.data)
            })
            .catch(err => {
                toast.error("Não foi possível obter as prova!", {
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

    return (
        <>
            <NavBar/>
            <ToastContainer />
            <Container>
                <Card className='mt-4 d-flex justify-content-center' style={{ boxShadow: '0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%)' }} >
                    <Card.Body>
                        <Container>
                            {decodedToken.type !== 0 && provas.map(prova => (
                                <ListGroup key={prova.id_prova} className="mb-3">
                                    <ListGroup.Item variant="primary">Nome: {prova.nome}</ListGroup.Item>
                                    <ListGroup.Item>Duração: {prova.duracao} minutos</ListGroup.Item>
                                    <ListGroup.Item>Backtrack: {prova.backtrack ? 'Sim' : 'Não'}</ListGroup.Item>
                                    <ListGroup.Item>Random: {prova.random ? 'Sim' : 'Não'}</ListGroup.Item>
                                    <ListGroup.Item>Salas: {prova.Versao && prova.Versao.map(versao => versao.id_sala).join(',')}</ListGroup.Item>
                                    <ListGroup.Item>Estado: {prova.estado === 0 ? 'Classificações não disponíveis' : 'Classificações disponíveis'}</ListGroup.Item>
                                    <ListGroup.Item>
                                        <Button variant="outline-dark" href={`/provas/${prova.id_prova}`} >Consultar Prova</Button>
                                    </ListGroup.Item>
                                </ListGroup>
                            ))}
                            {decodedToken.type === 0 && provas.map(prova => (
                                <ListGroup key={prova.id_prova} className="mb-3">
                                    <ListGroup.Item variant="primary">Nome: {prova.nome}</ListGroup.Item>
                                    <ListGroup.Item>Duração: {prova.duracao} minutos</ListGroup.Item>
                                    <ListGroup.Item>Sala: {prova.Versao && prova.Versao[0] && prova.Versao[0].id_sala}</ListGroup.Item>
                                    <ListGroup.Item>Horário: {prova.Versao && prova.Versao[0] && prova.Versao[0] && new Date(prova.Versao[0].horario).toLocaleString()}</ListGroup.Item>
                                    <ListGroup.Item>Estado: {prova.estado === 0 ? 'Classificações não disponíveis' : 'Classificações disponíveis'}</ListGroup.Item>
                                    {  prova.estado === 1 && <ListGroup.Item>Classifição: {prova.Versao[0].Versao_has_Aluno[0].classificacao} </ListGroup.Item> }
                                    {  prova.estado === 0 && <ListGroup.Item>Classifição: Classificações não disponíveis </ListGroup.Item> }
                                    <ListGroup.Item>
                                        <Button variant="outline-dark" href={`/provas/${prova.id_prova}`} >Consultar Prova</Button>
                                    </ListGroup.Item>
                                </ListGroup>
                            ))}
                        </Container>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )

}

export default Provas
