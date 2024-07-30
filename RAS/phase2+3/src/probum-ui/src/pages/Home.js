import { Navigate, useSearchParams } from "react-router-dom"
import { Col, Row, Container, Card } from "react-bootstrap"
import Button from '@mui/material/Button'
import { ToastContainer, toast } from "react-toastify"
import Navbar from '../components/NavBar'
import { jwtDecode } from "jwt-decode";

function Home() {
    let decodedToken = null
    try {
        decodedToken = jwtDecode(localStorage.getItem("token"));
    } catch (error) {
        return <Navigate to="/login" />
    }

    const docentePage = (
        <>
            <Col>
                <Card style={{ height: '100%', display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Card.Img variant="top" src='student.png' style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Adicionar Alunos</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Inserir Alunos no Sistema</Card.Subtitle>
                            <Card.Text>
                                Adicionar um ou vários alunos ao sistema manualmente ou através de um ficheiro JSON com uma lista de alunos.

                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href="/alunos"
                            >Adicionar Aluno
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src='prova.png' style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': '5%' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Criar Prova</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Criar Provas de Avaliação</Card.Subtitle>
                            <Card.Text>
                                Criar provas de avaliação adicionando os detalhes da mesma bem como os alunos a inscrever.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href="/provas/criar"
                            >Criar Prova
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src='criar_prova.png' style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Consultar Provas</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Consultar Provas de Avaliação</Card.Subtitle>
                            <Card.Text>
                                Consultar as provas na qual participa para visualizar resultados, editar a prova e corrigir a prova.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href={`/provas?num_mec=${decodedToken._id}`}
                            >Consultar Provas
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </>
    )

    const alunoPage = (
        <>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src='realizar.png' style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Realizar Prova</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Realizar Provas de Avaliação</Card.Subtitle>
                            <Card.Text>
                                Pode responder a provas de avaliação na qual esteja inscrito.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href={`/provas/responder`}
                            >Realizar Prova
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src='consultar.png' style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Consultar Provas</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Consultar Provas de Avaliação</Card.Subtitle>
                            <Card.Text>
                                Consultar as provas na qual participa para visualizar respotas e respetivos resultados.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href={`/provas?num_mec=${decodedToken._id}`}
                            >Consultar Provas
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </>
    )

    const tecnicoPage = (
        <>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src='student.png' style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Gerir Alunos</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Gerir os Alunos do Sistema</Card.Subtitle>
                            <Card.Text>
                                Pode adicionar, editar ou remover alunos.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href="/alunos"
                            >Gerir Alunos
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src='teacher.png' style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Gerir Docentes</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Gerir os Docentes do Sistema</Card.Subtitle>
                            <Card.Text>
                                Pode adicionar, editar ou remover docentes.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href="/docentes"
                            >Gerir Docentes
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src="edificio.png" style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': 'auto', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Gerir Salas</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Gerir as Salas do Sistema</Card.Subtitle>
                            <Card.Text>
                                Pode adicionar, editar ou remover salas.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href="/salas"
                            >Gerir Salas
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col>
                <Card style={{ height: '100%' }}>
                    <Card.Img variant="top" src="prova.png" style={{ width: '80%', 'display': 'block', 'margin-top': '5%', 'margin-left': '15%', 'margin-right': 'auto' }} />
                    <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <Card.Title>Gerir Provas</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">Gerir as Provas do Sistema</Card.Subtitle>
                            <Card.Text>
                                Pode adicionar, editar ou remover provas.
                            </Card.Text>
                        </div>
                        <div>
                            <Button
                                className="mb-1 mt-3"
                                variant="outline-light"
                                style={{ fontSize: '12px', padding: '10px 20px', backgroundColor: '#2c87ff', color: '#ffffff' }}
                                href="/provas"
                            >Gerir Provas
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </>
    )

    return (
        <>
            <Navbar />
            <ToastContainer />
            <Container>
                <Row className='my-5'>
                    {decodedToken.type === 0 && alunoPage}
                    {decodedToken.type === 1 && docentePage}
                    {decodedToken.type === 2 && tecnicoPage}
                </Row>
            </Container>
        </>
    )
}

export default Home