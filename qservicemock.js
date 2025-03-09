function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let reply =  0;

const questions = [
    {id:1,text: "What is the capital of France?"},
    {id:2,text: "What is the secret of life?"}
]

// Mock function to get a question
export async function qs_getQuestion() {
    await delay(2000); // Simulating a delay of 2 seconds
    let question = questions[reply];
    reply = reply == 0 ? 1 : 0;
    return question;

}

// Mock function to check an answer
export async function qs_checkAnswer(qid, answer) {
    await delay(2000); // Simulating a delay of 2 seconds

    // Mock answer validation
    const correctAnswers = {
        1: "Paris",
    };

    console.log('correctAnswers[qid]',correctAnswers[qid],answer)

    return correctAnswers[qid] && correctAnswers[qid].toLowerCase() === answer.toLowerCase() ? 100 : 0;
}
