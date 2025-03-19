function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let currentQuestionIndex =  0;

const questions = [
    { id: 1, text: "What is the capital of France?" },
    { id: 2, text: "What is the secret of life?" },
    { id: 3, text: "Who wrote 'To Kill a Mockingbird'?" },
    { id: 4, text: "What is the chemical symbol for water?" },
    { id: 5, text: "Which planet is known as the Red Planet?" },
    { id: 6, text: "What is 9 + 10?" },
    { id: 7, text: "Who painted the Mona Lisa?" },
    { id: 8, text: "What is the speed of light in a vacuum?" },
    { id: 9, text: "Which element has the atomic number 1?" },
    { id: 10, text: "Who discovered gravity?" }
];


// Mock function to get a question
export async function qs_getQuestion() {
    await delay(2000); // Simulating a delay of 2 seconds
    let question = questions[currentQuestionIndex];
    currentQuestionIndex +=1;
    currentQuestionIndex = currentQuestionIndex % 10;
    //reply = reply == 0 ? 1 : 0;
    return question;

}

// Mock function to check an answer
export async function qs_checkAnswer(qid, answer) {
    await delay(2000); // Simulating a delay of 2 seconds

    // Mock answer validation
    const correctAnswers = {
        1: "Paris", // Capital of France
        2: "42", // The secret of life (from Hitchhiker's Guide to the Galaxy)
        3: "Harper Lee", // Author of 'To Kill a Mockingbird'
        4: "H2O", // Chemical symbol for water
        5: "Mars", // The Red Planet
        6: "19", // 9 + 10 = 19 (not the meme answer "21" 😆)
        7: "Leonardo da Vinci", // Painter of the Mona Lisa
        8: "299,792,458 m/s", // Speed of light in a vacuum
        9: "Hydrogen", // Atomic number 1
        10: "Isaac Newton" // Discovered gravity
    };


    console.log('correctAnswers[qid]',correctAnswers[qid],answer)

    return correctAnswers[qid] && correctAnswers[qid].toLowerCase() === answer.toLowerCase() ? 100 : 0;
}
