import { useEffect, useState } from "react"
const WS_URL="ws://localhost:8081";

export const useSocket=()=>{
    const [socket,setSocket]=useState<WebSocket |null>(null);
    useEffect(()=>{
        const ws=new WebSocket(WS_URL);
        ws.onopen=()=>{
            console.log("WebSocket connection opened");
            setSocket(ws);
        }
        ws.onclose=()=>{
            console.log("WebSocket connection closed"); 
            setSocket(null);
        }
        return()=>{
            ws.close()
        }
    },[])
    return socket;
}