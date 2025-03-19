# Real-Time Quiz Game


This is a real-time quiz game where:

A new question is shown every 60 seconds.
Users submit answers and receive scores.
The highest-scoring players win after the time window closes.
Winners are announced automatically for their winning.

# Features 
- A new question every minute
- Users can submit answers
- Only the winners get notified via WebSockets
- Real-time updates

# How Winners Are Determined
1️⃣ Users submit answers before the time runs out.
2️⃣ The highest score wins.
3️⃣ If multiple users have the same score, they all win.
4️⃣ Winners receive a WebSocket notification in real-time.

# How to install 

## server 
```cd backend```

```yarn install```

start the server:

```node app.js```

## frontend 

```cd frontend```

```yarn install```

start the react app on your local machine:

```yarn dev```


# API Endpoints for the Real-Time Quiz Game
## Get the Current Question

Method: GET

Endpoint: /question

Description: Returns the current question being asked.

Request Body: ❌ None

## Submit an answer

Method: POST

Endpoint: /submitanswer

Description: Submits an answer for the current question.

## WebSocket Events
### Register User

Event Name: register

Direction: Client ➡️ Server

Description: Registers a user with their unique identifier (UID) to establish a private communication channel.

Example: ```socket.emit('register', 'user123');```

### Question Update

Event Name: questionUpdate

Direction: Server ➡️ All Clients

Description: Emitted when a new quiz question becomes active. Clients should update their interface accordingly.

Example: ```socket.on('questionUpdate', (question) => {
    console.log(question.id, question.text);
});```

# How to Scale the Real-Time Quiz Game?

> **Note:** The current implementation is not designed for scalability and does not take into account the challenges of handling high concurrency or distributed environments. As it stands, the system relies on in-memory storage (winnersMap), processes winners synchronously, and operates as a single-instance WebSocket server, which limits its ability to scale efficiently. To support a large number of concurrent users (e.g., 100,000+), significant architectural improvements are needed, including distributed WebSocket handling, database optimizations, caching mechanisms, and asynchronous processing.


## Scale WebSocket Connections (Multiple Servers)

Problem: A single Node.js server can handle limited WebSocket connections before performance degrades.
Solution: Use Redis Pub/Sub with multiple WebSocket servers
- WebSockets don’t naturally support multi-server scaling.
- Redis Pub/Sub helps synchronize messages across multiple servers.

This allows WebSockets to scale horizontally across multiple instances.
Ensures winners get notified regardless of which server they are connected to.

## Load Balancing & Multi-Core Utilization
Problem: Node.js is single-threaded, meaning one process handles all WebSocket connections.

Solution: Use PM2 & Nginx Load Balancer

- PM2 Cluster Mode runs multiple Node.js instances on the same machine. 
- Load Balancer distributes traffic across multiple servers.

## Store Game Data in a Database (Persistence & Performance)

Problem: The current implementation stores winners & questions in memory, meaning:
- Data is lost when the server restarts.
- It doesn’t scale beyond one machine.
- Might lead to overruns due to concurrent writes (in some edge cases)

Solution: Use MongoDB for storage & Redis for caching

MongoDB stores questions & winners persistently.
Redis caches active questions for fast reads.
A database (or Redis) provides a single source of truth accessible to all processes.
Ensures consistency: The question and winners are the same across every instance.

This ensures persistence even if the server crashes and scales efficiently across multiple servers.

## Improve Performance with Redis Caching

Problem: Frequent database queries slow down response times.

Solution: Cache active questions in Redis

Store the current question in Redis instead of fetching from MongoDB every time.

- Reduces database load and speeds up response time.
- Scales to handle thousands of requests per second.

## Use API Gateway for trafic management

## Use a Background Worker for Winner Processing
Problem: sendWinners() runs inside the WebSocket server, which:

- Blocks real-time communication while processing winners.
  
- Slows down the server when many users win at the same time.

Solution: Move winner processing to a background worker (RabbitMQ/Kafka).

Idea: Move heavy or potentially time-consuming tasks to a separate process:

Main Server (WebSocket/Express):

- Receives new data (e.g., question expiry).
- Enqueues a message { winnersMapSlice, qid } to RabbitMQ (or Kafka, SQS, etc.).
- Immediately returns, staying responsive to other requests.

Worker Process:

Listens to the queue.
Processes the message (e.g., loops over winners, calculates scores, sends winner notifications).
Emits WebSocket updates (if needed, it might connect to the same Redis or Socket.io server).
The main server remains free to handle incoming traffic.

Result: The main Node.js process never blocks on intense winner processing.
