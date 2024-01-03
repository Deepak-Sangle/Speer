# Speer Assesment

## Tools and Technologies Used

- NodeJs
- ExpressJs
- MongoDb
- Express-Rate-Limit
- Json Web Token
- BcryptJs
  
## Installation

- Add the .env file that I have shared via Google Form in the root directory. The env file contains two key value pairs namely <strong>MONGOURI</strong> and <strong>JWT_SECRET</strong>.

- To install all the dependencies, run
``` 
  npm install
```
- To run the backend server
```
  npx nodemon app
```

## Assumptions/Functionalities

- The user can only view the notes that they have created or the notes that have been shared to them.
- The user can only update or delete the notes that they have created.
- The user can only share the notes that they can see.
- The keywords searching is based on MongoDb $text search.
- Users can do any of these operations only after they have been authenticated. 
- The rate limiter has been set at 5 requests per seconds. One can increase the time window to test it manually.
- The authentication is based on json-web-token library and passwords are hashed using bcryptjs.
