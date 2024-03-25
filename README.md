# Pettycash Manager Backend

## Description

This is the backend for the Pettycash Manager application. It is built using Node.js, Express, and MongoDB.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- MongoDB

### Installing

1. Clone the repository:

```bash
git clone https://github.com/LoordhuJeyakumar/pettycash-manager-be.git
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

For development, you can use:

```bash
npm run dev
```


## **URLs**

## [Render Deployed URL 👈 ](https://pettycash-manager-be.onrender.com)

```
https://pettycash-manager-be.onrender.com
```

## [Github repository URL 👈](https://github.com/LoordhuJeyakumar/pettycash-manager-be)

```
https://github.com/LoordhuJeyakumar/pettycash-manager-be
```

## Base URL

All API endpoints are accessible at the following base URL:

https://pettycash-manager-be.onrender.com/api/v1

## API Endpoints

The application provides several API endpoints:

Base route
`/api/v1`

### User Routes

`/user`: Handles user-related operations such as signup, login, and user details retrieval and update.

- `POST /api/v1/user/signup`: Register a new user.
- `POST /api/v1/user/verify`: Verify a user’s token.
- `POST /api/v1/user/login`: Log in a user.
- `GET /api/v1/user/managers`: Get all managers.
- `POST /api/v1/user/sendVerificationEmail`: Send a verification email to a user.
- `GET /api/v1/user/:id`: Get a user’s details.
- `PUT /api/v1/user/update/:id`: Update a user’s details.
- `POST /api/v1/user/changePassword/:id`: Change a user’s password.
- `POST /api/v1/user/deactivate/:id`: Deactivate a user.
- `POST /api/v1/user/delete/:id`: Delete a user.

### Account Routes

`/account`: Handles account-related operations such as account creation, retrieval, update, and deletion.

- `POST /api/v1/account/create`: Create a new account.
- `GET /api/v1/account`: Get all accounts.
- `GET /api/v1/account/:id`: Get an account by ID.
- `PUT /api/v1/account/update/:id`: Update an account.
- `DELETE /api/v1/account/delete/:id`: Delete an account.

### Transaction Routes

`/transaction`: Handles transaction-related operations such as transaction creation and retrieval of transactions for the current and previous month.

- `POST /api/v1/transaction/create`: Create a new transaction.
- `GET /api/v1/transaction/currentMonth/:type`: Get current month’s transactions.
- `GET /api/v1/transaction/previousMonth/:type`: Get previous month’s transactions.
- `GET /api/v1/transaction`: Get all transactions.

### Cash Request Routes

`/cashRequest`: Handles cash request-related operations such as cash request creation, approval, rejection, and retrieval of all cash requests and pending requests.

- `POST /api/v1/cashRequest/create`: Create a new cash request.
- `POST /api/v1/cashRequest/approve`: Approve a cash request.
- `POST /api/v1/cashRequest/reject`: Reject a cash request.
- `GET /api/v1/cashRequest/pending`: Get all pending cash requests.
- `GET /api/v1/cashRequest/documents/:id`: Get documents for a cash request.
- `GET /api/v1/cashRequest/download/:id`: Download a cash request.
- `GET /api/v1/cashRequest`: Get all cash requests.

## Error Handling

The application includes a middleware for handling unknown endpoints:

```js
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
```

This will send a 404 error for any requests that do not match the defined routes.

## Middleware

The application uses a custom middleware for authentication. The middleware verifies the access token in the request headers and attaches the user ID to the request object if the token is valid.

## Dependencies

The application uses several npm packages:

- `express`: For creating the server and handling HTTP requests and responses.
- `cors`: For handling Cross-Origin Resource Sharing.
- `jsonwebtoken`: For creating and verifying JSON Web Tokens for user authentication.
- `mongoose`: For modeling and mapping MongoDB data to javascript.
- `multer`: For handling multipart/form-data, primarily used for uploading files.
- `bcrypt`: For hashing passwords.
- `nodemailer`: For sending emails.
- `dotenv`: For managing environment variables.
- `archiver`: For archiving and extracting zip files.
- `nodemon`: For automatically restarting the server whenever file changes are detected in the directory.

## Contributing

Contributions are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC license.

## Deployment

This project can be deployed using any servers that support Node.js.

## Authors

- **Loordhu Jeyakumar** - _Initial work_ - LoordhuJeyakumar
