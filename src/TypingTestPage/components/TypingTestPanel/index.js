import './styles.css'
import React from 'react'
import { useEffect } from 'react'
import easy from '../../../utilities/easy.json'
import mid from '../../../utilities/mid.json'
import hard from '../../../utilities/hard.json'
import { useRef } from 'react'
import { useReducer } from 'react'
import { useState } from 'react'
import { useCallback } from 'react'
import { createContext } from 'react'
import { useContext } from 'react'
import UserScore from '../UserScore/'
import { TypingTestPageContext } from '../../index'


let timerId;

const defaultState = {
    words: [],
    wordCount: -1,
    currentWord: null,
    timeRemainingInSec: 60,
    timeRemaining: "",
    currentWordSpan: null,
    wrongWords: [],
    correctWords: [],
    gameState: "NONE", // possible values - NONE, running, stopped, ready
    isGameLoaded: false,
    wrongLetters: [],
    correctLetters: [],
    showResult: false,
    wpm: "",
    accuracy: "",
    lastKeyStroke: ""
}


function generateWords(mode) {
    switch (mode) {
        case "easy":
            return easy;
        case "mid":
            return mid;
        case "hard":
            return hard;
        default:
            throw new Error("Mode is undefined")
    }
}

function randomize(arr) {
    const newArr = []
    for (let i = 0; i < arr.length; i++) {
        const index = Math.floor(Math.random() * arr.length)
        newArr.push(arr[index])
    }
    return newArr
}

function parseTime(timeInSec) {
    let min = Math.floor(timeInSec / 60)
    if (min < 10) {
        min = "0" + min
    }
    let sec = Math.floor(timeInSec % 60)
    if (sec < 10) {
        sec = "0" + sec
    }
    return { min, sec }
}

function reducer(state, action) {
    switch (action.type) {
        case "lastKeyStroke":
            return { ...state, lastKeyStroke: action.payload }
        case "setIsGameLoaded":
            return { ...state, isGameLoaded: action.payload }
        case "setTime":
            const { min, sec } = parseTime(parseInt(action.payload))
            return { ...state, timeRemaining: `${min}:${sec}`, timeRemainingInSec: parseInt(action.payload) }
        case "setGameState":
            return { ...state, gameState: action.payload }
        case "setWords":
            return { ...state, words: action.payload }
        case "countDown":
            let timeInSec = state.timeRemainingInSec
            const { min: m, sec: s } = parseTime(timeInSec)
            timeInSec = state.timeRemainingInSec - 1
            return { ...state, timeRemaining: `${m}:${s}`, timeRemainingInSec: timeInSec }
        case "moveToNextWord":
            const wordCount = state.wordCount + 1;
            const currentWord = state.words[wordCount]
            const currentWordSpan = action.payload.current.querySelector(`span[word-index="${wordCount}"]`)
            return { ...state, wordCount, currentWord, currentWordSpan }
        case "wrongWord":
            return { ...state, wrongWords: [...state.wrongWords, action.payload] }
        case "correctWord":
            return { ...state, correctWords: [...state.correctWords, action.payload] }
        case "wrongLetters":
            return { ...state, wrongLetters: [...state.wrongLetters, ...action.payload] }
        case "correctLetters":
            return { ...state, correctLetters: [...state.correctLetters, ...action.payload] }
        case "reset":
            return action.payload
        case "result":
            return { ...state, wpm: action.payload.wpm, accuracy: action.payload.accuracy }
        case "showResult":
            return { ...state, showResult: action.payload }
        default:
            throw new Error("Action type not defined")
    }

}


const TypingTestPanelState = createContext(null)

const TypingTestPanel = ({ time, mode }) => {
    const { setMode, setTime, setIsGameSet } = useContext(TypingTestPageContext)
    console.log(TypingTestPageContext)
    const wordsPanelRef = useRef(null)
    const [state, dispatch] = useReducer(reducer, defaultState)
    const [userInputText, setUserInputText] = useState("")

    useEffect(() => {
        const words = randomize(generateWords(mode))
        dispatch({ type: "setWords", payload: words })
    }, [mode])

    // randomize the text to display and set is loaded to true
    useEffect(() => {
        if (state.words.length > 0) {
            dispatch({ type: "setIsGameLoaded", payload: true })
        }
    }, [state.words])

    useEffect(() => {
        dispatch({ type: "setTime", payload: JSON.stringify(JSON.parse(time)) })
    }, [time])


    function restart() {
        setUserInputText("")
        dispatch({ type: "reset", payload: defaultState })
        const words = randomize(generateWords(mode))
        dispatch({ type: "setWords", payload: words })
        dispatch({ type: "setTime", payload: JSON.stringify(JSON.parse(time)) })
    }


    const memoisedMatchText = useCallback(() => {
        const userText = userInputText.trim()
        const wrongLetters = []
        const correctLetters = []

        let loopLength = 0;

        if (userText.length <= state.currentWord.length) {
            loopLength = userText.length
        } else {
            loopLength = state.currentWord.length
        }

        for (let i = 0; i < loopLength; i++) {
            if (userText[i] === state.currentWord[i]) {
                correctLetters.push(userText[i])
            } else {
                // { "what user typed instead" : "what user is supposed to type"}
                wrongLetters.push({ [userText[i]]: state.currentWord[i] })
            }
        }


        // add the extra letters from the userText to the incorrectletters array if user typed more letters than the word has
        if (userText.length > state.currentWord.length) {
            const extraWrongLetters = userText.slice(state.currentWord.length, userText.length)
            for (let letter of extraWrongLetters) {
                wrongLetters.push({ [letter]: "" })
            }
        }

        // only if the last key stroke was spacebar
        if (userText.length < state.currentWord.length && state.lastKeyStroke === " ") {
            dispatch({ type: "lastKeyStroke", payload: "" })
            const extraWrongLetters = state.currentWord.slice(userText.length, state.currentWord.length)
            for (let letter of extraWrongLetters) {
                wrongLetters.push({ [letter]: "" })
            }
        }

        return { wrongLetters, correctLetters };
    }, [userInputText, state.currentWord, state.lastKeyStroke])


    function keyListener(key) {
        dispatch({ type: "lastKeyStroke", payload: key })
        // start countdown timer and move wordcount to 0 at the first keystroke
        if (state.wordCount === -1) {
            dispatch({ type: "setGameState", payload: "running" })
        }

        if (state.gameState === "running") {
            // if the spacebar was pressed
            if (key === " ") {
                // check that input box contains any actual text before moving to the next word
                if (userInputText.trim() !== "") {
                    const { wrongLetters, correctLetters } = memoisedMatchText()

                    removeCSSClass(state.currentWordSpan, "highlight-current")
                    if (userInputText.trim() !== state.currentWord) {
                        addCSSClass(state.currentWordSpan, "highlight-wrong")
                        dispatch({ type: "wrongWord", payload: state.currentWord })
                    } else {
                        addCSSClass(state.currentWordSpan, "highlight-correct")
                        dispatch({ type: "correctWord", payload: state.currentWord })
                    }

                    dispatch({ type: "correctLetters", payload: correctLetters })
                    dispatch({ type: "wrongLetters", payload: wrongLetters })
                    dispatch({ type: "moveToNextWord", payload: wordsPanelRef })
                }
                clearInputField();
            }

        }

    }


    // starts the game once the state of state.gameState is "running"
    useEffect(() => {
        if (state.gameState === "running" && state.wordCount === -1) {
            dispatch({ type: "moveToNextWord", payload: wordsPanelRef })
            timerId = setInterval(() => {
                if (state.timeRemainingInSec > 0) {
                    dispatch({ type: "countDown" })
                }
            }, 1000);
        }
    }, [state.gameState, state.wordCount, state.timeRemainingInSec])


    // stop game when state.timeRemainingInSec is less than 0
    useEffect(() => {
        if (state.timeRemainingInSec < 0) {
            dispatch({ type: "setGameState", payload: "stopped" })
        }
    }, [state.timeRemainingInSec])


    // runs when program advances to the new word
    useEffect(() => {
        if (state.currentWordSpan !== null) {
            addCSSClass(state.currentWordSpan, "highlight-current")

            // pulls the words panel up if text has flowed to the next line
            wordsPanelRef.current.style.top = -state.currentWordSpan.offsetTop + "px";
        }
    }, [state.currentWordSpan])



    // runs after setUserInputText() finishes running
    useEffect(() => {
        // prevents running immediately component is rendered since state.currentWord will 
        // be set when user starts actually typing stuff
        if (state.currentWordSpan !== null && userInputText.length !== 0) {
            // color current word <span> depending of whether user made a typo or not
            const wrongLetters = memoisedMatchText().wrongLetters
            console.log(wrongLetters)
            if (wrongLetters.length !== 0) {
                addCSSClass(state.currentWordSpan, "highlight-wrong")
            } else {
                removeCSSClass(state.currentWordSpan, "highlight-wrong")
            }

        }

    }, [userInputText, state.currentWordSpan, memoisedMatchText])

    function removeCSSClass(element, cssClass) {
        element.classList.remove(cssClass)
    }

    function addCSSClass(element, cssClass) {
        if (!element.classList.contains(cssClass)) {
            element.classList.add(cssClass)
        }
    }


    function clearInputField() {
        setUserInputText('')
    }



    const memoisedCalculateResult = useCallback(() => {
        // time in minutes
        const timeInMin = parseInt(time) / 60;
        const numberOfCorrectLetters = state.correctLetters.length

        const wpm = (numberOfCorrectLetters / 5 / timeInMin)
        console.log(wpm)
        // accuracy = (correctLetters/totalletters) * 100
        const numberOfTotalLetters = state.wrongLetters.length + state.correctLetters.length
        const accuracy = Math.round((state.correctLetters.length / numberOfTotalLetters) * 100)
        console.log(accuracy)

        dispatch({ type: "result", payload: { wpm, accuracy } })
    }, [state.correctLetters, time, state.wrongLetters.length])


    // does stuff when the game stops
    useEffect(() => {
        if (state.gameState === "stopped") {
            clearInterval(timerId)
            memoisedCalculateResult()

        }
    }, [state.gameState, memoisedCalculateResult])

    useEffect(() => {
        if (state.wpm !== "" && state.accuracy !== "") {
            dispatch({ type: "showResult", payload: true })
        }
    }, [state.wpm, state.accuracy])

    return (
        <>
            {!state.isGameLoaded && (
                <h3>Loading ...</h3>
            )}

            {state.isGameLoaded &&
                (<div className='typing-text-panel'>
                    <div>
                        <button type="button" id="restart-btn" className='btn' onClick={() => restart()}>repeat</button>
                        <button type='button' className="go-to-settings-btn btn" onClick={() => {
                            setMode("")
                            setTime(-1)
                            setIsGameSet(false)
                        }}>
                            settingsIcon
                        </button>
                    </div>
                    {/* display the TextDisplay only if the state.gameState is not 'stopped' */}
                    {state.gameState !== 'stopped' &&
                        <TypingTestPanelState.Provider value={state}>
                            <TextDisplay wordsPanelRef={wordsPanelRef} />
                        </TypingTestPanelState.Provider>
                    }

                    <div className="controls">

                        <input autoComplete="off" autoFocus type="text" id="text-input" onKeyDownCapture={(e) => keyListener(e.key)} onChange={(e) => setUserInputText(e.target.value)} value={userInputText} />
                        <div>
                            <p id='time-remaining'>{state.timeRemaining}</p>
                        </div>
                    </div>

                    {state.showResult && <UserScore wpm={state.wpm} accuracy={state.accuracy || 0} words={[state.correctWords.length, state.wrongWords.length]} letters={[state.correctLetters.length, state.wrongLetters.length]} />}
                </div >)
            }

        </>
    )
}



const TextDisplay = ({ wordsPanelRef }) => {
    const parentState = useContext(TypingTestPanelState)
    return (
        <div className='text-display'>
            <div className="words" ref={wordsPanelRef}> {parentState.words.map((word, index) => <span word-index={index} key={index}>{word}</span>)} </div>
        </div>
    )
}


export default TypingTestPanel