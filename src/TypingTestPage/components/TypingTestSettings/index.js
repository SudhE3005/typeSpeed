import './styles.css'
import React from 'react'
import { useState, useEffect } from 'react'

const TypingTestSettings = ({ setMode, setTime: setT}) => {
    const [difficulty, setDifficulty] = useState("")
    const [time, setTime] = useState("")
    const [errorMsg, setErrorMsg] = useState(null)

    const initTest = () => {
        let msg = ""
        if (time === "" || difficulty === "") {
            msg = "Time or Difficulty level has not been selected!"
            setErrorMsg(msg)
            return;
        } 

        setErrorMsg("")
    }

    useEffect(() => {
        if (errorMsg === "") {
            setMode(difficulty)
            setT(time)
        }

    }, [errorMsg, time, difficulty, setMode, setT])


    return (
        <>
            <div className='typing-test-settings-wrapper'>
                <form className='typing-test-settings'>
                    <h2 className="title">Choose Typing Test Settings</h2>
                    <div className='form-control-group'>

                        <div className="difficulty form-item">
                            <label htmlFor="difficulty">Difficulty Level: </label>
                            <select name="difficulty-chooser" id="difficulty" onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="" defaultValue={""}>Choose difficulty</option>
                                <option value="easy">Easy</option>
                                <option value="mid">Medium</option>
                                <option value="hard">Hard</option>
                            </select>

                        </div>

                        <div className="time form-item">
                            <label htmlFor="time">Time: </label>
                            <select name="time-chooser" id="time" onChange={(e) => setTime(e.target.value)}>
                                <option value="" defaultValue={""}>Choose time</option>
                                <option value="30">30 seconds</option>
                                <option value="60">1 minute</option>
                                <option value="120">2 minutes</option>
                                <option value="300">5 minutes</option>

                            </select>
                        </div>

                        <div className="form-control-group">
                            <button className='btn' type="button" id='start-typing-btn' onClick={initTest}>Start Typing</button>
                            {errorMsg !== "" && <p className="error-msg">
                                {errorMsg}
                            </p>}
                        </div>
                    </div>

                </form>
            </div>
        </>
    )
}

export default TypingTestSettings