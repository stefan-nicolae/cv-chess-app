import "./container.css"
import Chessboard from "./chessboard"

export default function Container () {
    return <div className="container">
        <h1>Welcome to the Chess App</h1>
        <Chessboard/>
    </div>
}