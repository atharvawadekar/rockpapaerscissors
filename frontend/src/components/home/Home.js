import { Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import io from 'socket.io-client';
import './Home.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const socket = io.connect('http://localhost:5000');

function Home() {
    //
    const [open, setOpen] = useState(0);
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(0);
    }
    //

    const [isOpponentPresent, setIsOpponentPresent] = useState(false);

    const [currentRoom, setCurrentRoom] = useState("");
    const [roomValue, setRoomValue] = useState("");

    const [myChoice, setMyChoice] = useState("");
    const [oppChoice, setOppChoice] = useState("");

    const [myScore, setMyScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);

    //Chat
    const [chatList, setChatList] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const messageEndRef = useRef(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView();
    }, [chatList])

    const handleSend = () => {
        setChatList([...chatList, "You: "+currentMessage]);
        setCurrentMessage("");
        socket.emit('send_message', {currentMessage:currentMessage, roomId:currentRoom});
    }
    socket.on('receive_message', (data) => {
        setChatList([...chatList, "Enemy: "+data]);
    });
    //Chat ends

    const handleCreateRoom = (e) => {
        socket.emit('create_room');
        socket.on('get_room_id', (data) => {
            console.log(data);
            setCurrentRoom(data);
        });
    }

    const handleJoinRoom = (e) => {
        socket.emit('join_room', roomValue);
    }
    socket.on('join_room_status', (data) => {
        if(data === "Success"){
            setCurrentRoom(roomValue);
            setIsOpponentPresent(true);
        }
        else{
            if(data === 'Room is full'){
                setOpen(1);
            }
            else if(data === 'Room does not exist'){
                setOpen(2);
            }
        }
    });
    socket.on('opponent_joined', () => {
        setIsOpponentPresent(true);
    });


    const handleChoice = (e, choice) => {
        setMyChoice(choice);
        socket.emit('send_choice', {choice:choice, roomId:currentRoom});
    }
    socket.on('receive_choice', (choice) => {
        setOppChoice(choice);
    });


    const determineWinner = () => {
        if(myChoice === 'rock'){
            if(oppChoice === 'paper'){
                setOppScore((prevValue) => prevValue + 1);
            }
            else if(oppChoice === 'scissors'){
                setMyScore((prevValue) => prevValue + 1);
            }
        }
        else if(myChoice === 'paper'){
            if(oppChoice === 'scissors'){
                setOppScore((prevValue) => prevValue + 1);
            }
            else if(oppChoice === 'rock'){
                setMyScore((prevValue) => prevValue + 1);
            }
        }
        else if(myChoice === 'scissors'){
            if(oppChoice === 'rock'){
                setOppScore((prevValue) => prevValue + 1);
            }
            else if(oppChoice === 'paper'){
                setMyScore((prevValue) => prevValue + 1);
            }
        }

        setTimeout(() => {
            setMyChoice("");
            setOppChoice("");
        },[7000]);
    }
    useEffect(() => {
        if(myChoice !== "" && oppChoice !== ""){
            determineWinner();
        }
    }, [myChoice, oppChoice]);

    socket.on('opponent_left', () => {
        setIsOpponentPresent(false);

        //Resetting
        setMyChoice("");
        setOppChoice("");
        setMyScore(0);
        setOppScore(0);
        setChatList([]);
    });
    
    return (
        <Stack style={{width:'100%', height:'calc(100vh)', boxSizing:'border-box'}}>
            {
            !currentRoom && 
            <div style={{width:'100%', height:'100%', backgroundColor:'black', display:'flex', justifyContent:'center', alignItems:'center'}}>
                <Stack sx={{width:'40%'}} gap={2}>
                    <button className='home_button' variant='primary' onClick={handleCreateRoom}>Create Room</button>
                    <h3 className='home_text' style={{textAlign:'center'}}>OR</h3>
                    <TextField sx={{backgroundColor:'white'}} size='small' type='text' placeholder="Enter room id" onChange={(e) => setRoomValue(e.target.value)} value={roomValue} />
                    <button className='home_button' variant='primary' onClick={handleJoinRoom}>Join Room</button>

                    <Snackbar sx={{width:'30%'}} open={open !== 0} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{vertical:'top', horizontal:'center'}}>
                        <Alert onClose={handleClose} severity={open===1? "info":"error"} sx={{ width: '100%' }}>
                            {
                                open === 1 && <>Room is Full</>
                            }
                            {
                                open === 2 && <>Room does not exist</>
                            }
                        </Alert>
                    </Snackbar>
                </Stack>
            </div>
            }



            {currentRoom && 
            <div style={{width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'black'}}>
            <Stack sx={{width:'80%', border:'1px solid white', padding:'20px'}}>    
            {currentRoom && 
                <div className='score_text' style={{textAlign:'center', borderBottom:'1px solid white'}}>
                    Room Id : {currentRoom}
                </div>
            }
            {currentRoom && !isOpponentPresent && 
                <div className='score_text' style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight:'400px'}}>
                    Waiting for opponent to join......
                </div>
            }
            {currentRoom && isOpponentPresent &&
            <div className='container'>
                <div className="row" style={{minHeight:'100px', backgroundColor:'black', borderBottom:'1px solid white'}}>
                    <div className="col-4" style={{display:'flex', justifyContent:'center', alignItems:'center', borderRight:'1px solid white'}}>
                        <button className='game_btn' onClick={(e) => handleChoice(e, 'rock')} disabled={!!myChoice}>Rock</button>
                    </div>
                    <div className="col-4" style={{display:'flex', justifyContent:'center', alignItems:'center', borderLeft:'1px solid white', borderRight:'1px solid white'}}>
                        <button className='game_btn' onClick={(e) => handleChoice(e, 'paper')} disabled={!!myChoice}>Paper</button>
                    </div>
                    <div className="col-4" style={{display:'flex', justifyContent:'center', alignItems:'center', borderLeft:'1px solid white'}}>
                        <button className='game_btn' onClick={(e) => handleChoice(e, 'scissors')} disabled={!!myChoice}>Scissors</button>
                    </div>
                </div>
                
                <div className="row" style={{minHeight:'100px'}}>
                    <div className="col-6 score_text" style={{display:'flex', justifyContent:'center', alignItems:'center', borderRight:'1px solid white'}}>
                        You chose: {myChoice}
                    </div>
                    <div className="col-6 score_text" style={{display:'flex', justifyContent:'center', alignItems:'center', borderLeft:'1px solid white'}}>
                        Enemy chose: {myChoice && <div>{oppChoice}</div>}
                    </div>
                </div>

                <div className="row" style={{minHeight:'100px'}}>
                    <div className="col-6 score_text" style={{display:'flex', justifyContent:'center', alignItems:'center', borderRight:'1px solid white'}}>
                        Your score : {myScore}
                    </div>
                    <div className="col-6 score_text" style={{display:'flex', justifyContent:'center', alignItems:'center', borderLeft:'1px solid white'}}>
                        Enemy score : {oppScore}
                    </div>
                </div>
            </div>
            }
            </Stack>
            </div>}
            
            {/* {currentRoom && isOpponentPresent &&
                <div style={{height:'150px', backgroundColor:'black'}}>
                    <div style={{position:'sticky'}}>
                        <input type='text' value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} />
                        <button onClick={handleSend}>Send</button>
                    </div>
                    <div style={{overflow:'scroll', height:'100px'}}>
                    {
                        chatList.map((item, index) => {
                            return <div className='chat_text' key={index}>{item}</div>
                        })
                    }
                    <div ref={messageEndRef} />
                    </div>
                </div>
            } */}
        </Stack>
    )
}

export default Home