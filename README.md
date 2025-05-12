# Ethereum Transaction Fetcher API

A REST API server that fetches and stores Ethereum transaction information. The service provides endpoints to retrieve transaction details by their hashes and maintains a database of previously fetched transactions.

## Architecture

### C4 Model Diagrams

#### Level 1: System Context
```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Client Apps   +---->+  ETH Fetcher   +---->+  Ethereum Node |
|                |     |    Service     |     |                |
+----------------+     +----------------+     +----------------+
                              |
                              v
                       +----------------+
                       |                |
                       |  PostgreSQL DB |
                       |                |
                       +----------------+
```

#### Level 2: Container
```
+------------------------------------------------------------------+
|                         ETH Fetcher Service                       |
|                                                                  |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|  |  Auth       |  |  ETH        |  | Transaction |  | Health   | |
|  |  Module     |  |  Module     |  | Module      |  | Module   | |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|                                                                  |
|  +-------------+  +-------------+  +-------------+               |
|  |  User       |  |  All        |  | My          |               |
|  |  Module     |  |  Module     |  | Module      |               |
|  +-------------+  +-------------+  +-------------+               |
+------------------------------------------------------------------+
```

### Design Decisions

1. **Modular Architecture**
   - Each feature is encapsulated in its own module
   - Clear separation of concerns
   - Easy to maintain and extend

2. **Database Choice: PostgreSQL**
   - ACID compliance for transaction data
   - JSON support for flexible schema

3. **Authentication: JWT**
   - Stateless authentication
   - Scalable across multiple instances
   - Industry standard security

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Ethereum node URL (from Infura or Alchemy)

### Database Setup

1. **Install PostgreSQL**:
   ```bash
   # For macOS:
   brew install postgresql
   brew services start postgresql

   # For Windows:
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   # Create a new database
   createdb ethereum_fetcher
   ```

3. **Configure Database Connection**:
   In your `.env` file, set the database connection URL:
   ```env
   DB_CONNECTION_URL=postgresql://username:password@localhost:5432/ethereum_fetcher
   ```
   Replace `username` and `password` with your PostgreSQL credentials.

### Environment Variables

Create a `.env` file in the root directory:

```env
API_PORT=3000
ETH_NODE_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
DB_CONNECTION_URL=postgresql://username:password@localhost:5432/ethereum_fetcher
JWT_SECRET=your-secret-key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment configuration template:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm run start:dev
   ```

## API Documentation

### 1. Get Transaction Information
`GET /lime/eth?transactionHashes`

Fetches information for specified Ethereum transactions.

**Query Parameters:**
- `transactionHashes`: List of transaction hash strings

**Optional Headers:**
- `AUTH_TOKEN`: JWT token for user tracking

**Example Request:**
```bash
curl -X GET "http://localhost:3000/lime/eth?transactionHashes=0x123...&transactionHashes=0x456..."
```

**Example Response:**
```json
{
    "transactions": [
        {
            "transactionHash": "0x123...",
            "transactionStatus": 1,
            "blockHash": "0xabc...",
            "blockNumber": 12345678,
            "from": "0xdef...",
            "to": "0xghi...",
            "contractAddress": null,
            "logsCount": 2,
            "input": "0x...",
            "value": "1000000000000000000"
        }
    ]
}
```

### 2. Get All Transactions
`GET /lime/all`

Retrieves all transactions stored in the database.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/lime/all"
```

### 3. Get User's Transactions
`GET /lime/my`

Retrieves all transactions previously requested by the authenticated user.

**Headers:**
- `AUTH_TOKEN`: JWT token (required)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/lime/my" \
     -H "AUTH_TOKEN: your.jwt.token"
```

### 4. Authenticate User
`POST /lime/authenticate`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
    "username": "alice",
    "password": "alice"
}
```

**Example Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Testing

Run the test suite:
```bash
npm test
```

> **Note:** The test suite uses **Jest** (not Mocha as in the original requirements).

The test suite covers:
- Service level functionality
- RLP decoding
- Database operations
- JWT token generation and validation


## Areas for Improvement

1. **Repository Pattern**
   - Refactor the architecture to use repositories for better separation of concerns and testability.
2. **Testing Framework**
   - The requirements mention Mocha, but the project uses Jest. Consider aligning documentation and scripts, or migrating if needed.
3. **DTOs and Entities**
   - Improve the structure and validation of DTOs and entities for better maintainability and type safety.
4. **Dockerization**
   - Enhance the Docker setup for multi-stage builds, environment variable management, and production readiness.
5. **Error Handling**
   - Implement more robust error handling and validation throughout the API.
6. **API Documentation**
   - Add OpenAPI/Swagger documentation for easier client integration.
7. **Health Module Enhancement**
   - Implement comprehensive health checks for all endpoints
   - Monitor database connection status
   - Track API endpoint response times
   - Add custom health indicators for critical services
