import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, ListGroup, ListGroupItem, Modal, Button, Container, Form, Row, Col } from 'react-bootstrap'
import { Eye, Pencil, Trash3, Heart, HeartFill } from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import axios from 'axios'
import env from '../config/env'


function Provas({ data, setData, token }) {
    const [showModal, setShowModal] = useState(false)
    const [deleteItemID, setDeleteItemID] = useState(null)
    const [refresh, setRefresh] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            axios.get(process.env.API_URL + `/provas?token=${localStorage.token}`)
                .then(response => {
                    setRefresh(new Date().toISOString())
                })
                .catch(error => {
                    toast.error("Não foi possível obter a lista de provas!", { position: toast.POSITION.TOP_CENTER })
                })
        }

        fetchData()
    }, [])

    const handleShowModal = (event, id) => {
        setDeleteItemID(id)
        setShowModal(true)
    }


    const handleHideModal = () => {
        setShowModal(false)
        setDeleteItemID(null)
    }


    const handleDelete = async (event, id) => {
        /*
        try {
            await axios.delete(process.env.API_URL + `/provas/${id}?token=${localStorage.token}`)

            setData(current => { return current.filter((item) => item._id.toString() !== id) })

            toast.success('A prova foi removido com sucesso!', {
                position: toast.POSITION.TOP_CENTER
            })
        } catch (error) {
            toast.error('Não foi possível remover a prova!', {
                position: toast.POSITION.TOP_CENTER
            })
        }

        handleHideModal();
        setRefresh(new Date().toISOString())
        */
    }


    return (
        <Prova className='mb-4'>
            {data.map((obj, index) => {
                return (
                    <Prova.Item eventKey={index}>
                        <Prova.Header>
                            <Container><b>Prova: </b>{obj.nome}</Container>
                            <Container className='d-flex justify-content-end px-3'>
                                <Link to={'/provas/' + obj._id}> <Eye size={20} color='black' className='mx-3' /> </Link>
                                <Link to={"/provas/" + obj._id + "/edit"}> <Pencil size={20} color='black' className='mx-3' /> </Link>
                            </Container>
                        </Prova.Header>
                        <Prova.Body>
                            <ListGroup>
                                {type === 0 && obj.Versao && <ListGroupItem><b>Sala: </b>{obj.Versao.id_sala}</ListGroupItem>}
                                {type === 0 && obj.Versao && <ListGroupItem><b>Horário: </b>{obj.Versao.horario}</ListGroupItem>}
                                <ListGroupItem><b>Descritores: </b>
                                    <ListGroup className='list-group-flush'>
                                        {obj.Descritores.map((content, descriptorIndex) => {
                                            return (<ListGroupItem key={descriptorIndex}>{content}</ListGroupItem>)
                                        })}
                                    </ListGroup>
                                </ListGroupItem>
                            </ListGroup>
                        </Prova.Body>
                    </Prova.Item>
                )
            })}
        </Prova>
    )
}

export default Accordions