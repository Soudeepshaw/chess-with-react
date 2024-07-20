import IMG from "../assets/chessboard.jpeg"
import Icon from "../assets/24747275-removebg-preview.png"
import { useNavigate } from "react-router-dom"
import { Button } from "../Components/Button"
export const Landing =()=>{
    const navigate=useNavigate()
    
    return(
        <div className="landing flex justify-cneter">
            <div className="pt-8 mx-w-screen-lg mx-20">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex justify-center max-h-fit">
                        <img src={IMG} alt="chessboard image" className="max-h-100" style={{height:"510px"}}/>
                    </div>
                    <div className="pt-20 mx-20">
                        <div className="flex justify-center ">
                        <h1 className="text-5xl font-bold text-white text-center">
                            Play Chess Online on the #1 Site!
                        </h1>
                            </div> 
                        <div className="mt-10 flex justify-center h-20 relative ">
                            <img src={Icon} alt="" className="absolute bottom-0 left-5 h-20"/>
                            <Button onClick={()=>{navigate("/game")}}>
                                    Play Online
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        )
}