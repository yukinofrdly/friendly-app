// ========== FAQ ACCORDION FUNCTIONALITY ==========
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item")

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")

    question.addEventListener("click", () => {
      // Close other open items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active")
        }
      })

      // Toggle current item
      item.classList.toggle("active")
    })
  })

  // ========== SMOOTH SCROLL ENHANCEMENT ==========
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href")
      if (targetId === "#") return

      const targetSection = document.querySelector(targetId)
      if (targetSection) {
        e.preventDefault()
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // ========== SCROLL ANIMATIONS ==========
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  const animatedElements = document.querySelectorAll(".feature-card, .service-card, .case-card, .step-card")
  animatedElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })

  // ========== CONTACT FORM (client-side) ==========
  // Server-side validation & mailing is handled by the mu-plugin.
  // Here we only do lightweight client-side checks and a graceful
  // success/error banner if the server redirected back with ?contact=...
  const contactForm = document.querySelector(".contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      const privacyEl = document.getElementById("privacy")
      if (privacyEl && !privacyEl.checked) {
        e.preventDefault()
        alert("個人情報の取扱規約に同意してください。")
      }
    })

    // Show success / error banner based on query string
    const params = new URLSearchParams(window.location.search)
    const status = params.get("contact")
    if (status) {
      const banner = document.createElement("div")
      banner.className = "contact-banner contact-banner-" + status
      banner.textContent =
        status === "success"
          ? "お問い合わせありがとうございます。担当者より折り返しご連絡いたします。"
          : "送信に失敗しました。お手数ですが時間をおいて再度お試しください。"
      contactForm.parentNode.insertBefore(banner, contactForm)
      // Scroll into view
      banner.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // ========== NAVBAR SCROLL EFFECT ==========
  let lastScroll = 0
  const navbar = document.querySelector(".navbar")

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset
    lastScroll = currentScroll
  })
})

// ========== MOBILE MENU TOGGLE ==========
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
  });

   // Close menu with X button
  if (menuClose) {
    menuClose.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });

  // Close menu when clicking a link
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });
}


//Solutions Circle Animations
document.addEventListener('DOMContentLoaded', function() {
    const stepCards = document.querySelectorAll('.step-card');
    const detailedSteps = document.querySelectorAll('.detailed-step');
    const stepsContainer = document.querySelector('.steps-container');
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    let hasActivated = false;

    // Observer for detailed steps
    const detailObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.classList.contains('detailed-step')) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.5 });

    detailedSteps.forEach(step => {
        detailObserver.observe(step);
    });

    // Activate circles only when scrolling past the step-detail section
    const stepDetailSection = document.querySelector('.step-detail');

    const activationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasActivated) {
                hasActivated = true;

                // Activate circles sequentially
                stepCards.forEach((card, index) => {
                    const circle = card.querySelector('.step-circle');
                    setTimeout(() => {
                        circle.classList.add('active');
                    }, index * 400); // Stagger animation: 0ms, 400ms, 800ms
                });
            }
        });
    }, { threshold: 0.3 });

    if (stepDetailSection) {
        activationObserver.observe(stepDetailSection);
    }

});


document.addEventListener('DOMContentLoaded', function() {
    const servicesLayout = document.querySelector('.services-layout');

    if (servicesLayout) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('bg-img-animation');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(servicesLayout);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.getElementById('backToTop');
    const solutionSection = document.getElementById('solution');

    if (!backToTopBtn || !solutionSection) return;

    const handleScroll = () => {
        const solutionPosition = solutionSection.offsetTop;
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollPosition >= solutionPosition) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    };

    backToTopBtn.addEventListener('click', () => {
        const scrollDuration = 500;
        const scrollStep = -window.scrollY / (scrollDuration / 15);

        const scrollInterval = setInterval(() => {
            if (window.scrollY !== 0) {
                window.scrollBy(0, scrollStep);
            } else {
                clearInterval(scrollInterval);
            }
        }, 15);
    });

    window.addEventListener('scroll', handleScroll);
    handleScroll();
});
