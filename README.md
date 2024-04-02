Step 1: Clone the project from repo
```bash
git clone git@github.com:phihd/project-management-app.git
```

Step 2: Run app on a local machine
```bash
cd backend/
npm install # run only once
echo 'MONGODB_URI=mongodb+srv://phihd:khongten@cluster0.vwz1m.mongodb.net/projectApp?retryWrites=true&w=majority' >> .env
echo 'DEV_MONGODB_URI=mongodb+srv://phihd:khongten@cluster0.vwz1m.mongodb.net/devProjectApp?retryWrites=true&w=majority' >> .env
echo 'TEST_MONGODB_URI=mongodb+srv://phihd:khongten@cluster0.vwz1m.mongodb.net/testProjectApp?retryWrites=true&w=majority' >> .env
echo 'PORT=3003' >> .env
echo 'SECRET=cahop' >> .env
npm run dev
```
```bash
cd frontend/
npm install # run only once
npm start
```


