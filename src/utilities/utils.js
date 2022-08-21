const fs = require('fs')
const words = require('./words.json')

function generateWords(mode, max, min = 0) {
    let data = words.data

    let newData = []

    // remove the carriage return from each word (i.e the \r)
    data = data.map(word => {
        return word.split("\r")[0]
    })

    // return not more than 1000 words of length between min and max
    for (let i = 0; i < data.length; i++) {
        if (newData.length > 1000) break;

        if (data[i].length >= min && data[i].length <= max) {
            newData.push(data[i])
        }
    }


    console.log("Randomizing ...")
    newData = randomize(newData)

    newData = JSON.stringify(newData)
    console.log(newData)

    const fileName = `./${mode}.json`

    fs.writeFile(fileName, newData, (err) => {
        if (err) return err
        console.log("success writing to file")
    })
    return 'done'
}

function randomize(wordList) {
    wordList = JSON.parse(JSON.stringify(wordList))
    const newWordList = []

    for (let i = 0; i < wordList.length; i++) {
        const index = Math.floor(Math.random() * wordList.length)
        const randomWord = wordList[index]
        newWordList.push(randomWord)

        wordList.filter((word, wIndex) => {
            return wIndex !== index
        })
    }
    return newWordList
}

function getWords(mode) {
    switch (mode) {
        case 'easy':
            return generateWords(mode, 4);
        case "mid":
            return generateWords(mode, 8, 4);
        case "hard":
            return generateWords(mode, 20, 7);
    }
}

getWords("mid")