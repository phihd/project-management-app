This is an instruction for window developers.

### Step 1: Create a new branch from with configs for windows
```bash
git checkout for-windows-dev
git checkout -b <new_branch_name>
```

### Step 2: Set up environment variables
```bash
$env:DEV_MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/devProjectApp?retryWrites=true&w=majority'
$env:TEST_MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/testProjectApp?retryWrites=true&w=majority'
$env:MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/ProjectApp?retryWrites=true&w=majority'
$env:PORT='3003'
$env:SECRET='<secret>'
```

### Step 3: Run the app on your local machine
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

### Step 4: Before create a pull request, adjust to configs for linux
- In `./backend/package.json`: In "scripts", append "cross-env" to each every "NODE_ENV".
- In `./frontend/.eslintrc.js`: In "linebreak-style", change "windows" to "unix".
