import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

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
  const [finalGrid, setFinalGrid] = useState(null);
  const [level, setLevel] = useState('first');
  const [shuffleCount, setShuffleCount] = useState(100);

  const valueToColor = {
    1: '#FFEB3B', // Yellow
    2: '#FF9800', // Orange
    3: '#F44336', // Red
    4: '#03A9F4', // Light Blue
    5: '#3F51B5', // Indigo
    6: '#9C27B0', // Purple
    7: '#8BC34A', // Light Green
    8: '#388E3C', // Dark Green
    '': '#FFFFFF' // White for empty square
  };

  // Função para alterar o valor de um quadrado
  const handleChange = (id, newValue) => {
    const newGrid = grid.map((square) =>
      square.id === id ? { ...square, value: newValue === '' ? '' : parseInt(newValue) } : square
    );
    setGrid(newGrid);
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
    const shuffleSteps = [];

    for (let i = 0; i < shuffleCount; i++) {
      const canMove = canItMove(newGrid);
      const sorteado = sorteia(canMove);
      const emptyIndex = newGrid.findIndex(square => square.value === '');
      [newGrid[emptyIndex].value, newGrid[sorteado].value] = [newGrid[sorteado].value, newGrid[emptyIndex].value];
      shuffleSteps.push({ newGrid: newGrid.map(square => ({ ...square })), emptyIndex, sorteado });
    }
    
    const animateShuffle = (stepIndex) => {
      if (stepIndex >= shuffleSteps.length) {
        setGrid(shuffleSteps[shuffleSteps.length - 1].newGrid);
        console.log('Grid embaralhada:', shuffleSteps[shuffleSteps.length - 1].newGrid);
        return;
      }

      const { newGrid, emptyIndex, sorteado } = shuffleSteps[stepIndex];
      setGrid(newGrid);

      setTimeout(() => {
        animateShuffle(stepIndex + 1);
      }, 500);
    };
    console.log('Grid Final:', finalGrid);
    animateShuffle(0);
  };

  const handleSolveBranchAndBound = () => {
    const actualGrid = grid;
    const goalGrid = finalGrid;
    let numberofVisitedNodes = 0;
    let startTime = new Date().getTime();
    let endTime;
    let timeElapsed;
    let numberOfMoves = 0;
    let lvl = 0;
    let outOfOrder = getOutOfOrder(actualGrid, goalGrid);
    let queue = [];
    let possibleMoves = [];
    insertWithPriority({ grid: actualGrid, level: lvl, outOfOrder: outOfOrder }, queue);
    if(actualGrid !== goalGrid) {
      possibleMoves = getPossibleMoves(actualGrid);
    }
    console.log('Queue:', possibleMoves);
  };

  const getPossibleMoves = (actualGrid) => {
    let listOfPossibleMoves = [];
    let emptyIndex = actualGrid.findIndex(square => square.value === '');
    let row = Math.floor(emptyIndex / 3);
    let col = emptyIndex % 3;
  
    // Movimento para cima
    if (row > 0) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex - 3].value] = [newGrid[emptyIndex - 3].value, newGrid[emptyIndex].value];
      listOfPossibleMoves.push(newGrid);
    }
  
    // Movimento para baixo
    if (row < 2) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex + 3].value] = [newGrid[emptyIndex + 3].value, newGrid[emptyIndex].value];
      listOfPossibleMoves.push(newGrid);
    }
  
    // Movimento para a esquerda
    if (col > 0) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex - 1].value] = [newGrid[emptyIndex - 1].value, newGrid[emptyIndex].value];
      listOfPossibleMoves.push(newGrid);
    }
  
    // Movimento para a direita
    if (col < 2) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex + 1].value] = [newGrid[emptyIndex + 1].value, newGrid[emptyIndex].value];
      listOfPossibleMoves.push(newGrid);
    }
  
    return listOfPossibleMoves;
  };

  const insertWithPriority = (node, queue) => {
    let i = 0;
    while (i < queue.length && queue[i].level < node.level) {
      i++;
    }
    queue.splice(i, 0, node);
  };
  
  const getOutOfOrder = (actualGrid, finalGrid) => {
    let outOfOrder = 0;
    for (let i = 0; i < 9; i++) {
      if (actualGrid[i] !== finalGrid[i]) {
        outOfOrder++;
      }
    }
  };


  const handleSolveA = () => {

  };

  const selectFirstLevel = () => {
    setLevel('first');
  };

  const selectSecondLevel = () => {
    setLevel('second');
  };

    return (
      <Container className="mt-5">
        <h2 className="text-center mb-4">Escolha o Estado Inicial</h2>
        <Row className="justify-content-center">
          <Col xs={12} md={4}>
            <Row>
              {grid.map((square, index) => (
                <Col key={square.id} xs={4} className="border p-3 text-center square" data-id={index} style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: valueToColor[square.value] }}>
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
            <Button className={`mt-3 ml-3 ${level === 'first' ? 'btn-danger' : ''}`} onClick={selectFirstLevel}>1º Nível</Button>
            <Button className={`mt-3 ml-3 ${level === 'second' ? 'btn-danger' : ''}`} onClick={selectSecondLevel}>2º Nível</Button>
            <Button className="mt-3" onClick={handleSolveBranchAndBound}>Resolver Branch and Bound</Button>
            <div className=""></div>
            <Button className="mt-3" onClick={handleSolveA}>Resolver A*</Button>

          </Col>
        </Row>
      </Container>
    );
  };

  export default App;
