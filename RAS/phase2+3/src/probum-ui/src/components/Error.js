import {Card, Container} from "react-bootstrap";

function Error({ error }) {
    return (
        <Container>
            <Card.Body>
                <Card.Title>Ocorreu um erro</Card.Title>
                <Card.Text>{error && <p>Detalhes do erro: {error.message}</p>}</Card.Text>
            </Card.Body>
        </Container>
    );
}

export default Error