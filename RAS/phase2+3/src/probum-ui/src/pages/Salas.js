import React, { useState, useEffect } from 'react'
import { Navigate, Link } from "react-router-dom"
import { Accordion, ListGroup, Modal, ListGroupItem, Container, Card, Form, Row, Col, FloatingLabel } from "react-bootstrap"
import { Pencil, Trash3, Check } from 'react-bootstrap-icons'
import Button from '@mui/material/Button'
import { ToastContainer, toast } from "react-toastify"
import { jwtDecode } from "jwt-decode"
import axios from "axios"
import env from "../config/env"
import NavBar from "../components/NavBar";

function formatDate(isoString) {
    const date = new Date(isoString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}:`;
}

function formatTime(isoString) {
    const date = new Date(isoString)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`;
}


function Salas() {
    const [salas, setSalas] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [deleteSalaID, setDeleteSalaID] = useState(null)
    const [refresh, setRefresh] = useState("")
    const [decodedToken, setDecodedToken] = useState(null)
    const [showFicheiro, setShowFicheiro] = useState(false)
    const [showAdd, setShowAdd] = useState(false)
    const [jsonContent, setJsonContent] = useState(null);

    const [form, setForm] = useState({
        "building": "",
        "floor": 0,
        "room": "",
        "capacity": 0
    })

    useEffect(() => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return <Navigate to="/login" />

            setDecodedToken(jwtDecode(token))

            axios.get(`${env.apigatewayAP}/salas?token=${localStorage.token}`)
                .then(response => {
                    setSalas(response.data)
                })
                .catch(error => {
                    console.log(error)
                    toast.error("Não foi possível obter a lista de salas!", {
                        position: toast.POSITION.TOP_CENTER
                    })
                })
        } catch {
            return <Navigate to="/login" />
        }
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                console.log(json)

                axios.post(`${env.apigatewayAP}/salas/file?token=${localStorage.token}`, json)
                    .then((response) => {
                        toast.success("As salas foram adicionadas com sucesso!", { position: toast.POSITION.TOP_CENTER });
                    })
                    .catch((error) => {
                        toast.error("Não foi possível adicionar as salas!", { position: toast.POSITION.TOP_CENTER });
                    });
                
                setRefresh(new Date().toISOString())

            } catch (error) {
                console.error(error);
                toast.error("Não foi possível obter a informação do ficheiro!", {
                    position: toast.POSITION.TOP_CENTER
                });
            }
        };
        reader.readAsText(file);

        setRefresh(new Date().toISOString())
    };

    const handleShowModal = (event, id) => {
        setDeleteSalaID(id)
        setShowModal(true)
    }


    const handleHideModal = () => {
        setShowModal(false)
        setDeleteSalaID(null)
    }


    const handleDelete = async (event, id) => {
        try {
            await axios.delete(`${env.apigatewayAP}/salas/${id}?token=${localStorage.token}`)

            setSalas(current => { return current.filter((item) => item._id.toString() !== id) })

            toast.success('A sala foi removida com sucesso!', {
                position: toast.POSITION.TOP_CENTER
            })
        } catch (error) {
            toast.error('Não foi possível remover a sala!', {
                position: toast.POSITION.TOP_CENTER
            })
        }

        handleHideModal();
        setRefresh(new Date().toISOString())
    }

    const handleChange = (e, field) => {
        if (field === "floor" || field === "capacity") form[field] = Number(e.target.value)
        else form[field] = e.target.value
        setRefresh(new Date().toISOString())
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        console.log([form])

        axios.post(`${env.apigatewayAP}/salas/file?token=${localStorage.token}`, [form])
            .then((response) => {
                toast.success("A sala foi adicionado com sucesso!", { position: toast.POSITION.TOP_CENTER })
            })
            .catch((error) => {
                toast.error("Não foi possível adicionar a sala!", { position: toast.POSITION.TOP_CENTER })
            })

        setRefresh(new Date().toISOString())
    }

    if (decodedToken) {
        return (
            <>
                <NavBar />
                <ToastContainer />
                <Container>
                    <hr className="mt-4 mb-4" />
                    <Card className='mt-4 d-flex justify-content-center' style={{ boxShadow: '0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%)' }} >
                        <Card.Body>
                            <div className="d-flex justify-content-end">
                                {decodedToken.type === 2 && (
                                    <>
                                        <Button
                                            className="mb-1 mt-3"
                                            variant="outline-light"
                                            style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff', marginRight: '10px' }}
                                            onClick={() => setShowAdd(true)}
                                        >Inserir Sala
                                        </Button>
                                        <Button
                                            className="mb-1 mt-3"
                                            variant="outline-light"
                                            style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                            onClick={() => setShowFicheiro(true)}
                                        >Inserir Ficheiro
                                        </Button>
                                    </>
                                )}
                            </div>
                            {showFicheiro &&
                                <Container className="my-4 mb-5">
                                    <h4 className="mb-3">Adicionar Salas</h4>
                                    <input type="file" accept=".json" onChange={handleFileChange} />
                                </Container>
                            }
                            {showAdd &&
                                <Form onSubmit={handleSubmit}>
                                    <Container className="my-4 mb-5">
                                        <h4 className="mb-3">Adicionar Sala</h4>
                                        <Row className="gx-3 mb-3">
                                            <Col md={6}>
                                                <FloatingLabel className="mb-3 form-outline" label="Edifício">
                                                    <Form.Control required type="text" placeholder="Edifício" value={form["building"]} onChange={(e) => handleChange(e, "building")} />
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={6}>
                                                <FloatingLabel className="mb-3 form-outline" label="Piso">
                                                    <Form.Control required type="number" placeholder="Piso" value={form["floor"]} onChange={(e) => handleChange(e, "floor")} />
                                                </FloatingLabel>
                                            </Col>
                                        </Row>
                                        <Row className="gx-3 mb-3">
                                            <Col md={6}>
                                                <FloatingLabel className="mb-3 form-outline" label="Sala">
                                                    <Form.Control required type="text" placeholder="Sala" value={form["room"]} onChange={(e) => handleChange(e, "room")} />
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={6}>
                                                <FloatingLabel className="mb-3 form-outline" label="Capacidade">
                                                    <Form.Control required type="number" placeholder="Capacidade" value={form["capacity"]} onChange={(e) => handleChange(e, "capacity")} />
                                                </FloatingLabel>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}></Col>
                                            <Col md={6}>
                                                <div className="d-flex justify-content-end mt-2">
                                                    <Button type="submit" className="mx-2" variant="outline-dark" startIcon={<Check />}>Adicionar Sala</Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Form>
                            }
                            <Container className="my-4"><h4>Salas</h4></Container>
                            <Accordion className='mb-4'>
                                {salas.map((sala, index) => (
                                    <Accordion.Item eventKey={index}>
                                        <Accordion.Header>
                                            <Container><b>Sala: </b>{sala.building}-{sala.floor}-{sala.room}</Container>
                                            <Container className='d-flex justify-content-end px-3'>
                                                {decodedToken.type === 2 &&
                                                    <>
                                                        { /* <Link to={"/edit/" + sala._id}> <Pencil size={20} color='black' className='mx-3' /> </Link> */ }
                                                        <Link><Trash3 size={20} color='black' className='mx-3' onClick={(event) => handleShowModal(event, sala._id.toString())} /></Link>
                                                        <Modal show={showModal && sala._id === deleteSalaID} onHide={handleHideModal}>
                                                            <Modal.Header closeButton>
                                                                <Modal.Title>Confirmação de Remoção</Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                <div className="alert alert-danger">Tem a certeza que pretende remover esta sala?</div>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button variant="default" onClick={handleHideModal}>Cancelar</Button>
                                                                <Button variant="danger" onClick={(event) => handleDelete(event, deleteSalaID)}>Remover</Button>
                                                            </Modal.Footer>
                                                        </Modal>
                                                    </>
                                                }
                                            </Container>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <ListGroup>
                                                <ListGroupItem><b>Edifício: </b>{sala.building}</ListGroupItem>
                                                <ListGroupItem><b>Piso: </b>{sala.floor}</ListGroupItem>
                                                <ListGroupItem><b>Número: </b>{sala.room}</ListGroupItem>
                                                <ListGroupItem><b>Capacidade: </b>{sala.capacity}</ListGroupItem>
                                                <ListGroupItem>
                                                    <b>Alocações: </b>
                                                    <ListGroup className="list-group-flush">
                                                        {sala["allocations"].map((obj) => (
                                                            <ListGroupItem><b>{formatDate(obj.startTime)}</b> {formatTime(obj.startTime)} - {formatTime(obj.endTime)}</ListGroupItem>
                                                        ))}
                                                    </ListGroup>
                                                </ListGroupItem>
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Container>
            </>
        )
    }
}

export default Salas
