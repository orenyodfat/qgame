import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {BASE_URL, MOCK_USER_ID} from "./constants.js";
import {useSocket} from "./SocketProvider.jsx";
import {useCount} from "./CountProvider.jsx";


function GuessGame() {

    const [question, setQuestion] = useState(null); // ✅ Correct - store an object

    const answerRef = useRef(null);
    const socket = useSocket();
    const TIME_INTERVAL = 60 * 1000; // Fetch question every 60 seconds
    const count = useCount();

    console.log("count",count);

    // const factorial =useMemo(() => {
    //     console.log("Calculating factorial...");
    //     let result = 1;
    //     for (let i = 1; i <= count; i++) {
    //         result *= i;
    //     }
    //     return result;
    // },[count]); // ✅ Only recomputes when `number` changes

    useEffect(() => {
        if (!socket) return;

        // Listen for winner updates
        socket.on("winnerUpdate", (data) => {
            console.log("Winner announcement received:", data);
            alert(data.message)
            //setWinnerMessage(data.message); // Update winner message
        });

        socket.on("questionUpdate", (data) => {
            console.log("new question recieved:", data);
            setQuestion(data);
            //setWinnerMessage(data.message); // Update winner message
        });

        return () => {
            socket.off("winnerUpdate");
            socket.off("questionUpdate");
        };
    }, [socket]);

    const handleSubmitQuestion = async (e) => {
        try {
            //answerRef.current.focus();
            const response = await fetch(BASE_URL+"submitanswer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({query: { uid:MOCK_USER_ID,qid: question.id, answer: answerRef.current.value }}), // Convert object to JSON
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json(); // Get the response data
            console.log("Server response:", data);
        } catch (error) {
            console.error("Error submitting guess:", error);
        }

    }
    // useEffect(() => {
    //     const fetchQuestion = async () => {
    //         try {
    //             console.log("Fetching question...");
    //             const response = await fetch(BASE_URL + "question");
    //             console.error("response",response);
    //             if (!response.ok) {
    //                 //console.error(response);
    //                 throw new Error(`HTTP error! Status: ${response.status}`);
    //             }
    //
    //             const data = await response.json(); // Extract JSON data
    //
    //             setQuestion(data);
    //             console.log("Fetched question:", data);
    //         } catch (error) {
    //             console.error("Error fetching question:", error);
    //         }
    //     };
    //     console.log("Fetching question...");
    //     // Fetch immediately on mount
    //     fetchQuestion();
    //     // Set up interval to fetch every 60 seconds
    //     const intervalId = setInterval(fetchQuestion, TIME_INTERVAL);
    //
    //     return () => {
    //         console.log("Clearing interval...");
    //         clearInterval(intervalId); // Cleanup interval on unmount
    //     };
    // }, []);

    return (<div>
        <div>
        {question && (
            <div>
            {question.id}
            <h1>{question.text}</h1>
            </div>
        )}
        {/*<input value={answer} placeholder="answer..." onChange={(e) => setAnswer(e.target.value)} />*/}
            <input ref={answerRef} placeholder="answer..." />
        <button onClick={handleSubmitQuestion}>Submit</button>
            {/*<div>factorial {factorial}</div>*/}
        </div>
    </div>);

}

export default GuessGame;