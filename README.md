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
   - Migration-based schema management

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
   Copy the example configuration file and customize it for your environment:
   ```bash
   cp .env.example .env
   ```
   Then update the database configuration in `.env` with your specific settings.

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

### Docker Deployment

1. Build the Docker image using npm:
```bash
npm run docker:build
```

2. Start the container using npm:
```bash
npm run docker:run
```

3. Stop the container using npm:
```bash
npm run docker:stop
```

4. View container logs:
```bash
npm run docker:logs
```

The application will be available at `http://localhost:3001` when running in Docker.

### Environment Variables

The application requires several environment variables to run. Copy the `.env.example` file to `.env` and update the values as needed:

```bash
cp .env.example .env
```

Required variables in `.env.example`:
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: Database name
- `DB_PORT`: PostgreSQL port
- `DB_CONNECTION_URL`: Full database connection URL
- `API_PORT`: Port for the API server
- `ETH_NODE_URL`: Ethereum node URL (from Alchemy or Infura)
- `JWT_SECRET`: Secret key for JWT token generation

### Database Setup

The application uses TypeORM migrations for database management. Migrations are automatically run on application startup, ensuring your database is always in the correct state.

#### Initial Data

The application comes with a migration that seeds initial users:
- alice/alice
- bob/bob
- carol/carol
- dave/dave

These users are created with hashed passwords and can be used for testing.

## API Documentation

The API documentation is available through Swagger UI:

- Local development: `http://localhost:3000/api/document`
- Docker: `http://localhost:3001/api/document`

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

The test suite uses **Jest** for testing and mocking. The tests are written in TypeScript and follow the following structure:

- Unit tests: `src/**/*.spec.ts`
- E2E tests: `test/**/*.e2e-spec.ts`

The test suite covers:
- Service level functionality
- RLP decoding
- Database operations
- JWT token generation and validation
