import React, {useEffect, useState} from "react"
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBell } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'
import ProbumIcon from '../images/probum_icon2.png'
import axios from "axios";
import env from "../config/env";
import {toast} from "react-toastify";
const jp = require('jsonpath');

function NavBar() {
    const [decodedToken, setDecodedToken] = useState(null)
    const [unreadNotifications, setUnreadNotifications] = useState(-1)

    useEffect(() => {
        try {
            const token = localStorage.getItem("token")
            if (!token) return <Navigate to="/login" />

            const currentTime = Date.now() / 1000; // converte para segundos

            // Verificar se o token expirou
            if (token.exp < currentTime) {
                // Token expirou
                return <Navigate to="/login" />;
            }

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
                    if (result) {
                        const unreadMecNotifs = jp.query(result.data, '$[*].receivers[?(@.read != true)]');
                        setUnreadNotifications(unreadMecNotifs.length)
                    }
                })
                .catch(error => {
                    setUnreadNotifications(0)
                    toast.error("Não foi possível obter a lista de notificações!", {
                        position: toast.POSITION.TOP_CENTER
                    })
                })
        }
        return () => {
        }
    }, [decodedToken]);

    const handleLogout = () => {
        localStorage.removeItem('token')
        Cookies.remove('token')
    }

    if (decodedToken) {
        return (
            <Navbar variant='dark' expand='lg' className='py-2' style={{backgroundColor: '#00132c'}}>
                <Container>
                    <Navbar.Brand className='fw-bold' href='/' style={{color: '#ffffff'}}>
                        <img src={ProbumIcon} alt="ProbumIcon"
                             style={{marginRight: '5px', width: '45px', height: '45px'}}/>
                        Probum
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/" style={{color: '#ffffff'}}>Início</Nav.Link>

                            {/* Always show Provas */}
                            <Nav.Link href="/provas" style={{color: '#ffffff'}}>Provas</Nav.Link>

                            {/* Show Alunos if type is 1 or 2 */}
                            {decodedToken.type >= 1 &&
                                <Nav.Link href="/alunos" style={{color: '#ffffff'}}>Alunos</Nav.Link>}

                            {/* Show Docentes and Salas if type is 2 */}
                            {decodedToken.type === 2 && (
                                <>
                                    <Nav.Link href="/docentes" style={{color: '#ffffff'}}>Docentes</Nav.Link>
                                    <Nav.Link href="/salas" style={{color: '#ffffff'}}>Salas</Nav.Link>
                                </>
                            )}
                        </Nav>
                        <Nav>
                            <Nav.Link href="/notificacoes" style={{color: '#ffffff', position: 'relative'}}>
                                <FontAwesomeIcon icon={faBell} size='lg'/>
                                <Badge pill bg="danger" style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px'
                                }}>{unreadNotifications}</Badge>
                            </Nav.Link>


                            {decodedToken
                                ? <NavDropdown className='ms-auto' title={<FontAwesomeIcon icon={faUser} size='lg'/>}
                                               id="account-dropdown" style={{color: '#ffffff'}}>
                                    <NavDropdown.Item href="/perfil">Perfil</NavDropdown.Item>
                                    <NavDropdown.Divider/>
                                    <NavDropdown.Item href="/" onClick={handleLogout}>Sair</NavDropdown.Item>
                                </NavDropdown>
                                : <Nav.Link className='ms-auto' href='/login' style={{color: '#ffffff'}}>
                                    <FontAwesomeIcon icon={faUser} size='lg'/>
                                </Nav.Link>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
}

export default NavBar