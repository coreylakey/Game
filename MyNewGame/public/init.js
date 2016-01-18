var stage;
var queue;
var speed = 7;
var iveBeenMade = 0;
var marioNum;
var myUserId;
var MAX_PLAYERS = 10;
var myPos = {};
window.onload = function init()
{
    console.log('Got into window.onLoad');
//Stage Creation
    stage = new createjs.Stage("myCanvas");
//Load the Queue
    queue = new createjs.LoadQueue(false);
    queue.installPlugin( createjs.Sound );
    queue.addEventListener( "complete", handleComplete );
    queue.loadManifest( [ 
        { id: "mario", src: "assets/mario.png"},
        { id: "gunSound", src: "assets/gunfire.mp3" },
        { id: "background", src: "assets/background.png" },
        { id: "marioWalk", src: "assets/MarioWalking.png"},
        { id: "backgroundMusic", src: "assets/marioTheme.mp3"} ] );
//Handle Movement
    window.addEventListener("keydown", move, false );
    window.addEventListener("keyup", stopMove, false );
    window.addEventListener("click", shoot );

}

function handleComplete( event )
{
//Ticker
    createjs.Ticker.addEventListener( "tick", tick );
//Spritesheet for
    marioWalkSpriteSheet = new createjs.SpriteSheet(
    {   "images": [queue.getResult('marioWalk')],
        "frames": {"width": 60, "height": 95},
        "animations": { "walkLeft": [0,6], 
        "walkRight": [7,13] }
    });


//Background Creation
    var bGround = new createjs.Bitmap( queue.getResult( "background" ) );
    bGround.x = 0;
    bGround.y = 0;
    stage.addChild( bGround );

//Background Music
    createjs.Sound.play("backgroundMusic", {loop: -1});
    
//Start Button
    var startBtn = new createjs.Shape();
    startBtn.addEventListener( "click", handleStartClick );
    startBtn.graphics.beginFill("#FF0000").drawRect( 0, 0, 100, 35 );
    startBtn.x = 100;
    startBtn.y = 100;
    stage.addChild(startBtn);

//Start Button (text)
    var startTxt = new createjs.Text("Start", "30px Impact", "#000000" );
    startTxt.x = 120;
    startTxt.y = 125;
    startTxt.textBaseline = "alphabetic";
    stage.addChild(startTxt);

//SocketIO
    //When Somebody elese creates character
    socket.on('create', createCharacter );
    //Movement Right
    socket.on('moveRight', moveRight );
    //Movement Left
    socket.on('moveLeft', moveLeft );
    //Stop Right
    socket.on('stopRight', stopRightMove );
    //Stop Left
    socket.on('stopLeft', stopLeftMove );
    //You're the new player.. heres your userID
    socket.on('userName', function(user){
        myUserId = user;
        console.log('My new myUserId is ' + user );

    });

//Populate with previous users
    socket.on('populate', function(users){
        var counter;

        for( counter = 1; counter < MAX_PLAYERS; counter++ )
        {
            if( users[counter] != null && counter != myUserId )
                createExistingCharacter(users[counter].id, users[counter].x, users[counter].y);
            else
                continue;
        }

        if( iveBeenMade != 1 )
        {
            createExistingCharacter( myUserId, 10, 360 );
            iveBeenMade = 1;
        }
    });
    //Make my guy
    // socket.on('yourTurn', function(){
    //     createExistingCharacter(myUserId, 10, 360);
    // });
}

function handleStartClick( event )
{
    socket.emit('newPlayer');
}

function createCharacter(userId)
{
    console.log('This is createCharacters ID ' + userId );
    //Create Mario
    var marioWalk = new createjs.Sprite( marioWalkSpriteSheet, "walkRight" );
    marioWalk.x = 10;
    marioWalk.y = 360;
    marioWalk.gotoAndPlay("walkRight");
    stage.addChildAt( marioWalk, userId );
    marioWalk.gotoAndStop();


}

//For new players who can't see us :(
function createExistingCharacter(userId, x, y)
{
    console.log('Creating existing character');
    console.log('Existing Character Creation: UserId: ' + userId + ' x: ' + x + ' y: ' + y );
    //Create Mario
    var marioWalk = new createjs.Sprite( marioWalkSpriteSheet, "walkRight" );
    marioWalk.x = x;
    marioWalk.y = y;
    marioWalk.gotoAndPlay("walkRight");
    stage.addChildAt( marioWalk, userId );
    marioWalk.gotoAndStop();


}

function move(key)
{
                     
    if( key.keyCode == "39")
    {
        socket.emit('playerMovedRight', myUserId );

    }
    else if( key.keyCode == "37")
    {
        socket.emit('playerMovedLeft', myUserId );
    }

}

function stopMove(key)
{

    if(key.keyCode == "39")
    {
        socket.emit('playerStoppedRight', myUserId );
    }
    else if(key.keyCode == "37")
    {
        socket.emit('playerStoppedLeft', myUserId );
    }
}


function moveLeft(userId)
{
    console.log('moveLeft got ' + userId );
    var character = stage.getChildAt( userId );

    if( character.currentAnimation != "walkLeft" || character.paused )
        character.gotoAndPlay( "walkLeft" );

    if( character.x > -5 && character.x < 1005 )
    {
        character.x = character.x - speed;
        myPos = { x: character.x, y: character.y };
        socket.emit('myPosition', myPos );
    }

}

function moveRight(userId)
{
    console.log('moveRight got ' + userId );
    var character = stage.getChildAt( userId );

    if( character.currentAnimation != "walkRight" || character.paused )
        character.gotoAndPlay( "walkRight" );

    if( character.x > -5 && character.x < 1005 )
    {
        character.x = character.x + speed;
        myPos = { x: character.x, y: character.y };
        socket.emit('myPosition', myPos );
    }

}

function stopLeftMove(userId)
{
    console.log('stopLeftMove got ' + userId );
    var character = stage.getChildAt( userId );

    character.stop();
}

function stopRightMove(userId)
{
    console.log('stopRightMove got ' + userId );
    var character = stage.getChildAt( userId );

    character.stop();
}

function printOut(array)
{
    var counter;

    for( counter = 0; counter < array.length; counter++ )
    {
        console.log('populateUsers(before filter): ' + array );
    }
}

function shoot(event)
{
    createjs.Sound.play("gunSound");
}

function tick(event)
{
    //Update our stage
    stage.update();
}


