import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  // Estado inicial para os valores dos quadrados
  const [grid, setGrid] = useState([
    { id: 1, value: 1 },
    { id: 2, value: 2 },
    { id: 3, value: 3 },
    { id: 4, value: 4 },
    { id: 5, value: 5 },
    { id: 6, value: 6 },
    { id: 7, value: 7 },
    { id: 8, value: 8 },
    { id: 9, value: "" },
  ]);
  const [finalGrid, setFinalGrid] = useState([]);
  const [shuffleCount, setShuffleCount] = useState(0);

  // Função para alterar o valor de um quadrado
  const handleChange = (id, newValue) => {
    const newGrid = grid.map((square) =>
      square.id === id ? { ...square, value: newValue === '' ? '' : parseInt(newValue) } : square
    );
    setGrid(newGrid);
    console.log('Novos Números:', newGrid);
  };

  const handleSave = () => {
    const values = grid.map(square => square.value);
    const requiredValues = [1, 2, 3, 4, 5, 6, 7, 8, ''];
    const isValid = requiredValues.every(value => values.includes(value));

    if (isValid) {
      setFinalGrid(values);
      console.log('Números salvos:', values);
    } else {
      alert('A grid deve conter exatamente os valores de 1 a 8 e um vazio, sem repetir.');
    }
  };

  const canItMove = (grid) => {
    const emptyIndex = grid.findIndex(square => square.value === '');
    const possibleMoves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    if (row > 0) possibleMoves.push(emptyIndex - 3); // Move up
    if (row < 2) possibleMoves.push(emptyIndex + 3); // Move down
    if (col > 0) possibleMoves.push(emptyIndex - 1); // Move left
    if (col < 2) possibleMoves.push(emptyIndex + 1); // Move right

    return possibleMoves;
  };

  const sorteia = (canMove) => {
    const randomIndex = Math.floor(Math.random() * canMove.length);
    return canMove[randomIndex];
  };

  const handleShuffle = () => {
    let newGrid = [...grid];
    for (let i = 0; i < shuffleCount; i++) {
      const canMove = canItMove(newGrid);
      const sorteado = sorteia(canMove);
      const emptyIndex = newGrid.findIndex(square => square.value === '');
      [newGrid[emptyIndex].value, newGrid[sorteado].value] = [newGrid[sorteado].value, newGrid[emptyIndex].value];
      const gridCopy = newGrid.map(square => ({ ...square }));
      console.log(`Grid após ${i + 1} troca(s):`, gridCopy);
    }
    setGrid(newGrid);
    console.log('Grid embaralhada:', newGrid);
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Escolha o Estado Inicial</h2>
      <Row className="justify-content-center">
        <Col xs={12} md={4}>
          <Row>
            {grid.map((square) => (
              <Col key={square.id} xs={4} className="border p-3 text-center" style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Form.Control
                  type="number"
                  min="1"
                  max="8"
                  value={square.value}
                  onChange={(e) => handleChange(square.id, e.target.value)}
                  className="text-center"
                />
              </Col>
            ))}
          </Row>
          <Button className="mt-3" onClick={handleSave}>Definir Estado Final</Button>
          <Form.Group className="mt-3">
            <Form.Label>Embaralhar X vezes:</Form.Label>
            <Form.Control
              type="number"
              value={shuffleCount}
              onChange={(e) => setShuffleCount(e.target.value)}
              className="text-center"
            />
          </Form.Group>
          <Button className="mt-3" onClick={handleShuffle}>Embaralhar</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
