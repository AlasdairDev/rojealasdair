/* ── Intersection reveal ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { 
        e.target.classList.add('in'); 
        io.unobserve(e.target); 
    }
  });
}, { threshold: 0.06 });

document.querySelectorAll('.r').forEach(el => io.observe(el));

/* ── Nav scroll with offset ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    
    const target = document.getElementById(id);
    if (!target) return;
    
    e.preventDefault();
    const navH = document.querySelector('nav').getBoundingClientRect().height;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    
    window.scrollTo({ top, behavior: 'smooth' });
  });
});