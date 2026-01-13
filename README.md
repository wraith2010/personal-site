# 1031F - Dark Portfolio Website

A modern, dark-themed artist portfolio website featuring smooth animations, responsive design, and semantic HTML5 structure.

## 🎨 Features

### Design
- **Dark Theme**: Professional dark color palette optimized for readability
- **Smooth Animations**: Fade-in effects, hover states, and transitions
- **Responsive Layout**: Fully responsive from mobile to desktop
- **Modern Typography**: Clean, readable font hierarchy
- **Glassmorphism Effects**: Subtle blur and transparency effects

### Interactive Elements
- **Image Lightbox**: Click gallery images to view in fullscreen with navigation
- **Smooth Scrolling**: Enhanced scroll behavior throughout
- **Header Effects**: Dynamic header styling on scroll
- **Hover States**: Engaging hover effects on all interactive elements
- **Keyboard Navigation**: Full keyboard support in lightbox (←, →, Esc)

### Technical
- **Semantic HTML5**: Proper use of semantic tags (header, nav, main, article, section, footer)
- **CSS Custom Properties**: Easy theme customization via CSS variables
- **Vanilla JavaScript**: No dependencies, pure JavaScript
- **Accessibility**: ARIA labels, focus states, and reduced motion support
- **Performance**: Lazy loading, debounced scroll events

## 📁 File Structure

```
your-website/
├── index.html          # Home page
├── software.html       # Software projects page
├── builds.html         # Physical builds page
├── random.html         # Random projects page
├── resume.html         # Resume/CV page
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # Main JavaScript file
└── img/                # Your existing images folder
```

## 🚀 Installation

1. **Replace your CSS files** with the new `style.css`:
   - Place `style.css` in your `css/` folder
   - The new CSS replaces: main.css, header.css, index.css, resume.css, software.css

2. **Add the JavaScript file**:
   - Create a `js/` folder if it doesn't exist
   - Place `main.js` in the `js/` folder

3. **Update your HTML files**:
   - Replace all `.html` files with the new versions
   - Keep your existing `img/` folder structure intact

## 🎨 Customization

### Colors
Edit the CSS variables in `style.css` under `:root`:

```css
:root {
    --color-bg-primary: #0a0e17;      /* Main background */
    --color-accent-primary: #01baef;   /* Primary accent (cyan) */
    --color-accent-secondary: #f04208; /* Secondary accent (orange) */
    /* ... more variables ... */
}
```

### Typography
Change fonts by updating:
```css
--font-primary: -apple-system, BlinkMacSystemFont, ...;
--font-display: 'Georgia', serif;
```

### Spacing & Layout
Adjust spacing scale:
```css
--spacing-xs: 0.5rem;
--spacing-sm: 1rem;
/* ... etc ... */
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 769px - 1024px
- **Desktop**: > 1024px

## ✨ Key Features Explained

### Image Lightbox
- Click any image in a `.gallery` to open lightbox
- Navigate with arrow buttons or keyboard (← →)
- Close with X button or Esc key
- Shows image counter (e.g., "3 / 8")

### Project Cards
- Hover to see lift effect
- Images zoom on hover
- Smooth color transitions
- Expandable details sections

### Navigation
- Sticky header with scroll effects
- Active page highlighting
- Smooth scroll to anchors
- Responsive mobile menu layout

## 🔧 Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile browsers: ✅ iOS Safari, Chrome Mobile

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible indicators
- Reduced motion media query support
- Alt text on images

## 📝 Notes

- All your existing images and folder structure remain unchanged
- The `css/` folder now only needs `style.css`
- Make sure to create the `js/` folder for `main.js`
- PDF resume embed works on modern browsers

## 🐛 Troubleshooting

**Images not showing?**
- Check that image paths in HTML match your folder structure
- Verify `img/` folder is in the root directory

**JavaScript not working?**
- Ensure `main.js` is in the `js/` folder
- Check browser console for errors
- Verify the script tag in HTML: `<script src="js/main.js"></script>`

**Styling looks wrong?**
- Clear browser cache
- Check that `style.css` is in the `css/` folder
- Verify the link tag: `<link rel="stylesheet" href="css/style.css">`

## 📄 License

This is your personal portfolio website. Feel free to customize as needed!

## 🎯 Future Enhancements

Consider adding:
- Blog section
- Contact form
- Dark/light theme toggle
- Project filters/search
- Animation options panel
- More gallery layouts

---

Built with ❤️ using pure HTML5, CSS3, and JavaScript
