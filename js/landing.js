// ============================================
// EquiRed - Landing Page Animations
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initCounters();
});

// ---- Animación de contadores ----
function initCounters() {
    const counters = document.querySelectorAll('.stat-card__number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = performance.now();
    
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        
        element.textContent = current.toLocaleString('es-ES');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Agregar "+" al final
            element.textContent = target.toLocaleString('es-ES') + '+';
        }
    }
    
    requestAnimationFrame(update);
}
