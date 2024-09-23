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
  const [heuristic, setHeuristic] = useState('outOfOrder');
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
    }, 10);
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
    let firstObject = { grid: actualGrid, heuristic: getHeuristic(actualGrid, goalGrid), path: [actualGrid] };
    if (level === 'first') {
      insertWithPriorityHeuristic(getPossibleMovesFirstLevel(firstObject), queue);
    } else {
      insertWithPriorityHeuristic(getPossibleMovesSecondLevel(firstObject), queue);
    }
    actualGrid = queue.shift();
    while (!areGridsEqual(actualGrid.grid, goalGrid)) {
      if (level === 'first') {
        insertWithPriorityHeuristic(getPossibleMovesFirstLevel(actualGrid), queue);
      } else {
        insertWithPriorityHeuristic(getPossibleMovesSecondLevel(actualGrid), queue);
      }
      visitedNodes++;
      actualGrid = queue.shift();
    }
    let totalTime = new Date().getTime() - startTime;
    setTotalTime(totalTime / 1000);
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

  const getPossibleMovesFirstLevel = ({ grid: actualGrid, heuristic, currentLevel, path }) => {
    let listOfPossibleMoves = [];
    let emptyIndex = actualGrid.findIndex(square => square.value === '');
    let row = Math.floor(emptyIndex / 3);
    let col = emptyIndex % 3;

    const addMove = (newGrid, currentLevel) => {
      if (!isGridInPath(newGrid, path)) {
        listOfPossibleMoves.push({
          grid: newGrid,
          heuristic: getHeuristic(newGrid, finalGrid),
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

  const getPossibleMovesSecondLevel = ({ grid: actualGrid, heuristic, currentLevel, path }) => {
    let listOfPossibleMoves = [];
    let emptyIndex = actualGrid.findIndex(square => square.value === '');
    let row = Math.floor(emptyIndex / 3);
    let col = emptyIndex % 3;

    const addMove = (newGrid, currentLevel) => {
      if (!isGridInPath(newGrid, path)) {
        listOfPossibleMoves.push({ grid: newGrid, heuristic: getHeuristic(newGrid, finalGrid), currentLevel: currentLevel + 1, path: [...path, newGrid] });
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
      let secondLevelMoves = getPossibleMovesFirstLevel({ grid: move.grid, heuristic: move.heuristic, currentLevel: move.currentLevel, path: move.path });
      secondLevelMoves = secondLevelMoves.filter(secondMove => !areGridsEqual(secondMove.grid, actualGrid));
      if (secondLevelMoves.length > 0) {
        move.heuristic = Math.min(...secondLevelMoves.map(secondMove => secondMove.heuristic));
      }
    });

    return listOfPossibleMoves;
  };

  const getPossibleMovesFirstLevelA = ({ grid: actualGrid, heuristic, currentLevel, path }) => {
    let listOfPossibleMoves = [];
    let emptyIndex = actualGrid.findIndex(square => square.value === '');
    let row = Math.floor(emptyIndex / 3);
    let col = emptyIndex % 3;

    const addMove = (newGrid, currentLevel) => {
      if (!isGridInPath(newGrid, path)) {
        listOfPossibleMoves.push({
          grid: newGrid,
          heuristic: getHeuristic(newGrid, finalGrid),
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

  const getPossibleMovesSecondLevelA = ({ grid: actualGrid, heuristic, currentLevel, path }) => {
    let listOfPossibleMoves = [];
    let emptyIndex = actualGrid.findIndex(square => square.value === '');
    let row = Math.floor(emptyIndex / 3);
    let col = emptyIndex % 3;

    const addMove = (newGrid, currentLevel) => {
      if (!isGridInPath(newGrid, path)) {
        listOfPossibleMoves.push({ grid: newGrid, heuristic: getHeuristic(newGrid, finalGrid), currentLevel: currentLevel + 1, path: [...path, newGrid] });
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
      let secondLevelMoves = getPossibleMovesFirstLevel({ grid: move.grid, heuristic: move.heuristic, currentLevel: move.currentLevel, path: move.path });
      secondLevelMoves = secondLevelMoves.filter(secondMove => !areGridsEqual(secondMove.grid, actualGrid));
      if (secondLevelMoves.length > 0) {
        move.heuristic = Math.min(...secondLevelMoves.map(secondMove => (secondMove.heuristic + secondMove.currentLevel)));
      }
    });

    return listOfPossibleMoves;
  };

  const insertWithPriorityHeuristic = (nodes, queue) => {
    nodes.forEach(node => {
      let i = 0;
      while (i < queue.length && queue[i].heuristic <= node.heuristic) {
        i++;
      }
      queue.splice(i, 0, node);
    });
  };

  const insertWithPriorityHeuristicPlusLevel = (nodes, queue) => {
    nodes.forEach(node => {
      let i = 0;
      while (i < queue.length && (queue[i].heuristic + queue[i].currentLevel) <= (node.heuristic + node.currentLevel)) {
        i++;
      }
      queue.splice(i, 0, node);
    });
  }

  const getHeuristic = (actualGrid, finalGrid) => {
    if (heuristic === 'outOfOrder') {
      let outOfOrder = 0;
      for (let i = 0; i < 9; i++) {
        if (actualGrid[i].value !== finalGrid[i].value) {
          outOfOrder++;
        }
      }
      return outOfOrder;
    } else {
      return calculateManhattanDistance(actualGrid, finalGrid);
    }
  };

  const calculateManhattanDistance = (actualGrid, finalGrid) => {
    let totalDistance = 0;

    for (let i = 0; i < actualGrid.length; i++) {
      const actualValue = actualGrid[i].value;
      const actualRow = Math.floor(i / 3);
      const actualCol = i % 3;

      const finalIndex = finalGrid.findIndex(square => square.value === actualValue);
      const finalRow = Math.floor(finalIndex / 3);
      const finalCol = finalIndex % 3;

      const distance = Math.abs(actualRow - finalRow) + Math.abs(actualCol - finalCol);
      totalDistance += distance;
    }

    return totalDistance;
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
    let firstObject = { grid: actualGrid, heuristic: getHeuristic(actualGrid, goalGrid), currentLevel: 0, path: [actualGrid] };
    if (level === 'first') {
      insertWithPriorityHeuristicPlusLevel(getPossibleMovesFirstLevelA(firstObject), queue);
    } else {
      insertWithPriorityHeuristicPlusLevel(getPossibleMovesSecondLevelA(firstObject), queue);
    }
    actualGrid = queue.shift();
    while (!areGridsEqual(actualGrid.grid, goalGrid)) {
      if (level === 'first') {
        insertWithPriorityHeuristicPlusLevel(getPossibleMovesFirstLevelA(actualGrid), queue);
      } else {
        insertWithPriorityHeuristicPlusLevel(getPossibleMovesSecondLevelA(actualGrid), queue);
      }
      visitedNodes++;
      actualGrid = queue.shift();
    }
    let totalTime = new Date().getTime() - startTime;
    setTotalTime(totalTime / 1000);
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

  const selectOutOfOrder = () => {
    setHeuristic('outOfOrder');
  };

  const selectManhattan = () => {
    setHeuristic('manhattan');
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Escolha o Estado Inicial</h2>
      <Row className="justify-content-center">
        <Col xs={12} md={4}>
          <Row>
            {grid.map((square, index) => (
              <Col key={square.id} xs={4} className="border p-3 text-center square" data-id={index} style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: valueToColor[square.value], borderRadius: "10px" }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button className="mt-3" onClick={handleSave}>Definir Estado Final</Button>
            <Button className="mt-3" onClick={handleReset}>Reset</Button>
          </div>
          {numberOfVisitedNodes !== 0 && (
            <p style={{ marginTop: '10px' }}>
              Tempo total: {totalTime}s <br />
              Número de nós visitados: {numberOfVisitedNodes} <br />
              Tamanho do caminho da solução: {pathSize}
            </p>
          )}
          <Form.Group className="mt-3">
            <Form.Label>Embaralhar X vezes:</Form.Label>
            <Form.Control
              type="number"
              value={shuffleCount}
              onChange={(e) => setShuffleCount(e.target.value)}
              className="text-center"
            />
          </Form.Group>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button className="mt-3" onClick={handleShuffle}>Embaralhar</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button className={`mt-3 ml-3 ${level === 'first' ? 'btn-danger' : ''}`} onClick={selectFirstLevel}>1º Nível</Button>
            <Button className={`mt-3 ml-3 ${level === 'second' ? 'btn-danger' : ''}`} onClick={selectSecondLevel}>2º Nível</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button className={`mt-3 ml-3 ${heuristic === 'outOfOrder' ? 'btn-danger' : ''}`} onClick={selectOutOfOrder}>Peças Fora do Lugar</Button>
            <Button className={`mt-3 ml-3 ${heuristic === 'manhattan' ? 'btn-danger' : ''}`} onClick={selectManhattan}>Distância Manhattan</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Button className="mt-3" onClick={handleBestFirst}>Resolver Best First</Button>
          <Button className="mt-3" onClick={handleSolveA}>Resolver A*</Button>
        </div>
      </Col>
    </Row>
    </Container >
  );
};

export default App;
