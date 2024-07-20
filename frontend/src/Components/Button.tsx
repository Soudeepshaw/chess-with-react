import { ReactNode } from "react";

export const Button=({onClick,children}:{onClick:()=>void,children:ReactNode})=>{
    return(
        <button onClick={onClick} 
        className=" px-8 py-4 text-2xl bg-lime-600 hover:bg-lime-500 text-white font-bold rounded w-full">
                {children}
        </button>
    )
}