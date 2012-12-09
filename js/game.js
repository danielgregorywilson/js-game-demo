function Tileset(tilesetImage, tileSize) {
    var tilesetWidth = (tilesetImage.width/tileSize);
    var tilesetHeight = (tilesetImage.height/tileSize);

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
        for (var mapX=x; mapX<x+width; mapX++) {
            for (var mapY=y; mapY<y+height; mapY++) {
                mapData[mapX][mapY] = centerTile;
            }
        }

        for (var mapX=x; mapX<x+width; mapX++) {
            mapData[mapX][y] = centerTile - 18;
            mapData[mapX][y+height] = centerTile + 18;
        }


        for (var mapY=y; mapY<y+height; mapY++) {
            mapData[x][mapY] = centerTile - 1;
            mapData[x+width][mapY] = centerTile + 1;
        }

        mapData[x][y] = centerTile - 19; // Top Left
        mapData[x+width][y] = centerTile - 17; // Top Right
        mapData[x+width][y+height] = centerTile + 19; // Bottom Right
        mapData[x][y+height] = centerTile + 17; // Bottom Left
    }

    function setup() {
        lastStateUpdate = (new Date).getTime();

        function doFrame() {
            updateState();
            renderFrame();

            webkitRequestAnimationFrame(doFrame);
        }

        initMap(100, 40, 27);

        for (var i=0; i<10; i++) {
            drawBox(
                parseInt(Math.random() * 90),
                parseInt(Math.random() * 30),
                2+parseInt(Math.random() * 8),
                2+parseInt(Math.random() * 8),
                31
            );
        }

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


