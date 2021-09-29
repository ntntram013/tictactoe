import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const oStr = 'OOOOO';
const xStr = 'XXXXX';
const numToWin = 5;
const constCol = 10;
const constRow = 10;
function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
             {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}

            />
        );
    }


    render() {

        let htmlFull = [];
        for(let i = 0; i<this.props.numRow;i++) {
            let htmlRow = [];
            let tempRow = [];
            for (let j = 0; j < this.props.numCol; j++) {
                tempRow.push( this.renderSquare(i * this.props.numCol + j));
            }
            htmlRow = <div className={"board-row"} key={i}>{tempRow}</div>
            htmlFull.push(htmlRow);
        }
        return htmlFull;

    }


}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber:0,
            xIsNext: true,
            movePosition: [],
            currentHistory:0,
            numCol:constCol,
            numRow:constRow,
            isDescending:false,
            isEnd:false


        };
    }
    handleClick(i) {
        const history = this.state.history;
        const movePosition = this.state.movePosition;
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const currentPosition = this.state.movePosition[this.state.stepNumber-1];
        const col = this.state.numCol;
        const row = this.state.numRow;
        if (calculateWinner(current.squares,currentPosition,col,row,this.state.xIsNext) || squares[i] ) {
            this.setState({
                isEnd: true
            })
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        if (this.state.isEnd == false){
            this.setState({
                history: history.concat([{squares: squares}]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
                movePosition: movePosition.concat(i),
                currentHistory: this.state.currentHistory+1,
            });
        }

    }
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            currentHistory: step,
        });
    }
    reverseMove() {
        this.setState({
            isDescending: !this.state.isDescending
        })
    }
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const currentPosition = this.state.movePosition[this.state.stepNumber-1];
        const col = this.state.numCol;
        const row = this.state.numRow;
        const isDescending = this.state.isDescending;
        const winner = calculateWinner(current.squares,currentPosition,col,row,this.state.xIsNext);
        const moves = history.map((step, move) => {
            if (isDescending){
                move = history.length - move - 1;
            }
            const position = this.state.movePosition[move-1];
            const desc = move ? 'Go to move #' + move + ' [' + position%col +','+ Math.floor(position/col) +']': 'Go to game start';
            return (        
                <li key={move}>
                    <button className={move===this.state.currentHistory?'bold':''} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>    
            );   
        });
        let status;
        if (winner) {
            status = 'Winner: ' + (this.state.xIsNext?'O':'X');
        }
        else {
            if(this.state.movePosition.length === col*row && this.state.currentHistory === col*row){
                status = 'Result: Draw';
            }
            else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }

        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        numCol = {col}
                        numRow = {row}
                    />
                </div>
                <div className="game-info">
                    <div> {status}</div>
                    <div>Descending

                            <input type="checkbox" checked={this.state.isDescending} onClick={()=>this.reverseMove()}>
                            </input>

                    </div>

                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }


}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
function calculateWinner(squares,currentPosition,col,row, xIsNext) {
    //create 4 string from squares
    const winStr = xIsNext?oStr:xStr;
    let rowStr='';
    let colStr='';
    let diagStr= '';
    let antiDiagStr = '';
    let winPos = [];
    let currRow=Math.floor(currentPosition/col);
    let currCol=currentPosition%col;
    for(let i=0; i<col;i++) {
        rowStr += squares[currRow * col + i]?squares[currRow * col + i]:' ';
    }
    for(let i=0; i<row;i++) {
        colStr += squares[i*row + currCol]?squares[i*row + currCol]:' ';
    }
    //const countDiag = Math.min(row,col) - Math.abs(currRow-currCol);
    let countDiag = 0;
    if (currRow - currCol > Math.max(0,row-col)){
        countDiag =  Math.min(row, col) - (currRow - currCol) + Math.max(0,row-col);
    }
    else if (currCol - currRow > Math.max(0,col - row)){
        countDiag = Math.min(row,col) - (currCol - currRow) + Math.max(0,col - row);
    }
    else{
        countDiag = Math.min(row,col);
    }
    if (countDiag>=numToWin){
        //diagonal
        let minLoc = Math.min(currRow,currCol);
        for(let i = 0; i< countDiag ;i++) {
            diagStr += squares[(currRow-minLoc+i)*col + (currCol - minLoc+ i)]?squares[(currRow-minLoc+i)*col + (currCol - minLoc+ i)]:' ';
        }
    }
    //anti-diagonal
    let countAntiDiag = 0;
    if (currRow+currCol < Math.min(row,col) - 1){
        countAntiDiag = currRow + currCol + 1;
    }
    else if (currRow+currCol > Math.max(row,col) - 1){
        countAntiDiag = row + col - 1 - (currRow + currCol)
    }
    else {
        countAntiDiag = Math.min(row,col);
    }

    if (countAntiDiag>=numToWin){

        if(currCol + currRow < col){
            for(let i = 0; i< countAntiDiag ;i++){
                antiDiagStr += squares[i*col+currCol+currRow-i]?squares[i*col+currCol+currRow-i]:' ';
            }
        }
        else{
            for(let i = 0; i<countAntiDiag;i++){
                antiDiagStr += squares[(row - countAntiDiag + i)*col + (col - i- 1)]?squares[(row - countAntiDiag + i)*col + (col - i- 1)]:' ';
            }
        }


    }

    console.log('diagStr',diagStr);
    console.log('countDiagStr',countDiag);
    if(rowStr.includes(winStr) || colStr.includes(winStr) || diagStr.includes(winStr) || antiDiagStr.includes(winStr))
    {
        return winStr;
    }

    return null;
}