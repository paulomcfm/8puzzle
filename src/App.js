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
  const [shuffleCount, setShuffleCount] = useState(10);
  const [totalTime, setTotalTime] = useState(0);
  const [numberOfVisitedNodes, setNumberOfVisitedNodes] = useState(0);
  const [pathSize, setPathSize] = useState(0);

  const handleReset = () => {
    window.location.reload();
  };


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
      const formattedFinalGrid = grid.map(square => ({
        id: square.id,
        value: square.value
      }));
      setFinalGrid(formattedFinalGrid);
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

  const animateShuffle = (shuffleSteps, stepIndex = 0) => {
    if (stepIndex >= shuffleSteps.length) {
      setGrid(shuffleSteps[shuffleSteps.length - 1]);
      return;
    }

    const newGrid = shuffleSteps[stepIndex];
    setGrid(newGrid);

    setTimeout(() => {
      animateShuffle(shuffleSteps, stepIndex + 1);
    }, 500);
  };

  const handleShuffle = () => {
    let newGrid = [...grid];
    const shuffleSteps = [];

    for (let i = 0; i < shuffleCount; i++) {
      const canMove = canItMove(newGrid);
      const sorteado = sorteia(canMove);
      const emptyIndex = newGrid.findIndex(square => square.value === '');
      [newGrid[emptyIndex].value, newGrid[sorteado].value] = [newGrid[sorteado].value, newGrid[emptyIndex].value];
      shuffleSteps.push(newGrid.map(square => ({ ...square })));
    }

    animateShuffle(shuffleSteps);
  };

  const isGridInPath = (grid, path) => {
    return path.some(p => areGridsEqual(p, grid));
  };

  const handleBestFirst = () => {
    setTotalTime(0);
    setNumberOfVisitedNodes(0);
    setPathSize(0);
    let actualGrid = grid;
    const goalGrid = finalGrid;
    let visitedNodes = 0;
    let startTime = new Date().getTime();
    let queue = [];
    let firstObject = { grid: actualGrid, outOfOrder: getOutOfOrder(actualGrid, goalGrid), path: [actualGrid] };
    if (level === 'first') {
      insertWithPriorityOutOfOrder(getPossibleMovesFirstLevel(firstObject), queue);
    } else {
      insertWithPriorityOutOfOrder(getPossibleMovesSecondLevel(firstObject), queue);
    }
    actualGrid = queue.shift();
    while (!areGridsEqual(actualGrid.grid, goalGrid)) {
      if (level === 'first') {
        insertWithPriorityOutOfOrder(getPossibleMovesFirstLevel(actualGrid), queue);
      } else {
        insertWithPriorityOutOfOrder(getPossibleMovesSecondLevel(actualGrid), queue);
      }
      visitedNodes++;
      actualGrid = queue.shift();
    }
    let totalTime = new Date().getTime() - startTime;
    setTotalTime(totalTime/1000);
    setNumberOfVisitedNodes(visitedNodes);
    setPathSize(actualGrid.path.length);
    animateShuffle(actualGrid.path);
  };

  const areGridsEqual = (grid1, grid2) => {
    for (let i = 0; i < grid1.length; i++) {
      if (grid1[i].value !== grid2[i].value) {
        return false;
      }
    }
    return true;
  };

  const getPossibleMovesFirstLevel = ({ grid: actualGrid, outOfOrder, currentLevel, path }) => {
    let listOfPossibleMoves = [];
    let emptyIndex = actualGrid.findIndex(square => square.value === '');
    let row = Math.floor(emptyIndex / 3);
    let col = emptyIndex % 3;
  
    const addMove = (newGrid, currentLevel) => {
      if (!isGridInPath(newGrid, path)) {
        listOfPossibleMoves.push({
          grid: newGrid,
          outOfOrder: getOutOfOrder(newGrid, finalGrid),
          currentLevel: currentLevel + 1,
          path: [...path, newGrid]
        });
      }
    };
  
    if (row > 0) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex - 3].value] = [newGrid[emptyIndex - 3].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
    if (row < 2) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex + 3].value] = [newGrid[emptyIndex + 3].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
    if (col > 0) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex - 1].value] = [newGrid[emptyIndex - 1].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
    if (col < 2) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex + 1].value] = [newGrid[emptyIndex + 1].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
  
    return listOfPossibleMoves;
  };

  const getPossibleMovesSecondLevel = ({ grid: actualGrid, outOfOrder, currentLevel, path }) => {
    let listOfPossibleMoves = [];
    let emptyIndex = actualGrid.findIndex(square => square.value === '');
    let row = Math.floor(emptyIndex / 3);
    let col = emptyIndex % 3;
  
    const addMove = (newGrid, currentLevel) => {
      if (!isGridInPath(newGrid, path)) {
        listOfPossibleMoves.push({ grid: newGrid, outOfOrder: getOutOfOrder(newGrid, finalGrid), currentLevel: currentLevel+1, path: [...path, newGrid] });
      }
    };
  
    if (row > 0) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex - 3].value] = [newGrid[emptyIndex - 3].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
    if (row < 2) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex + 3].value] = [newGrid[emptyIndex + 3].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
    if (col > 0) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex - 1].value] = [newGrid[emptyIndex - 1].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
    if (col < 2) {
      let newGrid = actualGrid.map(square => ({ ...square }));
      [newGrid[emptyIndex].value, newGrid[emptyIndex + 1].value] = [newGrid[emptyIndex + 1].value, newGrid[emptyIndex].value];
      addMove(newGrid, currentLevel);
    }
  
    listOfPossibleMoves.forEach(move => {
      let secondLevelMoves = getPossibleMovesFirstLevel({ grid: move.grid, outOfOrder: move.outOfOrder, currentLevel: move.currentLevel, path: move.path });
      secondLevelMoves = secondLevelMoves.filter(secondMove => !areGridsEqual(secondMove.grid, actualGrid));
      if (secondLevelMoves.length > 0) {
        move.outOfOrder = Math.min(...secondLevelMoves.map(secondMove => secondMove.outOfOrder+1));
      }
    });
  
    return listOfPossibleMoves;
  };

  const insertWithPriorityOutOfOrder = (nodes, queue) => {
    nodes.forEach(node => {
      let i = 0;
      while (i < queue.length && queue[i].outOfOrder <= node.outOfOrder) {
        i++;
      }
      queue.splice(i, 0, node);
    });
  };

  const insertWithPriorityOutOfOrderPlusLevel = (nodes, queue) => {
    nodes.forEach(node => {
      let i = 0;
      while (i < queue.length && (queue[i].outOfOrder + queue[i].currentLevel) <= (node.outOfOrder + node.currentLevel)) {
        i++;
      }
      queue.splice(i, 0, node);
    });
  }

  const getOutOfOrder = (actualGrid, finalGrid) => {
    let outOfOrder = 0;
    for (let i = 0; i < 9; i++) {
      if (actualGrid[i].value !== finalGrid[i].value) {
        outOfOrder++;
      }
    }
    return outOfOrder;
  };

  const handleSolveA = () => {
    setTotalTime(0);
    setNumberOfVisitedNodes(0);
    setPathSize(0);
    let actualGrid = grid;
    const goalGrid = finalGrid;
    let visitedNodes = 0;
    let startTime = new Date().getTime();
    let queue = [];
    let firstObject = { grid: actualGrid, outOfOrder: getOutOfOrder(actualGrid, goalGrid), currentLevel: 0, path: [actualGrid] };
    if (level === 'first') {
      insertWithPriorityOutOfOrderPlusLevel(getPossibleMovesFirstLevel(firstObject), queue);
    } else {
      insertWithPriorityOutOfOrderPlusLevel(getPossibleMovesSecondLevel(firstObject), queue);
    }
    actualGrid = queue.shift();
    while (!areGridsEqual(actualGrid.grid, goalGrid)) {
      if (level === 'first') {
        insertWithPriorityOutOfOrderPlusLevel(getPossibleMovesFirstLevel(actualGrid), queue);
      } else {
        insertWithPriorityOutOfOrderPlusLevel(getPossibleMovesSecondLevel(actualGrid), queue);
      }
      visitedNodes++;
      actualGrid = queue.shift();
    }
    let totalTime = new Date().getTime() - startTime;
    setTotalTime(totalTime/1000);
    setNumberOfVisitedNodes(visitedNodes);
    setPathSize(actualGrid.path.length);
    animateShuffle(actualGrid.path);
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
          {numberOfVisitedNodes !== 0 && (
            <p>
              Tempo total: {totalTime}s <br/>
              Número de nós visitados: {numberOfVisitedNodes} <br/>
              Tamanho do caminho da solução: {pathSize}
            </p>
          )}
          <Button className="mt-3" onClick={handleReset}>Reset</Button>
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
          <Button className="mt-3" onClick={handleBestFirst}>Resolver Best First</Button>
          <div className=""></div>
          <Button className="mt-3" onClick={handleSolveA}>Resolver A*</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
