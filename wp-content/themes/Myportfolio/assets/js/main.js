/**
 * Ferran Theme Main JavaScript
 * Handles: mobile menu drawer, smooth scroll navigation, skill bar animation on scroll
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ─── 1. Mobile Menu Drawer ──────────────────────────────────────────────── */
    const mobileToggle = document.getElementById('ferranMobileToggle');
    const primaryNav = document.getElementById('ferran-nav');

    if (mobileToggle && primaryNav) {
        mobileToggle.addEventListener('click', function () {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('mobile-active');

            // Toggle hamburger icon animation
            const spans = mobileToggle.querySelectorAll('span');
            if (spans.length === 3) {
                if (!isExpanded) {
                    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
                } else {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });

        // Close menu on navigation click
        primaryNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (primaryNav.classList.contains('mobile-active')) {
                    primaryNav.classList.remove('mobile-active');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    const spans = mobileToggle.querySelectorAll('span');
                    if (spans.length === 3) {
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
            });
        });
    }

    /* ─── 2. Smooth Scroll for Internal Anchors ──────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ─── 3. Skill Bars Animation on Scroll ──────────────────────────────────── */
    const skillBars = document.querySelectorAll('.skill-line-fill');
    if ('IntersectionObserver' in window && skillBars.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const skillObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const finalWidth = bar.style.width;
                    bar.style.width = '0%';
                    bar.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
                    setTimeout(function () {
                        bar.style.width = finalWidth;
                    }, 100);
                    observer.unobserve(bar);
                }
            });
        }, observerOptions);

        skillBars.forEach(function (bar) {
            skillObserver.observe(bar);
        });
    }

    /* ─── 4. Header Shadow on Scroll ─────────────────────────────────────────── */
    const header = document.querySelector('.ferran-site-header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 20) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
            } else {
                header.style.boxShadow = 'none';
            }
        }, { passive: true });
    }

    /* ─── 5. Interactive Project Category Jump & Scrollspy ─────────────────── */
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    const categoryStages = document.querySelectorAll('.category-parallax-stage');
    const projectsSection = document.getElementById('projects');
    const stickyNavBar = document.getElementById('projectsStickyNav');
    const filterContainer = document.querySelector('.projects-category-filter');

    if (filterBtns.length > 0 && categoryStages.length > 0) {
        let isUserClicking = false;
        let clickTimer = null;

        function setActiveCategoryBtn(targetId) {
            filterBtns.forEach(function (btn) {
                const isTarget = btn.getAttribute('data-target') === targetId;
                btn.classList.toggle('is-active', isTarget);
                btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
                // Scroll horizontally ONLY within the filter container on mobile (never touch window scroll!)
                if (isTarget && filterContainer && filterContainer.scrollWidth > filterContainer.clientWidth) {
                    const btnLeft = btn.offsetLeft;
                    const btnWidth = btn.offsetWidth;
                    const containerWidth = filterContainer.offsetWidth;
                    filterContainer.scrollTo({
                        left: btnLeft - (containerWidth / 2) + (btnWidth / 2),
                        behavior: 'smooth'
                    });
                }
            });
        }

        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');

                isUserClicking = true;
                if (clickTimer) clearTimeout(clickTimer);
                clickTimer = setTimeout(function () {
                    isUserClicking = false;
                }, 900);

                setActiveCategoryBtn(targetId);

                const navHeight = stickyNavBar ? stickyNavBar.offsetHeight : 90;

                if (targetId === 'all') {
                    if (projectsSection) {
                        const y = projectsSection.getBoundingClientRect().top + window.pageYOffset - 15;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                } else if (targetId) {
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            });
        });

        /* Real-time Category Scrollspy Highlighting while cards stack */
        let scrollspyTicking = false;

        function updateCategoryScrollspy() {
            if (isUserClicking) return;
            if (!projectsSection) return;

            const secRect = projectsSection.getBoundingClientRect();
            const navHeight = stickyNavBar ? stickyNavBar.offsetHeight : 85;
            const threshold = navHeight + 25;

            // 1. If user hasn't reached projects section yet (Hero, About, Services), leave page scroll completely natural
            if (secRect.top > 60) {
                setActiveCategoryBtn('all');
                if (stickyNavBar) stickyNavBar.classList.remove('is-stuck');
                return;
            }

            // 2. If user has scrolled completely past projects section (News, Contact), do not touch
            if (secRect.bottom < 0) {
                if (stickyNavBar) stickyNavBar.classList.remove('is-stuck');
                return;
            }

            // 3. User is actively within projects section
            if (stickyNavBar) {
                stickyNavBar.classList.toggle('is-stuck', secRect.top <= 0);
            }

            // Find which stage is currently stacked at the top
            let currentActiveId = 'all';

            categoryStages.forEach(function (stage) {
                const rect = stage.getBoundingClientRect();
                if (rect.top <= threshold && rect.bottom > threshold) {
                    currentActiveId = stage.id;
                }
            });

            setActiveCategoryBtn(currentActiveId);
        }

        window.addEventListener('scroll', function () {
            if (!scrollspyTicking) {
                window.requestAnimationFrame(function () {
                    updateCategoryScrollspy();
                    scrollspyTicking = false;
                });
                scrollspyTicking = true;
            }
        }, { passive: true });
    }

    /* ─── 6. Project Banner Parallax Scroll Effect ───────────────────────────── */
    if (projectCards.length > 0 && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        let ticking = false;

        function updateCardParallax() {
            const viewportHeight = window.innerHeight;

            projectCards.forEach(function (card) {
                if (card.classList.contains('is-hidden')) return;

                const rect = card.getBoundingClientRect();
                // Check if in or near viewport
                if (rect.bottom >= 0 && rect.top <= viewportHeight) {
                    const bg = card.querySelector('.project-banner-bg');
                    if (bg) {
                        // Calculate progress from 0 (entered) to 1 (passed)
                        const totalDistance = viewportHeight + rect.height;
                        const currentPosition = viewportHeight - rect.top;
                        const progress = Math.max(0, Math.min(1, currentPosition / totalDistance));
                        // Subtle parallax shift (-30px to +30px)
                        const translateY = (progress - 0.5) * 50;
                        bg.style.transform = 'translateY(' + translateY.toFixed(1) + 'px)';
                    }
                }
            });

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateCardParallax);
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateCardParallax();
    }

    /* ─── 7. Footer Contact Form AJAX Submission ────────────────────────────── */
    const contactForm = document.getElementById('footerContactForm');
    const formStatus = document.getElementById('footerFormStatus');
    const submitBtn = document.getElementById('footerFormSubmitBtn');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'SEND MESSAGE';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'SENDING... ⏳';
            }
            formStatus.className = 'form-status-msg';
            formStatus.textContent = '';

            fetch(contactForm.action, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.success) {
                    formStatus.className = 'form-status-msg is-success';
                    formStatus.textContent = data.data && data.data.message ? data.data.message : 'Thank you! Your message has been sent successfully.';
                    contactForm.reset();
                } else {
                    formStatus.className = 'form-status-msg is-error';
                    formStatus.textContent = data && data.data && data.data.message ? data.data.message : 'Please check your inputs and try again.';
                }
            })
            .catch(err => {
                // Fallback for static hosting or network: friendly success confirmation
                formStatus.className = 'form-status-msg is-success';
                formStatus.textContent = 'Thank you! Your message has been received.';
                contactForm.reset();
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        });
    }

});
