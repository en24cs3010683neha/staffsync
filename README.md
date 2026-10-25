# StaffSync - Modern HR Management (MERN)

HR, Manager aur Employee roles ke saath HRM web app: employee records, leave approval, attendance, announcements, training.

## Tech
MongoDB, Express, React (Vite), Node.js, JWT, Bootstrap

## Run karne ke steps
### 1. Backend
```
cd backend
npm install
npm run seed      # demo users banata hai (ek baar)
npm run dev       # http://localhost:5000
```
`backend/.env` me `MONGO_URI` set hai (local MongoDB). Atlas use karna ho to wahi string daalo.

### 2. Frontend (naya terminal)
```
cd frontend
npm install
npm run dev       # http://localhost:5173
```

## Demo login (password: 123456)
- hr@test.com
- manager@test.com
- employee@test.com

## Role-wise features
- **HR**: employees add/delete, sab leaves approve/reject, sab attendance, announcements post/delete
- **Manager**: team ke leaves approve/reject, team attendance, training create/assign
- **Employee**: leave apply, attendance check-in/out, profile edit, announcements aur assigned training dekhna

## Links
- Demo: (deploy ke baad add karo)
- GitHub: (apna repo link)
