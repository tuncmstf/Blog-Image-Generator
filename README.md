# Blog Image Generator

![Blog Image Generator](https://img.shields.io/badge/Status-Active-success)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow)
![HTML5](https://img.shields.io/badge/HTML-5-orange)
![CSS3](https://img.shields.io/badge/CSS-3-blue)

Blog Image Generator is a powerful, client-side web application designed to create stunning, highly-customized header and cover images for blog posts. With built-in AI image generation capabilities and an intuitive drag-and-drop text/logo editor, it streamlines the visual content creation process for bloggers and content creators.

## 🚀 Features

* **AI-Powered Background Generation:** Seamlessly generate custom background images directly within the app using text prompts.
* **Manual Upload Support:** Alternatively, upload your own local images to use as the base canvas.
* **Advanced Text Overlay:**
  * Add multiple text layers.
  * Customize font size, color, and alignment.
  * Interactive drag-and-drop positioning on the canvas.
  * Automatic text wrapping for long titles.
* **Branding & Logo Placement:**
  * Upload a custom logo and scale it to fit.
  * Snap logo to corners or freely drag it around.
  * Add customizable background colors, padding, and border-radius to the logo.
* **High-Performance Export:** Export the final composition instantly as an optimized `.webp` or `.avif` file without losing quality, ideal for modern SEO and fast page loads.
* **Client-Side Processing:** All image composition and rendering happens directly in your browser using the HTML5 Canvas API. No backend required!

## 🧠 AI Integration

This project integrates the **Google Gemini API** for image generation. Specifically, it utilizes the `gemini-2.5-flash-image` model to rapidly generate 16:9 aspect ratio images based on user prompts.

* **Model:** `gemini-2.5-flash-image`
* **Features:** Fast generation, high-quality output, prompt-based creation.
* **Security:** API keys are stored locally in the user's browser `localStorage` and are never sent to any external server other than Google's secure API endpoints.

## 🛠️ Technologies Used

* **HTML5:** Semantic structure and the powerful `<canvas>` element for image rendering.
* **CSS3:** Modern, responsive styling with a dark/light aesthetic (utilizing Inter font).
* **Vanilla JavaScript (ES6+):** Complete logic handling, event listening, and API communication without heavy frameworks.

## 💻 How to Use

Since this is a client-side application, running it is incredibly simple:

1. Clone the repository:
   ```bash
   git clone https://github.com/tuncmstf/Blog-Image-Generator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Blog-Image-Generator
   ```
3. Open `index.html` in your preferred modern web browser.
   *(Optional: You can use a local server like Live Server in VS Code for a better development experience).*

### Generating via AI:
1. Go to the "Yapay Zeka (AI)" tab.
2. Enter your Google Gemini API Key and click "Kaydet" (Save).
3. Type your prompt into the text area.
4. Click "Üret" (Generate) and wait for the image to appear on the canvas.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is open-source and available for personal or commercial use.
