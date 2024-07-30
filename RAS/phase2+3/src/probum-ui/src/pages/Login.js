import { Navigate } from "react-router-dom"
import { useState } from "react"
import { Col, Row, Container, Card, Form, FloatingLabel } from "react-bootstrap"
import Button from '@mui/material/Button'
import { ToastContainer, toast } from "react-toastify"
import axios from "axios"
import env from "../config/env"
import ProbumIcon from '../images/probum_icon.png'

function Login() {
    const [numMec, setNumMec] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (event) => {
        axios.post(env.apigatewayAP + "/utilizadores/login", {
            numMec: numMec,
            password: password,
        })
            .then((response) => {
                const token = response.data.token
                localStorage.setItem("token", token)

                setIsSubmitted(true)
            })
            .catch((error) => {
                toast.error("Os dados introduzidos são inválidos!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })

        event.preventDefault()
    }

    const LoginForm = (
        <>
            <ToastContainer />
            <Container>
                <Row className="vh-100 d-flex align-items-center justify-content-center">
                    <Col md={8} lg={5} xs={8}>
                        <Card className="shadow-lg">
                            <Card.Body>
                                <div className="mb-3 mt-md-4">
                                    <h1 className="fw-bold mb-2">
                                        <img src={ProbumIcon} alt="ProbumIcon" style={{ marginRight: '10px', width: '80px', height: '80px' }}/>
                                        Iniciar Sessão
                                    </h1>
                                    <p className=" mb-4">Insira os seus dados para iniciar sessão.</p>
                                    <Form onSubmit={handleSubmit}>
                                        <FloatingLabel className="mb-3 form-outline" label="Número Mecanográfico">
                                            <Form.Control required type="text" placeholder="NumMec" value={numMec} onChange={(e) => setNumMec(e.target.value)} />
                                        </FloatingLabel>
                                        <FloatingLabel className="mb-3 form-outline" label="Password">
                                            <Form.Control required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </FloatingLabel>
                                        <div className="mt-4 d-grid gap-2">
                                            <Button
                                                className="mb-1"
                                                variant="outline-dark"
                                                style={{ fontSize: '15px', padding: '10px 20px', backgroundColor: '#f5f5f5', color: '#333', width: '100%' }}
                                                type="submit"
                                            >Iniciar Sessão</Button>
                                        </div>
                                    </Form>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )

    return (
        <>
            {isSubmitted ? <Navigate to="/" /> : LoginForm}
        </>
    )
}

export default Login