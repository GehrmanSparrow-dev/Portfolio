/* ==========================================================================
   Surya Teja Anupindi - Mitchell Sparrow Style Interactivity Engine (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initSmoothScroll();
    initContactForm();
});

/* ==========================================================================
   1. Typewriter Animation Engine
   ========================================================================== */
function initTypewriter() {
    const textElement = document.getElementById('typewriter-text');
    if (!textElement) return;

    const phrases = [
        "Hi, The Name's Surya Teja Anupindi",
        "Guy-who-loves-Deep-Learning.py",
        "<BuildingStatefulAgenticSystems />",
        "Serving-Mistral-at-vLLM-AWQ",
        "ML-Engineer-Intern-at-Winaxis"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 45;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 90;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause at end of word
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/* ==========================================================================
   2. Smooth Scroll Navigation within Container
   ========================================================================== */
function initSmoothScroll() {
    const container = document.querySelector('.portfolio-container');
    if (!container) return;

    // Handle clicks on internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ==========================================================================
   3. Contact Form Submission Handler
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const feedback = document.getElementById('contact-feedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.contact-submit-btn');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.textContent = 'Sent!';
            feedback.classList.add('show');
            form.reset();

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                feedback.classList.remove('show');
            }, 4500);
        }, 800);
    });
}
