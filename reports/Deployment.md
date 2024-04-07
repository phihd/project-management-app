This is an instruction to run the app on your local machine.

### Step 1: Clone the project from repo
```bash
git clone git@github.com:phihd/project-management-app.git
```

### Step 2: Set up environment variables
```bash
echo 'MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/projectApp?retryWrites=true&w=majority' >> .env
echo 'DEV_MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/devProjectApp?retryWrites=true&w=majority' >> .env
echo 'TEST_MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/testProjectApp?retryWrites=true&w=majority' >> .env
echo 'PORT=3003' >> .env
echo 'SECRET=<secret>' >> .env
```

### Step 3: Run app locally
```bash
cd backend/
npm install # run only once
npm run dev
```
```bash
cd frontend/
npm install # run only once
npm start
```


