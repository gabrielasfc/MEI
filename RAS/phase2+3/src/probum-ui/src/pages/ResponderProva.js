import {toast, ToastContainer} from "react-toastify";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { Container, Card, Form, Modal, Table } from "react-bootstrap";
import { useEffect, useState, useCallback } from "react";
import { useMemo } from "react";
import {Navigate, useParams} from "react-router-dom";
import axios from "axios";
import env from "../config/env";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function ResponderProva() {
    const params = useParams()
    const [questoes, setQuestoes] = useState([])
    const [prova, setProva] = useState(null)
    const [idVersao, setIdVersao] = useState(0)
    const [backtrack, setBacktrack] = useState(false)
    const [duration, setDuration] = useState(0);
    const [showStartModal, setShowStartModal] = useState(true);
    const [provaIniciada, setProvaIniciada] = useState(false);
    const [showTimeOverModal, setShowTimeOverModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showAlertBacktrackModal, setShowAlertBacktrackModal] = useState(false);
    const [time, setTime] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [answers, setAnswers] = useState(new Map());
    const [previousButtonEnabled, setPreviousButtonEnabled] = useState(false);
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    useEffect(() => {
        axios.get(`${env.apigatewayAP}/questoes?numMec=${params.num}&id_prova=${params.id}&token=${localStorage.token}`)
            .then(result => {
                setQuestoes(result.data.Questao)
                setIdVersao(result.data.id_versao)
                axios.get(`${env.apigatewayAP}/provas/${result.data.id_prova}?token=${localStorage.token}`)
                        .then(result => {
                            setProva(result.data.prova)
                            setBacktrack(result.data.prova.backtrack)
                            setDuration(result.data.prova.duracao * 60)
                        })
                        .catch(err => {
                            console.log(err.message)
                            toast.error("Não foi possível obter a prova!", {
                                position: toast.POSITION.TOP_CENTER
                            })
                        })
            })
            .catch(err => {
                toast.error("Não foi possível obter as questoes da prova!", {
                    position: toast.POSITION.TOP_CENTER
                })
            })

    }, []);

    const iniciarProva = () => {
        setShowStartModal(false);
        setProvaIniciada(true);
    };

    const nextQuestion = () => {
        if (backtrack === false && !answers.has(questionNumber)) {
            setShowAlertBacktrackModal(true);
        } else {
            setQuestionNumber(questionNumber + 1);
        }
    };

    const previousQuestion = () => {
        setQuestionNumber(questionNumber - 1);
    };

    let navigate = useNavigate();


    const submitAnswers = useCallback(() => {
        if (time < duration) {
            setShowSubmitModal(false);
        }

        const totalAnswers = answers.keys().length;
        let index = 0;

        for (let answer of answers.values()) {
            index++;
            if (typeof answer !== 'object') {
               answer = { [answer]: true }
            }
            const estado = index === totalAnswers ? 1 : 0;
            axios.post(`${env.apigatewayAP}/respostas?id=${idVersao}&numMec=${decodedToken._id}&token=${localStorage.token}`, {
                estado: estado,
                resposta: answer
            })
                .then(result => {
                })
                .catch(err => {
                    console.log(err.message)
                    toast.error("Não foi possível guardar as respostas da prova!", {
                        position: toast.POSITION.TOP_CENTER
                    })
                })
        }
        toast.success("Respostas guardadas com sucesso!", {
            position: toast.POSITION.TOP_CENTER
        })
        navigate('/');
    }, [time, duration]);

    // Quando o utilizador chega à última questão
    useEffect(() => {
        if (questionNumber === questoes.length - 1) {
            // setNextButtonEnabled(false);
            setShowSubmitButton(true);
        } else {
            setShowSubmitButton(false);
        }
    }, [questionNumber, questoes]);

    // Efeitos para desativar o botão "Anterior"
    useEffect(() => {
        if (backtrack === false || questionNumber === 0) {
            setPreviousButtonEnabled(false);
        } else {
            setPreviousButtonEnabled(true);
        }
    }, [backtrack, questionNumber]);

    useEffect(() => {
        let intervalId;
        if (provaIniciada && !showStartModal) {
            intervalId = setInterval(() => {
                setTime((time) => time + 1);
            }, 1000); // update every second
        }

        return () => {
            clearInterval(intervalId); // clean up on unmount
        };
    }, [provaIniciada, showStartModal]);

    // Quando o tempo acaba
    useEffect(() => {
        if (provaIniciada && time >= duration) {
            submitAnswers();

            setShowTimeOverModal(true);
        }
    }, [time, duration, submitAnswers]);

    let decodedToken
    try {
        decodedToken = jwtDecode(localStorage.getItem("token"));
    } catch {
        return <Navigate to="/login" />
    }

    function timer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    }

    // Função auxiliar para perguntas de verdadeiro ou falso
    function handleAnswers(question, option, value) {
        setAnswers((prev) => {
            const newAnswers = new Map(prev);
            const answer = newAnswers.get(question) || {};
            answer[option] = value;
            newAnswers.set(question, answer);

            return newAnswers;
        });
    }

    // Função auxiliar para perguntas de verdadeiro ou falso
    function getAnswer(questionNumber, option) {
        const questionAnswers = answers.get(questionNumber);
        if (questionAnswers) {
            if (option in questionAnswers) {
                return questionAnswers[option];
            }
        }

        return null;
    }

    function renderQuestao(questao, questionNumber) {
        if (questao.tipo === 0) {
            // Escolha múltipla
            return (
                <>
                    <Form.Label style={{ fontSize: "18px" }}>
                        {questao.descricao}
                    </Form.Label>
                    {Object.keys(JSON.parse(questao.solucao)).map((option) => (
                        <Form.Check
                            type="radio"
                            id={`option-${option}`}
                            style={{ margin: "10px 0px" }}
                            label={option}
                            checked={
                                answers.has(questionNumber) &&
                                answers.get(questionNumber) === option
                            }
                            onChange={() => {
                                setAnswers((prev) => {
                                    const newAnswers = new Map(prev);
                                    newAnswers.set(questionNumber, option);
                                    return newAnswers;
                                });
                            }}
                        />
                    ))}
                </>
            );
        } else if (questao.tipo === 1) {
            return (
                <>
                    <Form.Label style={{ fontSize: "18px" }}>
                        {questao.descricao}
                    </Form.Label>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{ width: "5%" }}>V</th>
                                <th style={{ width: "5%" }}>F</th>
                                <th>Option</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(questao.solucao).map(
                                (option, index) => (
                                    <tr key={index}>
                                        <td>
                                            <Form.Check
                                                type="radio"
                                                name={`question-${questionNumber}-${option}`}
                                                id={`option-true-${questionNumber}-${index}`}
                                                checked={
                                                    getAnswer(
                                                        questionNumber,
                                                        option
                                                    ) === true
                                                }
                                                onChange={() =>
                                                    handleAnswers(
                                                        questionNumber,
                                                        option,
                                                        true
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <Form.Check
                                                type="radio"
                                                name={`question-${questionNumber}-${option}`}
                                                id={`option-false-${questionNumber}-${index}`}
                                                checked={
                                                    getAnswer(
                                                        questionNumber,
                                                        option
                                                    ) === false
                                                }
                                                onChange={() =>
                                                    handleAnswers(
                                                        questionNumber,
                                                        option,
                                                        false
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>{option}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </Table>
                </>
            );
        } else if (questao.tipo === 2) {
            // Preencher os espaços
            let descricao = questao.descricao.split(" ");
            descricao = descricao.map((word, index) =>
                word === "____" ? (
                    <Form.Control
                        type="text"
                        style={{ width: "500px", margin: "10px 0px" }}
                        value={answers.get(questionNumber)[index] || ""}
                        onChange={(e) => {
                            setAnswers((prev) => {
                                const newAnswers = new Map(prev);
                                const answer = newAnswers.get(questionNumber) || { };
                                answer[index] = e.target.value;
                                newAnswers.set(questionNumber, answer);
                                return newAnswers;
                            });
                        }}
                    />
                ) : (
                    word + " "
                )
            );

            return <p>{descricao}</p>;
        } else if (questao.tipo === 3) {
            // Desenvolvimento
            return (
                <>
                    <Form.Label style={{ fontSize: "18px" }}>
                        {questao.descricao}
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        value={answers.get(questionNumber) || ""}
                        onChange={(e) => {
                            setAnswers((prev) => {
                                const newAnswers = new Map(prev);
                                newAnswers.set(questionNumber, e.target.value);
                                return newAnswers;
                            });
                        }}
                    />
                </>
            );
        }
    }

    return (
        <>
            <ToastContainer />
            <Modal
                show={showStartModal}
                backdrop="static"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: "9999",
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Iniciar Prova</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        A duração desta prova é de {Math.floor(duration / 60)}{" "}
                        minutos.
                    </p>
                    {!backtrack && (
                        <p>
                            <strong>Atenção:</strong> Uma vez que uma pergunta é
                            passada à frente, não pode voltar atrás.
                        </p>
                    )}
                    Pressione o botão abaixo para iniciar a prova.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={iniciarProva}>
                        Iniciar Prova
                    </Button>
                </Modal.Footer>
            </Modal>

            {!showStartModal && !showTimeOverModal && !showSubmitModal && (
                <Container>
                    <Card
                        className="mt-4 d-flex justify-content-center"
                        style={{
                            boxShadow:
                                "0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                // alignItems: "center",
                                // width: "100%",
                                padding: "0 30px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    flexGrow: 1,
                                    width: "100%",
                                }}
                            >
                                {Array.from(
                                    { length: questoes.length },
                                    (_, i) => (
                                        <Chip
                                            key={i}
                                            label={i + 1}
                                            color={
                                                i === questionNumber
                                                    ? "primary"
                                                    : "default"
                                            }
                                            style={{
                                                margin: "20px 5px 0px",
                                                width: "50px",
                                                height: "50px",
                                            }}
                                            onClick={() => {
                                                if (backtrack === true) {
                                                    setQuestionNumber(i);
                                                }
                                            }}
                                        />
                                    )
                                )}
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    right: "30px",
                                }}
                            >
                                <Card.Body>
                                    <Container className="my-3">
                                        <p
                                            style={{
                                                fontSize: "18px",
                                            }}
                                        >
                                            Tempo: {timer(time)} /{" "}
                                            {timer(duration)}
                                        </p>
                                    </Container>
                                </Card.Body>
                            </div>
                        </div>
                        <Card.Body>
                            <Container className="my-3">
                                <h2>Questão {questionNumber + 1}</h2>
                                {questoes[questionNumber] && (
                                    <Form.Group
                                        style={{
                                            marginTop: "30px",
                                            marginBottom: "50px",
                                        }}
                                    >
                                        {renderQuestao(
                                            questoes[questionNumber],
                                            questionNumber
                                        )}
                                    </Form.Group>
                                )}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "20px",
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        disabled={
                                            previousButtonEnabled === false
                                        }
                                        onClick={previousQuestion}
                                    >
                                        Anterior
                                    </Button>
                                    {!showSubmitButton ? (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            // disabled={!nextButtonEnabled}
                                            onClick={nextQuestion}
                                        >
                                            Próxima
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={submitAnswers}
                                        >
                                            Submeter
                                        </Button>
                                    )}
                                </div>
                            </Container>
                        </Card.Body>
                    </Card>
                </Container>
            )}

            <Modal show={showAlertBacktrackModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Atenção</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Atenção depois de avançar não podes voltar atrás!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowAlertBacktrackModal(false)}
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowAlertBacktrackModal(false);
                            setQuestionNumber(questionNumber + 1);
                        }}
                    >
                        Continuar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showTimeOverModal}
                backdrop="static"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: "9999",
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Fim da prova</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>O tempo disponível acabou!</p>
                    <p>As perguntas respondidas foram submetidas.</p>
                </Modal.Body>
            </Modal>

            <Modal
                show={showSubmitModal}
                backdrop="static"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: "9999",
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Fim da prova</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Respostas submetidas com sucesso!</p>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ResponderProva;
