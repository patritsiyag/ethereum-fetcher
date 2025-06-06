import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export const authenticateApiOperation = ApiOperation({
  summary: 'Authenticate user',
  description: 'Authenticates a user and returns a JWT token',
});

export const authenticateApiBody = ApiBody({
  schema: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        example: 'alice',
        description: 'Username for authentication',
      },
      password: {
        type: 'string',
        example: 'alice',
        description: 'Password for authentication',
      },
    },
    required: ['username', 'password'],
  },
});

export const authenticateApiResponse = ApiResponse({
  status: 200,
  description: 'Successfully authenticated',
  schema: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT token for authentication',
      },
    },
  },
});

export const authenticateApiResponse401 = ApiResponse({
  status: 401,
  description: 'Invalid credentials',
  schema: {
    type: 'object',
    properties: {
      statusCode: {
        type: 'number',
        example: 401,
      },
      message: {
        type: 'string',
        example: 'Invalid credentials',
      },
    },
  },
});

export const authenticateApiResponse500 = ApiResponse({
  status: 500,
  description: 'Internal server error',
  schema: {
    type: 'object',
    properties: {
      statusCode: {
        type: 'number',
        example: 500,
      },
      message: {
        type: 'string',
        example: 'Failed to authenticate user',
      },
    },
  },
});
