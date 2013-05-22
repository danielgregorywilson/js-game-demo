function Tileset(tilesetImage, tileSize) {
    var tilesetHeight = (tilesetImage.height/(tileSize+1)); //number of tiles high
    var tilesetWidth = (tilesetImage.width/(tileSize+1)); //number of tiles wide

    var tileCount = tilesetWidth * tilesetHeight;

    // We assume that tilesetImage is already loaded. It is the responsibility of the caller to ensure that is true

    function drawTile(
        context,
        tileIndex,
        destX,
        destY
        ) {
        var tileRow = Math.floor(tileIndex / tilesetWidth);
        var tileCol = tileIndex % tilesetWidth;

        context.drawImage(
            tilesetImage, // The image to draw
            tileCol * (tileSize+1), // The X coordinate of the area on the source image to draw
            tileRow * (tileSize+1), // The Y coordinate of the area on the source image to draw
            tileSize, // The width of the area to draw on the source image
            tileSize, // The height of the area to draw on the source image
            destX, // The X coordinate on the destination image to draw the area from the source
            destY, // The Y coordinate on the destination image to draw the area from the source
            tileSize, // The width to draw the area from the source on the destination image
            tileSize // The height to draw the area from the source on the destination image
        );
    }

    return {
        "tileCount" : tileCount,
        "drawTile" : drawTile
    };
}

function Game(viewportCanvas) {
    var TILE_SIZE = 16;

    var lastStateUpdate;

    /**
     * Holds the coordinates of the game world that are currently being displayed in the viewport.
     */
    var viewportRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    var tileset = null;

    var mapData = null;


    function updateState() {
        var elapsedTime = (new Date).getTime() - lastStateUpdate;
        lastStateUpdate = (new Date).getTime();

        // Logic to update the game state here. elapsedTime is the number of milliseconds since the last state
        // update, which can be used to update the positions
    }

    function renderFrame() {
        var context = viewportCanvas.getContext("2d");

        for (
            var mapX = viewportRect.x,
                pixelX=0;
            mapX < Math.min((viewportRect.x + viewportRect.width), mapData.length);
            mapX ++,
                pixelX += TILE_SIZE
        ) {
            for (
                var mapY = viewportRect.y,
                    pixelY=0;
                mapY < Math.min((viewportRect.y + viewportRect.width), mapData[mapX].length);
                mapY ++,
                    pixelY += TILE_SIZE
            ) {
                tileset.drawTile(
                    context,
                    mapData[mapX][mapY],
                    pixelX,
                    pixelY
                );
            }
        }
    }

    function initMap(width, height, defaultTile) {
        mapData = new Array(width);
        
        for (var x=0; x<width; x++) {
            mapData[x] = new Array(height);
            
            for (var y=0; y<height; y++) {
                mapData[x][y] = defaultTile;
            }
        }

        for (var x=0; x<width; x++) {
            mapData[x][29] = 120;
        }

    }

    function initViewport() {
        viewportRect.width = parseInt(viewportCanvas.width) / TILE_SIZE;
        viewportRect.height = parseInt(viewportCanvas.height) / TILE_SIZE;
    }

    function drawBox(
        x,
        y,
        width,
        height,
        centerTile
    ) {
        for (var mapX=x; mapX<x+width; mapX++) { // draw the entire box with center tiles
            for (var mapY=y; mapY<y+height; mapY++) {
                mapData[mapX][mapY] = centerTile;
            }
        }

        for (var mapX=x; mapX<x+width; mapX++) { // draw the top and bottom edges
            mapData[mapX][y] = centerTile - 17;
            mapData[mapX][y+height] = centerTile + 17;
        }


        for (var mapY=y; mapY<y+height; mapY++) { //draw the left and right edges
            mapData[x][mapY] = centerTile - 1;
            mapData[x+width][mapY] = centerTile + 1;
        }

        mapData[x][y] = centerTile - 18; // Top Left
        mapData[x+width][y] = centerTile - 16; // Top Right
        mapData[x+width][y+height] = centerTile + 18; // Bottom Right
        mapData[x][y+height] = centerTile + 16; // Bottom Left
    }

    function setup() {
        lastStateUpdate = (new Date).getTime();

        function doFrame() {
            updateState();
            renderFrame();

            webkitRequestAnimationFrame(doFrame);
        }

        initMap(100, 40, 26);

        spawnEnemy();

        for (var i=0; i<4; i++) {
            drawBox(
                parseInt(Math.random() * 90),
                parseInt(Math.random() * 30),
                2+parseInt(Math.random() * 8),
                2+parseInt(Math.random() * 8),
                30
            );
        }

        for (var i=0; i<4; i++) {
            drawBox(
                parseInt(Math.random() * 90),
                parseInt(Math.random() * 30),
                2+parseInt(Math.random() * 8),
                2+parseInt(Math.random() * 8),
                77
            );
        }

        for (var i=0; i<4; i++) {
            drawBox(
                parseInt(Math.random() * 90),
                parseInt(Math.random() * 30),
                2+parseInt(Math.random() * 8),
                2+parseInt(Math.random() * 8),
                81
            );
        }

        function isPassable(block) {
            if (block == 26) {
                return true;
            }
            else {
                return false;
            }
        }

        function enemyNear() {
            if (mapData[charlocX-1] == 281 || mapData[charlocX+1] == 281 || mapData[charlocY+1] == 281 || mapData[charlocY-1] == 281) {
                return true;
            } else {
                return false;
            }
        }

        var charlocX = 1; //define initial character position
        var charlocY = 1;
        var currTile = 26; //keep track of which tile the character is "on top of"

        var coinlocX = 0; //initialize coin position variables
        var coinlocY = 0;
        var coinCurrTile = 26; //keep track of which tile the coin is "on top of"

        mapData[charlocX][charlocY] = 283; // write initial character position

        function spawnEnemy() {
            var enemyLocX = parseInt(Math.random() * 90);
            var enemyLocY = parseInt(Math.random() * 30);
            mapData[enemyLocX][enemyLocY] = 281; // write initial enemy position
        }

        function moveEnemy() {
            var direction = parseInt(Math.random() * 4);
            mapData[enemyLocX][enemyLocY] = 26;
            if (direction == 0) {
                enemyLocX += 1;
            } else if (direction == 1) {
                enemyLocX -= 1;
            } else if (direction == 2) {
                enemyLocY += 1;
            } else {
                enemyLocY -= 1;
            }
            mapData[enemyLocX][enemyLocY] = 281
        }

        function gravity() {
            if (isPassable(mapData[charlocX][charlocY+1])) {
                charlocY += 1;
                mapData[charlocX][charlocY-1] = currTile;
                currTile = mapData[charlocX][charlocY];
                mapData[charlocX][charlocY] = 283; // update position
            }
        }

        function moveCoin() {    
            if (coinlocX != 0) {
                if (isPassable(mapData[coinlocX+1][coinlocY])) { // the coin passes through green (open) space
                    coinlocX += 1;
                    mapData[coinlocX-1][coinlocY] = coinCurrTile;
                    mapData[coinlocX][coinlocY] = 156;
                } else if (mapData[coinlocX+1][coinlocY] == 281) { // if coin hits enemy
                    mapData[coinlocX+1][coinlocY] = 26;
                    mapData[coinlocX][coinlocY] = 26;
                } else { // if it hits anything else
                    mapData[coinlocX][coinlocY] = 26;
                }
            }
        }

        $(document).ready(function() {

            setInterval(function(){
                moveCoin();
            },80);

            setInterval(function(){
                gravity();
            },500);

            setInterval(function(){
                moveEnemy();
                mapData[enemyLocX+1][enemyLocY] = 281;
            },500);

            $(document).keydown(function(key) {
                switch(parseInt(key.which,10)) {
                    case 65: //move left
                        if (isPassable(mapData[charlocX-1][charlocY])) {
                            charlocX -= 1;
                            mapData[charlocX+1][charlocY] = currTile;
                            currTile = mapData[charlocX][charlocY];
                            mapData[charlocX][charlocY] = 283; // update position
                        }
                        break;
                    case 83: //move down
                        if (isPassable(mapData[charlocX][charlocY+1])) {
                            charlocY += 1;
                            mapData[charlocX][charlocY-1] = currTile;
                            currTile = mapData[charlocX][charlocY];
                            mapData[charlocX][charlocY] = 283; // update position
                        }
                        break;
                    case 87: //move up
                        if (isPassable(mapData[charlocX][charlocY-1])) {
                            charlocY -= 1;
                            mapData[charlocX][charlocY+1] = currTile;
                            currTile = mapData[charlocX][charlocY];
                            mapData[charlocX][charlocY] = 283; // update position
                        }
                        break;
                    case 68: //move right
                        if (isPassable(mapData[charlocX+1][charlocY])) {
                            charlocX += 1;
                            mapData[charlocX-1][charlocY] = currTile;
                            currTile = mapData[charlocX][charlocY];
                            mapData[charlocX][charlocY] = 283; // update position
                        }
                        break;
                    case 32: //fire coin to the right
                        if (isPassable(mapData[charlocX+1][charlocY])) {
                            mapData[coinlocX][coinlocY] = 26;
                            coinlocX = charlocX+1;
                            coinlocY = charlocY;
                            mapData[coinlocX][coinlocY] = 156;
                        }
                }
            });
            
            //death by enemy
            $(function() {
                if (enemyNear()) {
                    mapData[charlocX][charlocY] == 284;
                }
            });

            

        });

        // Wait till the tileset is loaded to start the game
        var tilesetImage = new Image();
        tilesetImage.onload = function(){
            tileset = new Tileset(tilesetImage, TILE_SIZE);

            initViewport();
            doFrame();
        };
        tilesetImage.src = "img/tileset.png";
    }

    return {
        "start": setup
    };
}

