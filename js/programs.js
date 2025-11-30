// ===== PROGRAMS PAGE JAVASCRIPT =====

// Initialize Google Maps
/*function initMap() {
    // Default coordinates for Nigeria (center of the country)
    const center = { lat: 9.0765, lng: 7.3986 };
    
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: center,
        styles: [
            {
                featureType: "all",
                elementType: "geometry.fill",
                stylers: [{ color: "#f5f5f5" }]
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#c9c9c9" }]
            },
            {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#e8e8e8" }]
            }
        ]
    });

    // Add markers for our work locations
    const locations = [
        {
            position: { lat: 8.5, lng: 7.5 },
            title: "Kangaga",
            content: "Healthcare and education programs"
        },
        {
            position: { lat: 8.9, lng: 33.4 },
            title: "Mbeya Region",
            content: "Water and sanitation projects"
        },
        {
            position: { lat: 9.3, lng: 34.8 },
            title: "Njombe Region",
            content: "Agricultural development programs"
        }
    ];

    locations.forEach(location => {
        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.title,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="12" fill="#DC143C" stroke="#fff" stroke-width="2"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">📍</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h4 style="margin: 0 0 5px 0; color: #6B3E2E;">${location.title}</h4>
                    <p style="margin: 0; color: #333;">${location.content}</p>
                </div>
            `
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });
    });
}

// Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    // Gallery image click handlers
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                // Create modal for image viewing
                showImageModal(img.src, img.alt);
            }
        });
    });
*/
    // Video play button handlers
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoItem = this.closest('.video-item');
            const title = videoItem.querySelector('h4').textContent;
            showVideoModal(title);
        });
    });

    // Case study accordion auto-close
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-bs-target');
            const targetElement = document.querySelector(targetId);
            
            // Close other accordion items
            accordionButtons.forEach(otherButton => {
                if (otherButton !== this) {
                    const otherTargetId = otherButton.getAttribute('data-bs-target');
                    const otherTargetElement = document.querySelector(otherTargetId);
                    if (otherTargetElement) {
                        otherTargetElement.classList.remove('show');
                        otherButton.classList.add('collapsed');
                        otherButton.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    });


// Image modal functionality
function showImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <img src="${src}" alt="${alt}" class="modal-image">
                <p class="modal-caption">${alt}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.close-btn');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeBtn.addEventListener('click', () => modal.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) modal.remove();
    });
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        .modal-image {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 10px;
        }
        .modal-caption {
            color: white;
            text-align: center;
            margin-top: 1rem;
            font-size: 1.1rem;
        }
        .close-btn {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            background: rgba(0, 0, 0, 0.5);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
}

// Video modal functionality
function showVideoModal(title) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3 style="color: white; margin-bottom: 1rem;">${title}</h3>
                <div class="video-placeholder">
                    <i class="fas fa-play-circle" style="font-size: 4rem; color: #DC143C;"></i>
                    <p style="color: white; margin-top: 1rem;">Video content would be embedded here</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.close-btn');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeBtn.addEventListener('click', () => modal.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) modal.remove();
    });
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .video-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .modal-content {
            position: relative;
            max-width: 800px;
            text-align: center;
        }
        .video-placeholder {
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 15px;
            border: 2px dashed rgba(255, 255, 255, 0.3);
        }
        .close-btn {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            background: rgba(0, 0, 0, 0.5);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.initiative-card, .location-card, .gallery-item, .event-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
