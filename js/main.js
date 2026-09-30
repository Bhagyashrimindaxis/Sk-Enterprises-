/**
 * SK MODULAR FURNITURE & INTERIOR DESIGNER
 * Master Interactive Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
    await loadDynamicComponents();
    initHeroSlider();
    initProductFilter();
    initQuickViewModal();
    initGalleryFilterAndLightbox();
    initVideoPageLightbox();
    initCounterAnimation();
    initTestimonialCarousel();
    initQuoteCalculator();
    initLocationsAccordion();
    initHeroVideos();
    initCardScrollAnimations();
});

/* ==========================================================================
   DYNAMIC COMPONENT LOADER (Header & Footer)
   ========================================================================== */
async function loadDynamicComponents() {
    const headerContainer = document.getElementById('site-header-container');
    const footerContainer = document.getElementById('site-footer-container');

    const tasks = [];

    if (headerContainer && headerContainer.children.length === 0) {
        tasks.push(
            fetch('header.html')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load header.html');
                    return res.text();
                })
                .then(html => {
                    headerContainer.innerHTML = html;
                    highlightCurrentPageNav();
                    initNavbar();
                })
                .catch(err => {
                    console.warn('Dynamic header loading error:', err);
                    initNavbar();
                })
        );
    } else {
        highlightCurrentPageNav();
        initNavbar();
    }

    if (footerContainer && footerContainer.children.length === 0) {
        tasks.push(
            fetch('footer.html')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load footer.html');
                    return res.text();
                })
                .then(html => {
                    footerContainer.innerHTML = html;
                    initSlideDrawer();
                    initBackToTop();
                    initFormHandlers();
                })
                .catch(err => {
                    console.warn('Dynamic footer loading error:', err);
                    initSlideDrawer();
                    initBackToTop();
                    initFormHandlers();
                })
        );
    } else {
        initSlideDrawer();
        initBackToTop();
        initFormHandlers();
    }

    await Promise.all(tasks);
}

function highlightCurrentPageNav() {
    const bodyPage = document.body.getAttribute('data-page') || '';
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.site-header .nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const navKey = link.getAttribute('data-nav') || '';
        const href = (link.getAttribute('href') || '').toLowerCase();

        if (bodyPage && navKey === bodyPage) {
            link.classList.add('active');
        } else if (navKey === 'gallery' && (bodyPage === 'videos' || currentPath.endsWith('videos.html'))) {
            link.classList.add('active');
        } else if (
            (currentPath.endsWith('/' + href) || currentPath.endsWith(href)) &&
            href !== 'index.html' && href !== ''
        ) {
            link.classList.add('active');
        } else if (
            (currentPath.endsWith('/') || currentPath.endsWith('/index.html') || currentPath === '') &&
            (navKey === 'home' || href === 'index.html')
        ) {
            link.classList.add('active');
        }
    });
}

/* ==========================================================================
   1. NAVBAR CONTROLLER
   ========================================================================== */
function initNavbar() {
    const header = document.querySelector('.site-header');
    const headerContainer = document.getElementById('site-header-container');
    if (!header && !headerContainer) return;

    // Sticky navbar with threshold
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            if (header) header.classList.add('scrolled');
            if (headerContainer) headerContainer.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
            if (headerContainer) headerContainer.classList.remove('scrolled');
        }
    }, { passive: true });
}

/* ==========================================================================
   2. HERO SLIDER (Moderno Interactive Showcase - Infinite Video Loop)
   ========================================================================== */
function initHeroSlider() {
    const slides = document.querySelectorAll('.moderno-slide, .hero-slide');
    const dots = document.querySelectorAll('.moderno-dot, .hero-dot');
    const prevBtn = document.querySelector('.moderno-prev, .hero-prev');
    const nextBtn = document.querySelector('.moderno-next, .hero-next');
    const soundToggles = document.querySelectorAll('.video-sound-toggle');

    if (!slides.length) return;

    let currentSlide = 0;
    let slideTimeout = null;

    function clearTimer() {
        if (slideTimeout) {
            clearTimeout(slideTimeout);
            slideTimeout = null;
        }
    }

    function showSlide(index) {
        clearTimer();

        // Pause all other videos and clean up listeners
        slides.forEach(slide => {
            const v = slide.querySelector('video');
            if (v) {
                v.onended = null;
                try { v.pause(); } catch(e) {}
            }
            slide.classList.remove('active');
        });

        dots.forEach(d => d.classList.remove('active'));

        // Calculate next slide index (Infinite Loop)
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');

        // Synchronize dynamic text slides
        const textSlides = document.querySelectorAll('.hero-text-slide');
        if (textSlides.length) {
            textSlides.forEach((ts, idx) => {
                if (idx === currentSlide) {
                    ts.classList.add('active');
                } else {
                    ts.classList.remove('active');
                }
            });
        }

        const activeSlide = slides[currentSlide];
        const activeVideo = activeSlide.querySelector('video');

        if (activeVideo) {
            activeVideo.currentTime = 0;
            const playPromise = activeVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }

            // Continuous Infinite Loop: Advance to next slide when current video finishes
            activeVideo.onended = () => {
                nextSlide();
            };

            // Fallback: If video duration is available, schedule advance with safety buffer, else 8s fallback
            const scheduleAdvance = () => {
                const dur = (activeVideo.duration && isFinite(activeVideo.duration) && activeVideo.duration > 1)
                    ? (activeVideo.duration * 1000) + 200
                    : 8000;
                clearTimer();
                slideTimeout = setTimeout(nextSlide, dur);
            };

            if (activeVideo.readyState >= 1) {
                scheduleAdvance();
            } else {
                activeVideo.onloadedmetadata = scheduleAdvance;
                slideTimeout = setTimeout(nextSlide, 8000);
            }
        } else {
            // Photo slides: 6 seconds auto-transition
            slideTimeout = setTimeout(nextSlide, 6000);
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            showSlide(index);
        });
    });

    // Sound toggle buttons for videos
    soundToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentSlide = toggle.closest('.moderno-slide');
            if (!parentSlide) return;
            const video = parentSlide.querySelector('video');
            if (!video) return;

            video.muted = !video.muted;
            const icon = toggle.querySelector('i');
            if (icon) {
                if (video.muted) {
                    icon.className = 'fa-solid fa-volume-xmark';
                } else {
                    icon.className = 'fa-solid fa-volume-high';
                }
            }
        });
    });

    // Start with the initial slide
    showSlide(0);
}

function initHeroVideos() {
    const videos = document.querySelectorAll('.hero-moderno-section video, .hero-video-section video');
    videos.forEach(v => {
        v.muted = true;
        const playPromise = v.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => { });
        }
    });
}

/* ==========================================================================
   3. SIGNATURE PRODUCTS FILTER
   ========================================================================== */
function initProductFilter() {
    const filterBtns = document.querySelectorAll('.product-filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in');
                }
            });
        });
    });
}

/* ==========================================================================
   4. PRODUCT QUICK VIEW MODAL
   ========================================================================== */
const productDatabase = {
    1: {
        name: "Architectural Master Bedroom Suite & Panelling",
        category: "Bedroom",
        badge: "Completed Project",
        image: "assets/images/SK-Img/sk-bedroom-suite-wide.jpg",
        description: "Turnkey master bedroom execution crafted by S. K. Enterprises featuring a custom upholstered headboard, sage green wall moulding panelling, acoustic ceiling woodwork, integrated warm LED cove lighting, and matching bedside consoles.",
        specs: {
            dimensions: "King Bed (78\" x 84\") + Custom Wall Panelling",
            woodQuality: "BWP Grade Marine Plywood & Teak Accents",
            finish: "Sage Green Satin PU Paint + Textured Fabric Upholstery",
            lighting: "Concealed 3000K Warm LED Ambient Strip",
            warranty: "10 Years Structural Warranty"
        },
        priceEstimate: "Custom Quoted per Room Dimensions"
    },
    2: {
        name: "Floor-to-Ceiling Textured Modular Wardrobe",
        category: "Modular Wardrobes",
        badge: "Bespoke Fit",
        image: "assets/images/SK-Img/sk-luxury-wardrobe-detail.jpg",
        description: "High-precision floor-to-ceiling modular wardrobe engineered with premium textured acoustic inset doors, sleek matte black full-height handles, overhead storage lofts, and an integrated tinted glass showcase with warm sensor lighting.",
        specs: {
            dimensions: "Full Height (up to 9.5 ft) x Custom Width",
            doorFinish: "Textured Mauve-Beige Inset Panels with Edge-Banded Borders",
            hardware: "Hettich Soft-Close Hinges & Heavy-Duty Telescopic Channels",
            handles: "Matte Black Slimline Architectural Pulls",
            warranty: "10 Years Factory Guarantee"
        },
        priceEstimate: "Starting from ₹1,450 / sq. ft."
    },
    3: {
        name: "Dual-Tone 2-Drawer Modular Nightstand",
        category: "Bedside & Storage",
        badge: "Crafted Unit",
        image: "assets/images/SK-Img/sk-modular-nightstand.jpg",
        description: "Compact dual-tone bedside storage unit designed to sit flush against bedroom wall panelling. Features an authentic rich walnut wood laminate top surface and two smooth soft-closing beige lacquer drawers.",
        specs: {
            dimensions: "20\" W x 16\" D x 18\" H",
            material: "High-Density HDHMR Core & Natural Walnut Finish",
            runners: "Hafele Undermount Soft-Close Slides",
            finish: "Anti-Scratch Matte PU Top + Ivory Drawers",
            warranty: "7 Years Warranty"
        },
        priceEstimate: "Starting from ₹12,500 / pair"
    },
    4: {
        name: "Integrated Master Bedroom & Glass Closet Ensemble",
        category: "Bedroom",
        badge: "Featured Execution",
        image: "assets/images/SK-Img/sk-bedroom-wardrobe-combo.jpg",
        description: "A complete turnkey bedroom suite harmonizing the master bed with the modular wardrobe system. Maximizes natural room flow with mirrored partition reflections and cohesive color palettes.",
        specs: {
            roomType: "Master Bedroom Suite (Turnkey)",
            components: "King Bed, 4-Door Wardrobe, Display Cabinet, Nightstands",
            hardware: "German Engineered Concealed Fittings",
            customization: "100% Tailored to Architect / Client Floor Plan",
            warranty: "10 Years Comprehensive Warranty"
        },
        priceEstimate: "Turnkey Package Estimates Available"
    },
    5: {
        name: "Bespoke Bedside Wood Panelling & Custom Headboard",
        category: "Wall Panelling",
        badge: "Architectural Detail",
        image: "assets/images/SK-Img/sk-bedside-styling.jpg",
        description: "Architectural vertical walnut wood cladding paired with fluted sage moulding and an upholstered bed headboard. Seamlessly accommodates integrated switches, USB ports, and floating bedside lighting.",
        specs: {
            material: "Natural Wood Grain Laminate & Fluted MDF Moulding",
            headboard: "Segmented Ergonomic Foam Padded Linen",
            electrical: "Concealed Wiring Channels & Custom Switch Cutouts",
            installation: "Turnkey On-Site Fitting by Master Carpenters",
            warranty: "10 Years Warranty"
        },
        priceEstimate: "Custom Quoted per Running Sq. Ft."
    },
    6: {
        name: "Custom Loft Storage & Multi-Door Modular Wardrobe",
        category: "Modular Wardrobes",
        badge: "Maximum Storage",
        image: "assets/images/SK-Img/sk-luxury-wardrobe-detail.jpg",
        description: "Floor-to-ceiling modular wardrobe maximizing vertical apartment height with flush overhead lofts for seasonal storage, internal organizers, and full-length vertical door profiles.",
        specs: {
            storageZones: "Lofts, Hanging Rails, Shelf Stacks & Suede Drawers",
            innerCarcass: "Pre-Laminated Moisture Resistant HDHMR Board",
            edgeBanding: "2mm Machine-Applied Seamless PVC Edges",
            warranty: "10 Years Warranty",
            customization: "Configurable Internal Modular Layout"
        },
        priceEstimate: "Starting from ₹1,550 / sq. ft."
    },
    7: {
        name: "Turnkey Residence Interior Execution",
        category: "Bedroom",
        badge: "Complete Interior",
        image: "assets/images/SK-Img/sk-bedroom-suite-wide.jpg",
        description: "End-to-end turnkey interior contracting executed by S. K. Enterprises, from false ceiling coving and wall mouldings to complete modular furniture manufacture and installation.",
        specs: {
            scope: "Furniture Manufacturing + Complete Interior Styling",
            timeline: "Delivered within 30-45 Days Guaranteed",
            factoryLocation: "Pune, Maharashtra",
            clientAssurance: "On-Time Handover with 10-Year Warranty",
            warranty: "10 Years Structural Guarantee"
        },
        priceEstimate: "Turnkey Project Estimation on Request"
    },
    8: {
        name: "Minimalist Floating Bedside Storage Console",
        category: "Bedside & Storage",
        badge: "Modern Living",
        image: "assets/images/SK-Img/sk-modular-nightstand.jpg",
        description: "Contemporary bedside nightstand pairing clean architectural lines with premium German runners, engineered for effortless daily utility and clutter-free living.",
        specs: {
            dimensions: "18\" W x 15\" D x 16\" H",
            material: "Calibrated Plywood & Scratch-Resistant Finish",
            drawers: "Dual Drawers with Soft-Closing Mechanism",
            warranty: "7 Years Warranty",
            colors: "Available in Walnut, Ivory, Grey & Charcoal"
        },
        priceEstimate: "Starting from ₹11,000 / pair"
    }
};

function initQuickViewModal() {
    const modal = document.getElementById('quickViewModal');
    const closeBtn = document.getElementById('quickViewClose');
    const triggers = document.querySelectorAll('.trigger-quick-view');

    if (!modal) return;

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = trigger.getAttribute('data-product-id');
            const data = productDatabase[productId];

            if (data) {
                document.getElementById('modalProductImg').src = data.image;
                document.getElementById('modalProductImg').alt = data.name;
                document.getElementById('modalProductCategory').textContent = data.category;
                document.getElementById('modalProductName').textContent = data.name;
                document.getElementById('modalProductDesc').textContent = data.description;
                document.getElementById('modalProductPrice').textContent = data.priceEstimate;

                const specsContainer = document.getElementById('modalProductSpecs');
                specsContainer.innerHTML = '';
                for (const [key, value] of Object.entries(data.specs)) {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.padding = '8px 0';
                    row.style.borderBottom = '1px solid #edf2f5';
                    row.style.fontSize = '0.86rem';
                    row.innerHTML = `<span style="color:#5D6B75;text-transform:capitalize;">${key.replace(/([A-Z])/g, ' $1')}:</span> <strong style="color:#1E252B;">${value}</strong>`;
                    specsContainer.appendChild(row);
                }

                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/* ==========================================================================
   5. GALLERY FILTER & DEDICATED PHOTO LIGHTBOX
   ========================================================================== */
function initGalleryFilterAndLightbox() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const photoLightbox = document.getElementById('galleryPhotoLightbox') || document.getElementById('galleryLightbox');
    const closeBtn = document.getElementById('photoLightboxClose') || document.getElementById('lightboxClose');
    const lightboxImg = document.getElementById('photoLightboxImg') || document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('photoLightboxTitle') || document.getElementById('lightboxTitle');

    // Filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-gallery-filter');

            galleryItems.forEach(item => {
                const cat = item.getAttribute('data-gallery-cat');
                let matches = (filter === 'all' || cat === filter);

                if (matches) {
                    item.style.display = 'block';
                    item.classList.add('fade-in');
                } else {
                    item.style.display = 'none';
                    item.classList.remove('fade-in');
                }
            });
        });
    });

    // Lightbox click
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgElem = item.querySelector('.gallery-img');
            const titleElem = item.querySelector('.gallery-title');

            if (!imgElem) return;

            const imgSrc = imgElem.getAttribute('src') || '';
            const title = titleElem ? titleElem.textContent.trim() : '';

            if (lightboxImg) {
                lightboxImg.src = imgSrc;
                lightboxImg.alt = title;
            }
            if (lightboxTitle) {
                lightboxTitle.textContent = title;
            }

            if (photoLightbox) {
                photoLightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closePhotoLightbox() {
        if (photoLightbox) photoLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closePhotoLightbox);
    if (photoLightbox) {
        photoLightbox.addEventListener('click', (e) => {
            if (e.target === photoLightbox) closePhotoLightbox();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && photoLightbox && photoLightbox.classList.contains('active')) {
            closePhotoLightbox();
        }
    });
}

/* ==========================================================================
   5B. DEDICATED VIDEO PAGE LIGHTBOX
   ========================================================================== */
function initVideoPageLightbox() {
    const videoCards = document.querySelectorAll('.video-card-interactive');
    const videoLightbox = document.getElementById('videoPageLightbox');
    const closeBtn = document.getElementById('videoLightboxClose');
    const videoPlayer = document.getElementById('videoPagePlayer');
    const videoTitle = document.getElementById('videoPageTitle');

    if (!videoLightbox) return;

    videoCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'VIDEO' && e.offsetY > e.target.clientHeight - 50) {
                return;
            }

            const videoSrc = card.getAttribute('data-video-src');
            const title = card.getAttribute('data-video-title') || '';

            if (videoTitle) videoTitle.textContent = title;

            if (videoPlayer && videoSrc) {
                videoPlayer.src = videoSrc;
                videoPlayer.load();
                videoPlayer.play().catch(() => { });
            }

            videoLightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeVideoLightbox() {
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = '';
        }
        videoLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeVideoLightbox);
    videoLightbox.addEventListener('click', (e) => {
        if (e.target === videoLightbox) closeVideoLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoLightbox.classList.contains('active')) {
            closeVideoLightbox();
        }
    });
}

/* ==========================================================================
   6. STATS COUNTER ANIMATION
   ========================================================================== */
function initCounterAnimation() {
    const counterElements = document.querySelectorAll('.counter-val');
    if (!counterElements.length) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counterElements.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'), 10);
                    const duration = 2000;
                    const stepTime = 20;
                    const steps = duration / stepTime;
                    const increment = target / steps;
                    let current = 0;

                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            counter.textContent = target.toLocaleString();
                            clearInterval(timer);
                        } else {
                            counter.textContent = Math.floor(current).toLocaleString();
                        }
                    }, stepTime);
                });
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   7. TESTIMONIALS CAROUSEL
   ========================================================================== */
function initTestimonialCarousel() {
    const track = document.getElementById('testimonialTrack');
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('testPrev');
    const nextBtn = document.getElementById('testNext');

    if (!track || !slides.length) return;

    let currentIndex = 0;
    let autoTimer;

    function updateSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function next() {
        updateSlide(currentIndex + 1);
    }

    function prev() {
        updateSlide(currentIndex - 1);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            next();
            restartTimer();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prev();
            restartTimer();
        });
    }

    function startTimer() {
        autoTimer = setInterval(next, 5500);
    }

    function restartTimer() {
        clearInterval(autoTimer);
        startTimer();
    }

    startTimer();
}

/* ==========================================================================
   8. INTERACTIVE FURNITURE QUOTE ESTIMATOR
   ========================================================================== */
function initQuoteCalculator() {
    const projectTypeSelect = document.getElementById('calcProjectType');
    const spaceSizeSelect = document.getElementById('calcSpaceSize');
    const finishSelect = document.getElementById('calcFinish');
    const estimateDisplay = document.getElementById('calcEstimateResult');

    if (!projectTypeSelect || !estimateDisplay) return;

    function calculateEstimate() {
        const type = projectTypeSelect.value;
        const size = spaceSizeSelect.value;
        const finish = finishSelect.value;

        let baseMin = 150000;
        let baseMax = 220000;

        // Type multiplier
        if (type === 'living') {
            baseMin = 90000; baseMax = 160000;
        } else if (type === 'kitchen') {
            baseMin = 140000; baseMax = 250000;
        } else if (type === 'bedroom') {
            baseMin = 110000; baseMax = 190000;
        } else if (type === 'full_home') {
            baseMin = 350000; baseMax = 650000;
        } else if (type === 'office') {
            baseMin = 200000; baseMax = 450000;
        }

        // Size multiplier
        let sizeMultiplier = 1.0;
        if (size === '1bhk') sizeMultiplier = 0.8;
        else if (size === '2bhk') sizeMultiplier = 1.0;
        else if (size === '3bhk') sizeMultiplier = 1.45;
        else if (size === '4bhk') sizeMultiplier = 2.1;
        else if (size === 'commercial') sizeMultiplier = 1.6;

        // Finish multiplier
        let finishMultiplier = 1.0;
        if (finish === 'laminate') finishMultiplier = 1.0;
        else if (finish === 'veneer') finishMultiplier = 1.4;
        else if (finish === 'acrylic') finishMultiplier = 1.3;
        else if (finish === 'pu_lacquer') finishMultiplier = 1.7;

        const finalMin = Math.round((baseMin * sizeMultiplier * finishMultiplier) / 5000) * 5000;
        const finalMax = Math.round((baseMax * sizeMultiplier * finishMultiplier) / 5000) * 5000;

        function formatINR(val) {
            if (val >= 100000) {
                return '₹' + (val / 100000).toFixed(2) + ' Lakh';
            }
            return '₹' + val.toLocaleString('en-IN');
        }

        estimateDisplay.textContent = `${formatINR(finalMin)} – ${formatINR(finalMax)}*`;
    }

    projectTypeSelect.addEventListener('change', calculateEstimate);
    spaceSizeSelect.addEventListener('change', calculateEstimate);
    finishSelect.addEventListener('change', calculateEstimate);

    calculateEstimate();
}

/* ==========================================================================
   9. LOCATIONS ACCORDION
   ========================================================================== */
function initLocationsAccordion() {
    const toggleBtn = document.getElementById('locationsToggleBtn');
    const body = document.getElementById('locationsAccordionBody');
    const icon = document.getElementById('locationsToggleIcon');

    if (!toggleBtn || !body) return;

    toggleBtn.addEventListener('click', () => {
        const isOpen = body.classList.contains('open');
        if (isOpen) {
            body.classList.remove('open');
            icon.className = 'fa-solid fa-chevron-down';
        } else {
            body.classList.add('open');
            icon.className = 'fa-solid fa-chevron-up';
        }
    });
}

/* ==========================================================================
   10. SLIDE-OUT ENQUIRY DRAWER
   ========================================================================== */
function initSlideDrawer() {
    const drawer = document.getElementById('enquiryDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    if (!drawer || !backdrop) return;

    function openDrawer(prefillNote = '') {
        if (prefillNote) {
            const msgField = drawer.querySelector('#drawerMessage');
            if (msgField) msgField.value = `Enquiry about: ${prefillNote}`;
        }
        drawer.classList.add('active');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.open-enquiry-drawer');
        if (trigger) {
            e.preventDefault();
            const note = trigger.getAttribute('data-enquiry-note') || '';
            openDrawer(note);
            return;
        }
        const closeBtn = e.target.closest('#closeEnquiryDrawer');
        if (closeBtn || e.target === backdrop) {
            e.preventDefault();
            closeDrawer();
        }
    });
}

/* ==========================================================================
   11. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ==========================================================================
   12. FORM HANDLERS & TOAST NOTIFICATIONS
   ========================================================================== */
function initFormHandlers() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Request...';
            }

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Request Received!';
                }

                showToastNotification("Thank you! Your inquiry has been forwarded to our master furniture designers. We will contact you within 2 hours.");
                form.reset();

                setTimeout(() => {
                    if (submitBtn) submitBtn.innerHTML = originalText;
                    const drawer = document.getElementById('enquiryDrawer');
                    const backdrop = document.getElementById('drawerBackdrop');
                    if (drawer && drawer.classList.contains('active')) {
                        drawer.classList.remove('active');
                        if (backdrop) backdrop.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }, 2200);
            }, 1000);
        });
    });
}

function showToastNotification(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.style.position = 'fixed';
        toast.style.bottom = '95px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.backgroundColor = '#162B36';
        toast.style.color = '#FFFFFF';
        toast.style.padding = '16px 28px';
        toast.style.borderRadius = '50px';
        toast.style.boxShadow = '0 14px 40px rgba(0,0,0,0.3)';
        toast.style.fontSize = '0.94rem';
        toast.style.fontWeight = '600';
        toast.style.zIndex = '3000';
        toast.style.border = '1.5px solid #C8A87E';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '12px';
        toast.style.transition = 'all 0.4s ease';
        toast.style.opacity = '0';
        toast.style.pointerEvents = 'none';
        toast.style.maxWidth = '90%';
        toast.style.textAlign = 'center';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#C8A87E;font-size:1.25rem;"></i> <span>${message}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 4500);
}

/* ==========================================================================
   CLIENT TESTIMONIALS INFINITE LOOP CAROUSEL
   ========================================================================== */
function initTestimonialCarousel() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.testimonial-slide'));
    if (!slides.length) return;

    const prevBtn = document.getElementById('testPrev');
    const nextBtn = document.getElementById('testNext');
    const dotsContainer = document.getElementById('testimonialDots');

    let currentIndex = 0;
    let autoPlayTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    function getVisibleCards() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
    }

    function getMaxIndex() {
        const visible = getVisibleCards();
        return Math.max(0, slides.length - visible);
    }

    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        slides.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.className = `testimonial-dot ${idx === currentIndex ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to testimonial slide ${idx + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(idx);
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.testimonial-dot');
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function updateTrackPosition() {
        if (!slides[0]) return;
        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = 24; // matches CSS gap
        const offset = currentIndex * (slideWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
    }

    function goToSlide(index) {
        const maxIndex = getMaxIndex();
        if (index > maxIndex) {
            currentIndex = 0; // Infinite wrap around to start
        } else if (index < 0) {
            currentIndex = maxIndex; // Infinite wrap around to end
        } else {
            currentIndex = index;
        }
        updateTrackPosition();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            nextSlide();
        }, 4000);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Event Listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            resetAutoPlay();
        });
    }

    // Pause on hover
    const container = track.closest('.testimonial-container');
    if (container) {
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);
    }

    // Touch Swipe Support
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoPlay();
    }, { passive: true });

    // Handle Resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const max = getMaxIndex();
            if (currentIndex > max) currentIndex = max;
            updateTrackPosition();
        }, 150);
    });

    // Initialize
    createDots();
    updateTrackPosition();
    startAutoPlay();
}

/* ==========================================================================
   SCROLL CARD ENTRANCE ANIMATIONS (Left & Right Glides Across All Pages)
   ========================================================================== */
function initCardScrollAnimations() {
    const containerSelectors = [
        '.collections-grid',
        '.products-grid',
        '.features-grid',
        '.about-grid',
        '.why-architectural-grid',
        '.why-arch-list',
        '.why-split-container',
        '.why-pro-features',
        '.process-cards-grid',
        '.process-grid',
        '.stats-grid',
        '.gallery-grid',
        '.videos-grid',
        '.contact-section-grid',
        '.sn-projects-list',
        '.sn-projects-section',
        '.testimonials-slider',
        '.vm-grid',
        '.pillars-grid',
        '.branches-grid',
        '.certs-grid'
    ];

    const cardSelectors = [
        '.collection-card',
        '.product-card',
        '.sn-project-card',
        '.about-visual',
        '.about-content',
        '.why-editorial-card',
        '.why-arch-content',
        '.why-architectural-visual',
        '.why-arch-item',
        '.why-visual-showcase',
        '.why-content-side',
        '.why-pro-item',
        '.stat-box',
        '.feature-card',
        '.process-card-item',
        '.process-card',
        '.process-step',
        '.testimonial-card',
        '.gallery-item',
        '.video-card',
        '.contact-info-panel',
        '.contact-form-panel',
        '.branch-card',
        '.vm-card',
        '.pillar-card',
        '.cert-card'
    ];

    const animatedElements = [];

    // 0. Automatically include all elements that already have explicit animation classes
    document.querySelectorAll('.card-animate-left, .card-animate-right').forEach(item => {
        if (!animatedElements.includes(item)) {
            animatedElements.push(item);
        }
    });

    // 1. Process structured grid containers to alternate left and right with stagger
    containerSelectors.forEach(containerSel => {
        document.querySelectorAll(containerSel).forEach(container => {
            const items = container.querySelectorAll(cardSelectors.join(', '));
            items.forEach((item, idx) => {
                if (!animatedElements.includes(item)) {
                    animatedElements.push(item);
                    // Left-column panels vs Right-column panels
                    if (container.classList.contains('about-grid') || container.classList.contains('contact-section-grid') || container.classList.contains('why-split-container')) {
                        if (idx % 2 === 0) {
                            item.classList.add('card-animate-left');
                        } else {
                            item.classList.add('card-animate-right');
                        }
                    } else if (item.classList.contains('about-visual') || item.classList.contains('contact-info-panel') || item.classList.contains('why-visual-showcase')) {
                        item.classList.add('card-animate-left');
                    } else if (item.classList.contains('about-content') || item.classList.contains('contact-form-panel') || item.classList.contains('why-content-side')) {
                        item.classList.add('card-animate-right');
                    } else {
                        // Alternate left and right
                        if (idx % 2 === 0) {
                            item.classList.add('card-animate-left');
                        } else {
                            item.classList.add('card-animate-right');
                        }
                    }
                    // Add subtle staggered delay within rows
                    const stagger = (idx % 3) * 0.1;
                    if (stagger > 0) {
                        item.style.transitionDelay = `${stagger}s`;
                    }
                }
            });
        });
    });

    // 2. Catch any standalone cards not inside known grid containers
    cardSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((item, idx) => {
            if (!animatedElements.includes(item)) {
                animatedElements.push(item);
                if (idx % 2 === 0) {
                    item.classList.add('card-animate-left');
                } else {
                    item.classList.add('card-animate-right');
                }
            }
        });
    });

    // 3. Trigger animations with IntersectionObserver
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('card-animated');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.04,
            rootMargin: '0px 0px -15px 0px'
        });

        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // If element is already in the viewport upon load, animate smoothly
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                setTimeout(() => el.classList.add('card-animated'), 60);
            } else {
                observer.observe(el);
            }
        });
    } else {
        animatedElements.forEach(el => el.classList.add('card-animated'));
    }
}

