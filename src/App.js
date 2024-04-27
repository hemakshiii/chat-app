import React, { useRef } from 'react'
import { useState, useEffect} from 'react'
import {Box,Button,Container,VStack,HStack,Input} from '@chakra-ui/react'
import Message from './Components/Message'
import {signOut, onAuthStateChanged, getAuth,GoogleAuthProvider, signInWithPopup} from "firebase/auth"
import {app} from "./Components/firebase"
import {getFirestore,addDoc, collection, serverTimestamp, onSnapshot, query, orderBy}  from "firebase/firestore";

const auth=getAuth(app)
const db=getFirestore(app)
const loginHadler=()=>{
  const provider=new GoogleAuthProvider();
  signInWithPopup(auth,provider)
}

const logOut=()=>{
signOut(auth)
}

function App() {
  
  const [user,setUser]=useState(false);
  const [message,setMessage]=useState("")
  const [messages,  setMessages] = useState([])

  const divForScroll=useRef(null)

 const submitHandler=async(e)=>{
 e.preventDefault();
try {
  setMessage("")
  await addDoc(collection(db,"Messages"),{
    text:message,
    uid:user.uid,
    uri:user.photoURL,
    craetedAt:serverTimestamp()
  })
  divForScroll.current.scrolliIntoView({behavior:"smooth"})
} catch (error) {
  alert(error)
}
 }

  useEffect(()=>{
  const q = query(collection(db,"Messages"), orderBy("craetedAt","asc"));
  const unsubscribe= onAuthStateChanged(auth,(data)=>{
     setUser(data);
   })
   const unsubscribeForMessage= onSnapshot(q,(snap)=>{
     setMessages(
       snap.docs.map((item)=>{
         const id=item.id;
         return {id, ...item.data()}
 
       })
     )
   },[])
   return () =>
   {
     unsubscribe();
     unsubscribeForMessage();
   };
  },[]);


return (
<Box bg={"red.50"}>
 {
  user?(
    <Container h={"100vh"} bg={"white"}>

   <VStack h={"full"} bg={"azure"} paddingY={"4"} overflowY={"auto"}>
    <Button onClick={logOut} w={"full"} colorScheme='red'>Logout</Button>
  <VStack h={"full"} w={"full"} bg={"aliceblue"} overflow={"auto"} css={{"&::-webkit-scrollbar":{
    display:"none"
  }}}>
   {
    messages.map((item)=>(
      <Message 
      key={item.id}
      user={item.uid===user.uid?"me":"other"} 
      uri={item.uri} 
      text={item.text}/>
     
    ))
   }
   
<div ref={divForScroll}></div>
  </VStack>
  <form onSubmit={submitHandler}  style={{width:"100%"}}>
  <HStack>
  <Input value={message} onChange={(e)=>setMessage(e.target.value)} w={"100%"} placeholder='Enter a message...'/>
  <Button type='submit' colorScheme='green'>Send</Button>
    </HStack>
  </form>
  </VStack>


 </Container>
  ):
  <VStack h={"100vh"} bg={"aliceblue"} justifyContent={"center"}>
    <Button onClick={loginHadler} colorScheme='blue'>Sign In with Google</Button>
  </VStack>
 }
</Box>
  )
  
}
export default App

