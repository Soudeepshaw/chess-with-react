import IMG from "../assets/landing.webp"

import { useNavigate } from "react-router-dom"
import { Button } from "../Components/Button"
export const Landing =()=>{
    const navigate=useNavigate()
    
    return(
        <div className="landing flex justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
            <div className="pt-16 max-w-screen-xl w-full px-4">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
                    <div className="flex justify-center">
                        <img src={IMG} alt="chess icon" className="rounded-lg shadow-2xl" style={{maxHeight: "450px", width: "auto"}}/>
                    </div>
                    <div className="flex flex-col items-center space-y-10">
                        <h1 className="text-7xl font-extrabold text-white text-center leading-tight">
                            Master the Game of Kings
                        </h1>
                        <p className="text-2xl text-gray-200 text-center">
                            Challenge your mind, improve your skills, and become a chess champion.
                        </p>
                        <div className="relative">
                            <Button 
                                onClick={() => navigate("/game")}
                                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-5 px-12 rounded-full transform transition duration-300 hover:scale-110 text-2xl shadow-lg"
                            >
                                Start Your Journey
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}