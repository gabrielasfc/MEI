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

function Docentes() {
    const [users, setUsers] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [deleteNumMec, setDeleteNumMec] = useState(null)
    const [refresh, setRefresh] = useState("")
    const [decodedToken, setDecodedToken] = useState(null)
    const [showFicheiro, setShowFicheiro] = useState(false)
    const [showAdd, setShowAdd] = useState(false)
    const [jsonContent, setJsonContent] = useState(null);

    const [form, setForm] = useState({
        "numMec": "",
        "name": "",
        "email": "",
        "password": "teste",
        "type": 1
    })

    useEffect(() => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return <Navigate to="/login" />

            setDecodedToken(jwtDecode(token))

            axios.get(`${env.apigatewayAP}/utilizadores?type=1&token=${localStorage.token}`)
                .then(response => {
                    setUsers(response.data)
                })
                .catch(error => {
                    console.log(error)
                    toast.error("Não foi possível obter a lista de docentes!", {
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
                const filteredJson = json.filter(item => item.type === 1);
                setJsonContent(filteredJson);

                axios.post(`${env.apigatewayAP}/utilizadores/registerFile?token=${localStorage.token}`, filteredJson)
                    .then((response) => {
                        toast.success("Os docentes foram adicionados com sucesso!", { position: toast.POSITION.TOP_CENTER });
                    })
                    .catch((error) => {
                        toast.error("Não foi possível adicionar os docentes!", { position: toast.POSITION.TOP_CENTER });
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
    };


    const handleShowModal = (event, numMec) => {
        setDeleteNumMec(numMec)
        setShowModal(true)
    }


    const handleHideModal = () => {
        setShowModal(false)
        setDeleteNumMec(null)
    }


    const handleDelete = async (event, numMec) => {
        try {
            await axios.delete(`${env.apigatewayAP}/utilizadores/${numMec}?token=${localStorage.token}`)

            setUsers(current => { return current.filter((item) => item._id.toString() !== numMec) })

            toast.success('O docente foi removido com sucesso!', {
                position: toast.POSITION.TOP_CENTER
            })
        } catch (error) {
            toast.error('Não foi possível remover o docente!', {
                position: toast.POSITION.TOP_CENTER
            })
        }

        handleHideModal();
        setRefresh(new Date().toISOString())
    }


    const handleChange = (e, field) => {
        form[field] = e.target.value
        setRefresh(new Date().toISOString())
    }


    const handleSubmit = (event) => {
        event.preventDefault()

        axios.post(`${env.apigatewayAP}/utilizadores/register?token=${localStorage.token}`, form)
            .then((response) => {
                toast.success("O docente foi adicionado com sucesso!", { position: toast.POSITION.TOP_CENTER })
            })
            .catch((error) => {
                toast.error("Não foi possível adicionar o docente!", { position: toast.POSITION.TOP_CENTER })
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
                                        >Inserir Docente
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
                                    <h4 className="mb-3">Adicionar Docentes</h4>
                                    <input type="file" accept=".json" onChange={handleFileChange} />
                                </Container>
                            }
                            {showAdd &&
                                <Form onSubmit={handleSubmit}>
                                    <Container className="my-4 mb-5">
                                        <h4 className="mb-3">Adicionar Docente</h4>
                                        <Row className="gx-3 mb-3">
                                            <Col md={6}>
                                                <FloatingLabel className="mb-3 form-outline" label="Número Mecanográfico">
                                                    <Form.Control required type="text" placeholder="NumMec" value={form["numMec"]} onChange={(e) => handleChange(e, "numMec")} />
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={6}>
                                                <FloatingLabel className="mb-3 form-outline" label="Nome">
                                                    <Form.Control required type="text" placeholder="Nome" value={form["name"]} onChange={(e) => handleChange(e, "name")} />
                                                </FloatingLabel>
                                            </Col>
                                        </Row>
                                        <Row className="gx-3 mb-3">
                                            <Col md={6}>
                                                <FloatingLabel className="mb-3 form-outline" label="Email">
                                                    <Form.Control required type="text" placeholder="Email" value={form["email"]} onChange={(e) => handleChange(e, "email")} />
                                                </FloatingLabel>
                                            </Col>
                                            <Col md={6}>
                                                <div className="d-flex justify-content-left mt-2">
                                                    <Button type="submit" className="mx-2" variant="outline-dark" startIcon={<Check />}>Adicionar Docente</Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Form>
                            }
                            <Container className="my-4"><h4>Docentes</h4></Container>
                            <Accordion className='mb-4'>
                                {users.map((user, index) => (
                                    <Accordion.Item eventKey={index}>
                                        <Accordion.Header>
                                            <Container><b>{user._id}: </b>{user.name}</Container>
                                            <Container className='d-flex justify-content-end px-3'>
                                                {decodedToken.type === 2 &&
                                                    <>
                                                       {/* <Link to={"/edit/" + user._id}> <Pencil size={20} color='black' className='mx-3' /> </Link> */}
                                                        <Link><Trash3 size={20} color='black' className='mx-3' onClick={(event) => handleShowModal(event, user._id.toString())} /></Link>
                                                        <Modal show={showModal && user._id === deleteNumMec} onHide={handleHideModal}>
                                                            <Modal.Header closeButton>
                                                                <Modal.Title>Confirmação de Remoção</Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                <div className="alert alert-danger">Tem a certeza que pretende remover este docente?</div>
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button variant="default" onClick={handleHideModal}>Cancelar</Button>
                                                                <Button variant="danger" onClick={(event) => handleDelete(event, deleteNumMec)}>Remover</Button>
                                                            </Modal.Footer>
                                                        </Modal>
                                                    </>
                                                }
                                            </Container>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <ListGroup>
                                                <ListGroupItem><b>Email: </b>{user.email}</ListGroupItem>
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

export default Docentes