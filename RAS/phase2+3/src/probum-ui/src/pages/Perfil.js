import React, { useState } from "react"
import { Navigate } from "react-router-dom"
import Button from "@mui/material/Button"
import { Container, Row, Col, Form, Card } from "react-bootstrap"
import { Check, Pencil } from "react-bootstrap-icons"
import { ToastContainer, toast } from "react-toastify"
import NavBar from "../components/NavBar"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import env from "../config/env"

function Perfil() {
    const [numMec, setNumMec] = useState("")
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [passwordAtual, setPasswordAtual] = useState("")
    const [passwordNova, setPasswordNova] = useState("")
    const [showPasswordInputs, setShowPasswordInputs] = useState(false)
    const [nivel, setNivel] = useState("Indefinido")

    useState(() => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return <Navigate to="/login" />

            const decodedToken = jwtDecode(token);

            axios.get(`${env.apigatewayAP}/utilizadores/${decodedToken._id}?token=${localStorage.token}`)
                    .then(response => {
                        setNumMec(response.data._id)
                        setNome(response.data.name)
                        setEmail(response.data.email)

                        if (response.data.type === 0) setNivel("Aluno")
                        else if (response.data.type === 1) setNivel("Docente")
                        else if (response.data.type === 2) setNivel("Técnico")
                    })
                    .catch(error => {
                        toast.error("Não foi obter as informações do utilizador!", {
                            position: toast.POSITION.TOP_CENTER
                        })
                    })
        } catch {
            return <Navigate to="/login" />
        }
    }, []);

    const handlePassword = () => {
        setShowPasswordInputs(true)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (showPasswordInputs) {
            if (passwordAtual != null && passwordNova != null) {
                axios.put(`${env.apigatewayAP}/utilizadores/${numMec}/password?token=${localStorage.token}`, {
                    oldpwd: passwordAtual,
                    newpwd: passwordNova,
                })
                    .then((response) => {
                        toast.success("A password foi alterada com sucesso!", {
                            position: toast.POSITION.TOP_CENTER,
                        })

                        axios.put(`${env.apigatewayAP}/utilizadores/${numMec}?token=${localStorage.token}`, {
                            name: nome,
                            email: email
                        })
                            .then((response) => {
                                toast.success("As alterações foram efetuadas com sucesso!", {
                                    position: toast.POSITION.TOP_CENTER,
                                })
                            })
                            .catch((error) => {
                                toast.error("Não foi possível efetuar as alterações!", {
                                    position: toast.POSITION.TOP_CENTER,
                                })
                            })
                    })
                    .catch((error) => {
                        toast.error("Não foi possível alterar a password!", {
                            position: toast.POSITION.TOP_CENTER,
                        })
                    })
            }
        } else {
            axios.put(`${env.apigatewayAP}/utilizadores/${numMec}?token=${localStorage.token}`, {
                name: nome,
                email: email  
            })
                .then((response) => {
                    toast.success("As alterações foram efetuadas com sucesso!", {
                        position: toast.POSITION.TOP_CENTER,
                    })
                })
                .catch((error) => {
                    toast.error("Não foi possível efetuar as alterações!", {
                        position: toast.POSITION.TOP_CENTER,
                    })
                })
        }
    }
    return (
        <>
            <ToastContainer />
            <NavBar />
            <Container>
                <hr className="mt-4 mb-4" />
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={12}>
                            <Card className="mb-4" style={{ boxShadow: '0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%)' }}>
                                <Card.Body>
                                    <Row className="gx-4 mb-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small mb-1">Número Mecanográfico</Form.Label>
                                                <Form.Control disabled type="text" placeholder="NumMec" value={numMec} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small mb-1">Tipo de Utilizador</Form.Label>
                                                <Form.Control disabled type="text" placeholder="Tipo de Utilizador" value={nivel} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="gx-4 mb-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small mb-1">Nome</Form.Label>
                                                <Form.Control type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small mb-1">Email</Form.Label>
                                                <Form.Control type="email" placeholder="Email" value={email} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {!showPasswordInputs && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small mb-1">Password:</Form.Label>
                                            <div className="d-flex flex-column align-items-start">
                                                <Button variant="outline-dark" startIcon={<Pencil />} onClick={handlePassword}>Editar Password</Button>
                                            </div>
                                        </Form.Group>
                                    )}

                                    {showPasswordInputs && (
                                        <Row className="gx-4 mb-3">
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small mb-1">Password Atual</Form.Label>
                                                    <Form.Control type="password" placeholder="Password Atual" onChange={(e) => setPasswordAtual(e.target.value)} />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small mb-1">Nova Password</Form.Label>
                                                    <Form.Control type="password" placeholder="Nova Password" onChange={(e) => setPasswordNova(e.target.value)} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}

                                    <div className="d-flex justify-content-end">
                                        <Button type="submit" className="mx-2" variant="outline-dark" startIcon={<Check />}>Salvar Alterações</Button>
                                    </div>

                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </>
    )
}


export default Perfil
