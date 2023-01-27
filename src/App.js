import { Box, Button, Container, HStack, Input, VStack } from '@chakra-ui/react';
import './App.css';
import Message from './components/Message';
import {getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut} from 'firebase/auth';
import {app} from './firebase';
import { useEffect, useRef, useState } from 'react';
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
}


function App() {

  const q = query(collection(db, "Messages"), orderBy("createdAt", "asc"))

  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const divforscroll = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (message !== '') {
        await addDoc(collection(db, "Messages"),{
          text: message,
          uid: user.uid,
          uri: user.photoURL,
          createdAt: serverTimestamp(),
        })
        setMessage("");
        divforscroll.current.scrollIntoView({ behavior: "smooth"})
      }
      
    } catch (error) {
      alert(error)
    }
  }

  useEffect(() => {
    const unsubscribe =  onAuthStateChanged(auth, (data) => {
      setUser(data);
    })

    const unsubscribeForMessages =  onSnapshot(q,collection(db, "Messages"), (snap) => {
      setMessages(snap.docs.map((item)=> {
        const id = item.id;
        return {id, ...item.data()};
      }));
    })

    return () => {
      unsubscribe();
      unsubscribeForMessages();
    };
  }, []);


  const logoutHandler = () => signOut(auth);


  return (
    <Box bg={"red.200"}>
      {user 
        ? (
        <Container bg={"telegram.200"} h="100vh">
          <VStack h={"full"} paddingY={"4"}>
            <Button
              onClick={logoutHandler}
              w={"full"}
              bg={"red.500"}
              color={"white"}>
              Logout
            </Button>

            <VStack
                h={"full"}
                w={"full"}
                overflowY={"auto"}
                css={{"&::-webkit-scollbar":{display:"none"}}}>
                {
                  messages.map((item) => (
                    <Message
                      text={item.text}
                      uri={item.uri} 
                      user={item.uid==user.uid?"me":"other"}
                    />
                  ))
                }
                <div ref={divforscroll}></div>
            </VStack>

            <form onSubmit={submitHandler} style={{width: "100%"}}  >
              <HStack w={"full"} >
                <Input
                    placeholder='Enter a message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}/>
                <Button colorScheme={"purple"} type='submit'>Send</Button>
              </HStack>
            </form>
          </VStack>
        
      </Container>

        )
        : (
        <VStack h={"100vh"} justifyContent={"center"}>
            <Button onClick={loginHandler}>Sign In</Button>
        </VStack>
        )}
    </Box>
  );
}

export default App;
