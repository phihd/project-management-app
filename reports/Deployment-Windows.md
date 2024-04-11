This is an instruction for window developers.

### Step 1: Clone the project from repo
```bash
git clone git@github.com:phihd/project-management-app.git
```

### Step 2: Create a new branch
```bash
git checkout -b <new_branch_name>
```

### Step 3: Modify the config for windows
- In `./backend/package.json`: In "scripts", add "cross-env" to each "NODE_ENV".
- In `./frontend/.eslintrc.js`: In "linebreak-style", change "unix" to "windows".

### Step 4: Set up environment variables
```bash
$env:DEV_MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/devProjectApp?retryWrites=true&w=majority'
$env:TEST_MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/testProjectApp?retryWrites=true&w=majority'
$env:MONGODB_URI='mongodb+srv://<username>:<password>@cluster0.vwz1m.mongodb.net/ProjectApp?retryWrites=true&w=majority'
$env:PORT='3003'
$env:SECRET='<secret>'
```

### Step 5: Run the app on your local machine
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

### Step 6: Before create a pull request, adjust to configs for linux
- In `./backend/package.json`: In "scripts", delete all "cross-env".
- In `./frontend/.eslintrc.js`: In "linebreak-style", change "windows" to "unix".
