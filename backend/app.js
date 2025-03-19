import express from 'express';
import bodyParser from "body-parser";
import { qs_checkAnswer, qs_getQuestion } from "./qservicemock.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';



const app = express();
const server = http.createServer(app);

const Q_TIME_WINDOW = 60; // 60 seconds
const port = process.env.PORT || 3000;

// Stores the current question being asked
let currentQuestion = { time: new Date(), text: "", id: "" };
// Stores winners per question ID: { qid: { winners: [], maxScore: 0, time: Date } }
let winnersMap = {};

// Middleware
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.set('view engine', 'ejs');

// Enable CORS for Express HTTP routes
app.use(cors({
    origin: "http://localhost:5173", // Allow frontend
    methods: ["GET", "POST"],
}));

// Configure CORS for Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});


/**
 * WebSocket Connection - Users Join Their Own Room
 */
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Expect user to send their UID when they connect
    socket.on("register", (uid) => {
        if (uid) {
            socket.join(uid); // User joins a room named after their UID
            console.log(`User ${uid} joined their private room.`);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

/**
 * GET /question
 * Returns the current question.
 */
app.get('/question', async (req, res) => {
    console.log('Returning current question');
    res.status(200).json(currentQuestion);
});

/**
 * POST /submitanswer
 * Submits an answer and checks for winners.
 */
app.post('/submitanswer', async (req, res) => {
    try {
        console.log("req.body",req.body);
        const {uid, qid, answer} = req.body.query;

        if (!uid || !qid || !answer) {
            return res.status(400).json({error: "Missing required fields"});
        }

        if (!checkAnswerValidity(qid)) {
            console.log("Answer not valid");
            return res.status(400).json({error: "Invalid answer submission time"});
        }

        let answerScore = await qs_checkAnswer(qid, answer);
        if (!winnersMap[qid]) {
            winnersMap[qid] = {winners: [], maxScore: 0, time: new Date()};
        }

        // Update the winners list based on score
        if (answerScore > winnersMap[qid].maxScore) {
            winnersMap[qid].winners = [uid];
            winnersMap[qid].maxScore = answerScore;
        } else if (answerScore === winnersMap[qid].maxScore) {
            if (!winnersMap[qid].winners.includes(uid)) {
                winnersMap[qid].winners.push(uid);
            }
        }

        console.log(`Updated winners for Q${qid}:`, winnersMap[qid]);

        return res.status(200).json({success: true});
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({success: false});
    }
});

/**
 * Periodically sends the list of winners for expired questions.
 */
async function sendWinners() {
    const now = new Date();
    console.log("sendWinners",winnersMap);
    for (let qid in winnersMap) {
        const questionTime = new Date(winnersMap[qid].time);
        const timeDiff = (now.getTime() - questionTime.getTime()) / 1000;


        console.log("sendWinners timeDiff",timeDiff,qid);

        if (timeDiff >= Q_TIME_WINDOW) {
            console.log(`Notifying winners for Q ${qid}:`, winnersMap[qid].winners);

            // Send WebSocket notifications **only to the winners**
            winnersMap[qid].winners.forEach((winnerId) => {
                io.to(winnerId).emit("winnerUpdate", { qid, message: "🏆 You won!" });
            });

            delete winnersMap[qid]; // Free memory for old questions
        }
    }
}

/**
 * Fetches a new question from the question service and updates `currentQuestion`.
 */
async function getQuestion() {
    let question = await qs_getQuestion();
    if (!question || !question.id || !question.text) {
        console.error("Invalid question received.");
        return;
    }

    currentQuestion = {
        serviceId : question.id,
        id: uuidv4(), //do not count obn service question id..as it can be duplication..
        text: question.text,
        time: new Date(),
    };

    winnersMap[currentQuestion.id] = { winners: [], maxScore: 0, time: currentQuestion.time };

    io.emit("questionUpdate", currentQuestion); //send to all users

    console.log(`New question: ${currentQuestion.text} - ${currentQuestion.time.toISOString()}`);
}

/**
 * Validates whether an answer is submitted within the allowed time window.
 */
function checkAnswerValidity(qid) {
    console.log("checkAnswerValidity",qid,winnersMap);
    if (!winnersMap[qid]) return false; // Question doesn't exist

    console.log("checkAnswerValidity2",qid,winnersMap);
    let currentTime = new Date();
    let questionTime = new Date(winnersMap[qid].time);
    let timeDiff = (currentTime.getTime() - questionTime.getTime()) / 1000; // Convert to seconds
    return timeDiff < Q_TIME_WINDOW;
}

// Start periodic processes
console.log("Process started, running every 1 minute...");
setInterval(getQuestion, Q_TIME_WINDOW * 1000);
setInterval(sendWinners, Q_TIME_WINDOW * 1000);

// Fetch the first question on startup
(async () => {
    await getQuestion();
})();

// Start server with WebSocket support
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
