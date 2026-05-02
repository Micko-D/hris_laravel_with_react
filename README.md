# hris_laravel_with_react
Design and develop a comprehensive Human Resource Information System (HRIS) tailored for companies operating in the Philippines.

# 🚀 Installation Guide

This project uses **Laravel + Inertia + React (Vite)** and is best run using **Laravel Herd** for a smooth local development experience.

---

## 🐘 Prerequisites

Before you begin, install:

* Laravel Herd (includes PHP, Composer, and more)
* Node.js (>= 18) and npm
* A database (MySQL, PostgreSQL, etc.)

---

## 📥 Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

## ⚙️ Install Dependencies

Install PHP dependencies:

```bash
composer install
```

Install JavaScript dependencies:

```bash
npm install
```

---

## 🔑 Environment Setup

Copy the environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

---

## 🗄️ Database Configuration

Update your `.env` file with your database credentials:

```
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Run migrations:

```bash
php artisan migrate
```

---

## 🔗 Storage Link

```bash
php artisan storage:link
```

---

## ▶️ Running the Application

### Using Laravel Herd

* Place your project inside your Herd directory (usually `~/Herd`)
* Herd will automatically serve your project

Your app will be available at:

```
http://your-project-name.test
```

---

### Start Vite (Frontend)

```bash
npm run dev
```

---

## 🏗️ Build for Production

```bash
npm run build
```

---

## ❗ Troubleshooting

* Make sure Laravel Herd is running
* Ensure your database server is active
* If you encounter permission issues, check `storage/` and `bootstrap/cache/`

---

## 📌 Notes

* Do NOT commit your `.env` file
* `node_modules/` and `vendor/` are ignored via `.gitignore`
* Use `.env.example` as your configuration template

---

Happy coding! 🎉
