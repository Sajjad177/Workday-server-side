## 📜 Project Overview :

- **Project Concept** : By using the server, we can keep a lot of necessary information in one place and use it as needed.
- **Problem Solved** : Data server completes a website by storing information and making it user friendly.


---

## 🌟 Features

### User Authentication and Authorization :
- **Secure** login and role-based access control for administrators and employees.

### Data Management :
- **Data** is managed through CRUD operations

### Payment :
- **Stripe** has been used for payment through which payment can be made easily.

---

## 🛠 Technology Used : 
**JWT**, **Stripe**, **MongoDB**

<br/>

## How to Clone and Run the Project Locally : 

1. **Clone the repository:**
   - First, you need to clone the **client** and **server side**. Open your terminal and type:
     ```bash
     git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
     ```
2. **Open files in VS Code:**
   - After opening the **server-side** files in VS Code, install npm dependencies both file:
     ```bash
     npm install
     ```
3. **Environment setup:**
   - In your server side configure environment variables by creating a `.env` file in the root directory. Add the following variables:
     ```plaintext
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/art_and_craft_db
     JWT_SECRET=your_jwt_secret_key_here
     ```
     Replace `your_jwt_secret_key_here` with your actual keys.
4. **Access the server :**
   - run code is `nodemon index.js ` or `npm run dev` and also check which file are you now. 
   - Open your web browser and navigate to `http://localhost:3000` to view the application locally.
