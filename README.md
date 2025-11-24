# ebebek Product Carousel

A lightweight, responsive product carousel built with HTML, CSS, and vanilla JavaScript, inspired by real-world e-commerce components.
The carousel dynamically fetches product data, caches results in localStorage, and provides a smooth sliding UX optimized for modern browsers.

This project was created to practice DOM manipulation, API-like data fetching, caching strategies, and pixel-perfect UI development.

## 🚀 Features

* Dynamic product loading from ```data.json```
* ```localStorage``` caching to reduce repeated fetches
* Arrow-based navigation
* Pixel-perfect design following typical e-commerce carousels
* Simple, dependency-free setup (pure JS!)
  
## 📸 Preview
<img width="1804" height="590" alt="ebebek" src="https://github.com/user-attachments/assets/e99ab32a-fe51-49e9-974c-862113ef7b84" />


## ⚙️ How It Works
### 1. Data Fetching
```script.js``` fetches product data from ```data.json```. <br>
If the data exists in ```localStorage```, it loads from cache instead.
### 2. Rendering
The carousel is generated dynamically using JavaScript—no hardcoded product markup.
### 3. Navigation
Left/right arrows shift the carousel using CSS transforms.

## ▶️ Run Locally

**1. Clone the repository:**
   ```bash
   git clone https://github.com/nursenataskiran/ebebek-product-carousel.git
```
**2. Navigate into the project folder:**
   ```bash
   cd ebebek-product-carousel
```
**3. Open the project files in your editor.**
**4.** Since this project does not include an HTML file and was built as a DOM manipulation practice,
you can run the code manually using a browser console:
* Open any blank browser tab
* Open **Developer Tools → Console**
* Copy the contents of ```script.js``` and paste it into the console
* Press Enter to execute <br>

The carousel structure will be created dynamically and can be inspected directly from the console.




