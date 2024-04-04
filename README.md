Step 1: Clone the project from repo
```bash
git clone git@github.com:phihd/project-management-app.git
```

Step 2: Run app on a local machine
```bash
cd backend/
npm install # run only once
$env:DEV_MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/devProjectApp?retryWrites=true&w=majority'
$env:PORT='3003'
$env:SECRET='cahop'
npm run dev
```
```bash
cd frontend/
npm install # run only once
npm start
```


