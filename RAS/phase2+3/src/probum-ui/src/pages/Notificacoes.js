import {Link, Navigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {toast, ToastContainer} from "react-toastify";
import NavBar from "../components/NavBar";
import {
    Accordion,
    Button,
    Card,
    Col,
    Container,
    ListGroup,
    ListGroupItem,
    Modal,
    Row,
    ToggleButton
} from "react-bootstrap";
import Error from "../components/Error";
import env from "../config/env"
import {Trash3} from "react-bootstrap-icons";

function Notificacoes() {
    const [decodedToken, setDecodedToken] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [error, setError] = useState(null)

    const getNotifications = async () => {
        axios.get(`${env.apigatewayAP}/notificacoes/${decodedToken._id}?token=${localStorage.token}`)
            .then(result => {
                setNotifications(result.data)
                console.log(result.data)
            })
            .catch(error => {
                console.log(error)
                toast.error("Não foi possível obter a lista de notificações!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    }

    useEffect(() => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return <Navigate to="/login" />

            setDecodedToken(jwtDecode(token))

        } catch {
            return <Navigate to="/login" />
        }
        return () => {
        }
    }, []);

    useEffect(() => {
        if (decodedToken) {
            axios.get(`${env.apigatewayAP}/notificacoes/${decodedToken._id}?token=${localStorage.token}`)
                .then(result => {
                    setNotifications(result.data)
                    console.log(result.data)
                })
                .catch(error => {
                    console.log(error)
                    toast.error("Não foi possível obter a lista de notificações!", {
                        position: toast.POSITION.TOP_CENTER
                    })
                })
        }
    }, [decodedToken]);

    const handleDelete = async (event) => {
        axios.delete(`${env.apigatewayAP}/notificacoes/${decodedToken._id}?token=${localStorage.token}`)
            .then(result => {
                setNotifications([])
                console.log(result.data)
                toast.success('As notificações foram removidas com sucesso!', {
                    position: toast.POSITION.TOP_CENTER
                })
            })
            .catch(error => {
                console.log(error)
                toast.error('Não foi possível remover as notificações!', {
                    position: toast.POSITION.TOP_CENTER
                })
            })
        handleHideModal();
    }

    const handleRead = async (event, id, read) => {
        axios.put(`${env.apigatewayAP}/notificacoes/${id}/${read}?token=${localStorage.token}`)
            .then(result => {
                setNotifications([])
                console.log(result.data)

                getNotifications()

                //toast.success('O estado de leitura da notificação foi alterado!', {
                //    position: toast.POSITION.TOP_CENTER
                //})
            })
            .catch(error => {
                console.log(error)
                toast.error('Não foi possível alterar o estado de leitura da notificação!', {
                    position: toast.POSITION.TOP_CENTER
                })
            })
    }

    const handleShowModal = () => {
        setShowDeleteModal(true)
    }

    const handleHideModal = () => {
        setShowDeleteModal(false)
    }

    const page = (
        <>
            <ToastContainer />
            <NavBar/>
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title><h4>Notificações</h4></Card.Title>
                        {notifications.length > 0
                            ?<Container>
                                <Button
                                variant="primary"
                                size="lg"
                                onClick={(event) => handleShowModal()}>
                                Apagar notificações</Button>
                                <Modal show={showDeleteModal} onHide={handleHideModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Confirmação de Remoção</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className="alert alert-danger">Tem a certeza que pretende apagar todas as notificações?</div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="default" onClick={handleHideModal}>Cancelar</Button>
                                        <Button variant="danger" onClick={(event) => handleDelete(event)}>Apagar</Button>
                                    </Modal.Footer>
                                </Modal>
                            </Container>
                            :<Card.Subtitle>Não existem notificações</Card.Subtitle>
                        }
                        {notifications.map((notif, index) => (
                        <ListGroup>
                            <ListGroup.Item key={`listItem${notif.receivers[0]._id}`}>
                                <Container>
                                    <Row>
                                        <Col sm="2">
                                            {" "}
                                            <ToggleButton
                                                className="mx-1"
                                                key={`check${notif.receivers[0]._id}`}
                                                id={`check${notif.receivers[0]._id}`}
                                                type="checkbox"
                                                size="lg"
                                                checked={notif.receivers[0].read}
                                                value={notif.receivers[0]._id}
                                                onChange={(event) => handleRead(event, notif.receivers[0]._id, event.currentTarget.checked)}
                                            ></ToggleButton>
                                        </Col>
                                        <Col sm="10">{notif.creationDate} - {notif.content}</Col>
                                    </Row>
                                </Container>
                                </ListGroup.Item>
                        </ListGroup>
                        ))}
                    </Card.Body>
                </Card>
            </Container>
        </>
    )

    return (
        <>
            { error != null ? <Error error={error}/> : page }
        </>
    )

}

export default Notificacoes
