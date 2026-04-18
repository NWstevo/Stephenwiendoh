const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const statNumbers = document.querySelectorAll(".stat-number");
const newsletterForm = document.querySelector(".newsletter-form");
const newsletterEmail = document.querySelector("#newsletter-email");
const newsletterMessage = document.querySelector("#newsletter-message");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeaderState() {
    if (!header) {
        return;
    }

    header.classList.toggle("is-compact", window.scrollY > 24);
}

function closeMenu() {
    if (!menuToggle || !siteNav) {
        return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
}

function toggleMenu() {
    if (!menuToggle || !siteNav) {
        return;
    }

    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
}

function animateCounter(element) {
    const target = Number(element.dataset.target || "0");
    const duration = 1600;
    const start = performance.now();

    if (!target) {
        element.textContent = "0";
        return;
    }

    function updateCounter(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * eased);

        element.textContent = new Intl.NumberFormat("en-US").format(current);

        if (progress < 1) {
            window.requestAnimationFrame(updateCounter);
        } else {
            element.textContent = new Intl.NumberFormat("en-US").format(target);
        }
    }

    window.requestAnimationFrame(updateCounter);
}

function setupRevealObserver() {
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        statNumbers.forEach((stat) => {
            stat.textContent = new Intl.NumberFormat("en-US").format(Number(stat.dataset.target || "0"));
        });
        return;
    }

    const seenCounters = new WeakSet();
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");

            if (entry.target.classList.contains("stat-number") && !seenCounters.has(entry.target)) {
                animateCounter(entry.target);
                seenCounters.add(entry.target);
            }

            currentObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px"
    });

    revealItems.forEach((item) => observer.observe(item));
    statNumbers.forEach((stat) => observer.observe(stat));
}

function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function setFormMessage(message, state) {
    if (!newsletterMessage) {
        return;
    }

    newsletterMessage.textContent = message;
    newsletterMessage.classList.remove("is-error", "is-success");

    if (state) {
        newsletterMessage.classList.add(state);
    }
}

if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
}

navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
        closeMenu();
    }
});

if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailValue = newsletterEmail.value.trim();

        if (!emailValue) {
            setFormMessage("Please enter your email address.", "is-error");
            newsletterEmail.focus();
            return;
        }

        if (!validateEmail(emailValue)) {
            setFormMessage("Please enter a valid email address.", "is-error");
            newsletterEmail.focus();
            return;
        }

        setFormMessage("Thank you. You are subscribed for ministry updates.", "is-success");
        newsletterForm.reset();
    });
}

setHeaderState();
setupRevealObserver();
