import React from 'react'
import { useCallback } from 'react'
import './styles.css'

const UserScore = ({ wpm, accuracy, words: [correctWords, wrongWords], letters: [correctLetters, wrongLetters] }) => {
    const wpmRef = useCallback((node) => {
        if (node !== null) {
            node.style.color = chooseValueColor(wpm, 40)
        }
    }, [wpm])

    const accuracyRef = useCallback((node) => {
        if (node !== null) {
            node.style.color = chooseValueColor(accuracy, 70)
        }
    }, [accuracy])

    function chooseValueColor(value, minValue) {
        let color;
        if (value < minValue) {
            color = "var(--black-clr)";
        } else {
            color = "var(--black-clr)";
        }
        return color;
    }

    return (
        <div className='score-board-wrapper'>
            <div className="primary-score-board">
                <div className="main-score score">
                    <div className="score-value" ref={wpmRef}>{wpm}</div>
                    <div className="score-title">WPM</div>
                </div>

                <div className="sub-score score">
                    <div className="score-value" ref={accuracyRef}>{accuracy}</div>
                    <div className="score-title">Accuracy (%)</div>
                </div>

            </div>
            <div className="secondary-score-board">
                <div className="extra">
                    <h4 className='title'>Total Words</h4>
                    <span className='value'>
                        <span className='correct'>{correctWords}</span>
                        <span className='separator'>|</span>
                        <span className='wrong'>{wrongWords}</span>
                    </span>
                </div>
                <div className="extra">
                    <h4 className='title'>Keystrokes</h4>
                    <span className='value'>
                        <span className='correct'>{correctLetters}</span>
                        <span className='separator'>|</span>
                        <span className='wrong'>{wrongLetters}</span>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default UserScore