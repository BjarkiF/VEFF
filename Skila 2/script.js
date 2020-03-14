var minePos;
var rows;
var cols;

function getBoard() {
    rows = Number(document.getElementById("rows").value);
    cols = Number(document.getElementById("cols").value);
    var mines = Number(document.getElementById("mines").value);
    if (rows > 40 || cols > 40 || mines > (rows * cols)){
        rows = 10;
        cols = 10;
        mines = 10;
    }
    const url = 'https://veff213-minesweeper.herokuapp.com/api/v1/minesweeper';
    axios.post(url, { rows: rows, cols: cols, mines: mines})
        .then(function (response) {
            console.log("Board fetch success");
            minePos = response.data.board.minePositions;
        })
        .catch(function (error) {
            minePos = [[1,3],[3,0],[4,2],[4,5],[4,7],[6,9],[7,7],[8,9],[9,3],[9,9]];
            window.alert("Error: Backend not reachable. Default board used.")
        });
    clearBoard(rows, cols, createBoard);
}

function createBoard(rows, cols) {
    var board = document.getElementById("board");
    for (i = 0; i < rows; i++){
        let boardRow = document.createElement("div");
        board.appendChild(boardRow).className = "boardRow";
        boardRow.id = "r" + String(i);
        for (j = 0; j < cols; j++){
            let boardCell = document.createElement("div");
            boardRow.appendChild(boardCell).className = "boardCell";
            boardCell.id = "c" + String(i) + "-" + String(j);
            boardCell.addEventListener("click", function(){checkCell(boardCell.id);});
            boardCell.addEventListener("contextmenu", function(i){
                i.preventDefault();
                flag(boardCell.id);
            });
        }
    }

}

function clearBoard(rows, cols, callback){
    var board = document.getElementById("board");
    while (board.hasChildNodes()){
        board.removeChild(board.firstChild)
    }
    callback(rows,cols)
}


function getIdArray(idString) {
    var cellId = idString.substring(1).split("-");
    cellId[0] = Number(cellId[0]);
    cellId[1] = Number(cellId[1]);
    return cellId;
}

function getIdString(idArr){
    return "c" + String(idArr[0]) + "-" + String(idArr[1]);
}

function checkCell(id) {
    var cellId = getIdArray(id);
    var empty = true;
    var cellObj = document.getElementById(id);
    minePos.forEach(function(value){
        if (cellId[0] === value[0] && cellId[1] === value[1]){
            if (! cellObj.classList.contains("cellFlag")){
                foundBomb();
                empty = false;
            }
        }
    });
    if (empty) {
        emptyCell(id)
    }
}


function flag(id) {
    var cellObj = document.getElementById(id);
    if (! cellObj.classList.contains("cellEmpty")){
        if (cellObj.classList.contains("cellFlag")){
            cellObj.classList.remove("cellFlag")
        }
        else{
            cellObj.classList.add("cellFlag");
        }
    }
    checkWin();
}

function emptyCell(id){  // Virkar ekki
    var neighborBomb = false;
    var neighborBombCount = 0;
    var cellObj = document.getElementById(id);
    cellObj.classList.add("cellEmpty");
    if (cellObj.classList.contains("cellFlag")){
        cellObj.classList.remove("cellFlag")
    }
    var cellId = getIdArray(id);
    var neighbors = getNeighbors(cellId);
    neighbors.forEach(function (nVal) {
        minePos.forEach(function (mVal) {
            if (nVal[0] === mVal[0] && nVal[1] === mVal[1]){
                neighborBomb = true;
                neighborBombCount += 1;
            }
        })
    });
    if (neighborBomb === false){
       var stringId;
       var cellObjTemp;
       neighbors.forEach(function(value){
            stringId = getIdString(value);
            cellObjTemp = document.getElementById(stringId);
            if (cellObjTemp !== undefined){
                cellObjTemp.classList.add("cellEmpty");
                emptyCell(stringId)
            }
        });
    }
    else{
        var text = document.createTextNode(String(neighborBombCount));
        if (neighborBombCount === 1){
            cellObj.classList.add("oneBomb");
        }
        else if (neighborBombCount === 2){
            cellObj.classList.add("twoBomb");
        }
        else{
            cellObj.classList.add("nBomb");
        }
        cellObj.appendChild(text)
        }
    checkWin();
}

function foundBomb(){
    var board = document.getElementById("board");
    var boardParent = document.getElementById("boardParent");
    minePos.forEach(function(value){
        var tempId = "c" + String(value[0]) + "-" + String(value[1]);
        var tempCellObj = document.getElementById(tempId);
        tempCellObj.classList.add("cellBomb");
    });
    var new_board = board.cloneNode(true);
    boardParent.replaceChild(new_board, board);
    setTimeout(() => { alert("You Lose :("); }, 100);
}

function checkWin(){
    var win = true;
    minePos.forEach(function (value) {
        var strId = getIdString(value);
        var cellObj = document.getElementById(strId);
        if (! cellObj.classList.contains("cellFlag")){
            win = false;
        }
    });
    var emptyCells = document.getElementsByClassName("cellEmpty");
    if (emptyCells.length + minePos.length !== rows * cols){
        win = false;
    }
    if (win){
        var new_board = board.cloneNode(true);
        boardParent.replaceChild(new_board, board);
        setTimeout(() => { alert("You Win!"); }, 100);

    }
}

function getNeighbors(cellId){  //úff ljótt
    var neighbors = new Array(8);
    var tempCell0 = [0, 0];
    tempCell0[0] = cellId[0]-1;
    tempCell0[1] = cellId[1]-1;
    neighbors[0] = tempCell0;
    var tempCell1 = [0, 0];
    tempCell1[0] = cellId[0]-1;
    tempCell1[1] = cellId[1];
    neighbors[1] = (tempCell1);
    var tempCell2 = [0, 0];
    tempCell2[0] = cellId[0]-1;
    tempCell2[1] = cellId[1]+1;
    neighbors[2] = (tempCell2);
    var tempCell3 = [0, 0];
    tempCell3[0] = cellId[0];
    tempCell3[1] = cellId[1]-1;
    neighbors[3] = (tempCell3);
    var tempCell4 = [0, 0];
    tempCell4[0] = cellId[0];
    tempCell4[1] = cellId[1]+1;
    neighbors[4] = (tempCell4);
    var tempCell5 = [0, 0];
    tempCell5[0] = cellId[0]+1;
    tempCell5[1] = cellId[1]-1;
    neighbors[5] = (tempCell5);
    var tempCell6 = [0, 0];
    tempCell6[0] = cellId[0]+1;
    tempCell6[1] = cellId[1];
    neighbors[6] = (tempCell6);
    var tempCell7 = [0, 0];
    tempCell7[0] = cellId[0]+1;
    tempCell7[1] = cellId[1]+1;
    neighbors[7] = (tempCell7);
    return neighbors;
}