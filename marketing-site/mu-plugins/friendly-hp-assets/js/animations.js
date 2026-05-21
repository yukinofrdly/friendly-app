(() => {
    const titleTextClassQuery = ".title-animation";
    const subtitleTextClassQuery = ".subtitle-animation";
    const bakcgroundImagesClassQuery = ".bg-img-animation";
    const cubeAnimationClassQuery = ".cube-animation";
    const scrambleTextClassQuery = ".scrambletext-animation";
    const listAnimationClassQuery = ".lists-animation";
    const listEasingAnimationClassQuery = ".lists-easing-animation";
    const MARKERS_ENABLED = false;

    function splitAndAnimateTitles() {
        document.querySelectorAll(titleTextClassQuery).forEach(titleEl => {
            const split = new SplitText(titleEl, { type: "words, chars" });

            gsap.from(split.chars, {
                scrollTrigger: {
                    trigger: titleEl,
                    start: "top 80%",
                    end: "+=980",
                    toggleActions: "restart play restart play",
                    markers: MARKERS_ENABLED
                },
                duration: 1,
                y: 100,
                autoAlpha: 0,
                stagger: {
                    amount: 0.7,
                    from: 0
                }
            });
        });

        document.querySelectorAll(subtitleTextClassQuery).forEach(subEl => {
            gsap.from(subEl, {
                scrollTrigger: {
                    trigger: subEl,
                    start: "top 80%",
                    end: "+=980",
                    toggleActions: "restart play play play",
                    markers: MARKERS_ENABLED
                },
                duration: 1,
                x: 200,
                rotate: 90
            });
        });

        ScrollTrigger.refresh();
    }

    function backgroundImages() {
        document.querySelectorAll(bakcgroundImagesClassQuery).forEach(bakcgroundImage => {
            gsap.from(bakcgroundImage, {
                scrollTrigger: {
                    trigger: bakcgroundImage,
                    start: "top 80%",
                    end: "+=1580",
                    toggleActions: "restart play restart play",
                },
                duration: 3,
                x: -300,
                rotate: 360
            });
        });
    }

    function cards() {
        document.querySelectorAll(".case-card").forEach(card => {
            const bg = card.querySelector(".card-bg");
            const contents = card.querySelectorAll("& > *:not(.card-bg)");
            const tl = gsap.timeline({ paused: true });

            tl.to(bg, {
                yPercent: -100,
                duration: 0.7,
                ease: "power3.out"
            }).to(card, {
                scale: 0.9,
                duration: 0.5,
                ease: "power3.out"
            }, 0);

            contents.forEach(content => {
                tl.to(content, {
                    color: "#ffffff"
                }, 0);
            });

            card.addEventListener("mouseenter", () => tl.play());
            card.addEventListener("mouseleave", () => tl.reverse());
        });
    }

    function cubes() {
        document.querySelectorAll(cubeAnimationClassQuery).forEach(cubeElement => {
            gsap.from(cubeElement, {
                scrollTrigger: {
                    trigger: cubeElement,
                    start: "top 80%",
                    end: "+=1000",
                    toggleActions: "play none none none",
                    markers: MARKERS_ENABLED
                },
                xPercent: -100,
                duration: 1.5,
                ease: "power3.out",
                stagger: 0.2
            });
        });
    }

    function scrambleText() {
        document.querySelectorAll(scrambleTextClassQuery).forEach(scrambleContainer => {
            // Get all text elements inside
            const textElements = scrambleContainer.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
            
            // Set initial opacity to 0
            textElements.forEach(el => {
                el.style.opacity = '0';
            });

            ScrollTrigger.create({
                trigger: scrambleContainer,
                start: "top 80%",
                once: true, // Only animate once
                onEnter: () => {
                    const tl = gsap.timeline();
                    
                    textElements.forEach((el, index) => {
                        tl.to(el, {
                            opacity: 1,
                            duration: 1.5,
                            scrambleText: {
                                text: el.textContent,
                                chars: "あいうえおかきくけこさしすせそた",
                                speed: 0.8
                            }
                        }, index * 0.1); // Stagger each element
                    });
                },
                markers: MARKERS_ENABLED
            });
        });
    }

    function lists() {
        function isActiveClass(e) {
            return e.target.classList.contains("active")
        }

        document.querySelectorAll(listAnimationClassQuery).forEach(card => {
            const bg = card.querySelector(".faq-bg");
            const faqAnswer = card.querySelector(".faq-answer p");
            const contents = card.querySelectorAll("& > *:not(.faq-bg)");
            const tl = gsap.timeline({ paused: true });

           tl.to(bg, {
                xPercent: -100,
                duration: 0.7,
                ease: "power3.out"
            });

            const changeColor = { color: "#ffffff" };

            tl.to(faqAnswer, {...changeColor, scale: 0.9, duration: 1 }, 0);

            contents.forEach(content => {
                tl.to(content, changeColor, 0);
            });
            card.addEventListener("click", (e) => {
                isActiveClass(e) ? tl.play() : tl.reverse();
            });
            card.addEventListener("mouseenter", (e) => {
                isActiveClass(e) ? tl.reverse() : tl.play();
            });
            card.addEventListener("mouseleave", () => tl.reverse());
        });
    }

    function listsEasing() {
        const companyRows = document.querySelectorAll(`.company-table ${listEasingAnimationClassQuery}`);
        
        if (companyRows.length === 0) return;

        ScrollTrigger.create({
            trigger: ".company-header-wrapper",
            start: "top 80%",
            end: "+=1000",
            onEnter: () => {
                gsap.from(companyRows, {
                    xPercent: 100,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.1
                });
            },
            markers: MARKERS_ENABLED
        });
    }

    function buttonSubmit() {
        document.querySelectorAll(".contact-submit-btn").forEach(button => {
            const bg = button.querySelector(".contact-bg");
            const contactBtnIcon = button.querySelector(".contact-btn-icon");
            const contents = button.querySelectorAll("& > *:not(.contact-bg)");
            const tl = gsap.timeline({ paused: true });

           tl.to(bg, {
                xPercent: 100,
                duration: 0.7,
                ease: "power3.out"
            });

            const changeColor = { color: "#ffffff" };

            if (contactBtnIcon) {
                tl.to(contactBtnIcon, {...changeColor, background: "#ffffff" }, 0);
            }

            contents.forEach(content => {
                tl.to(content, changeColor, 0);
            });

            button.addEventListener("mouseenter", () => tl.play());
            button.addEventListener("mouseleave", () => tl.reverse());
        });
    }

    function solutionBackgroundLoop() {
    const bg1 = document.querySelector('.steps-bg-1');
    const bg2 = document.querySelector('.steps-bg-2');
    const bg3 = document.querySelector('.steps-bg-3');
    
    if (!bg1 || !bg2 || !bg3) return;

    // Background 1: Continuous movement RIGHT
    gsap.to(bg1, {
        backgroundPosition: "2000px center",
        duration: 40,
        ease: "none", // Linear = constant speed
        repeat: -1,
        modifiers: {
            backgroundPosition: (value) => {
                const x = parseFloat(value);
                return `${x % 2000}px center`;
            }
        }
    });

    // Background 2: Continuous movement LEFT (opposite direction)
    gsap.to(bg2, {
        backgroundPosition: "-2000px center",
        duration: 30, // Different speed for variety
        ease: "none",
        repeat: -1,
        modifiers: {
            backgroundPosition: (value) => {
                const x = parseFloat(value);
                return `${x % 2000}px center`;
            }
        }
    });

    // Background 3: Continuous movement RIGHT
    gsap.to(bg3, {
        backgroundPosition: "2000px center",
        duration: 40,
        ease: "none",
        repeat: -1,
        modifiers: {
            backgroundPosition: (value) => {
                const x = parseFloat(value);
                return `${x % 2000}px center`;
            }
        }
    });
    }   


    function animations() {
        gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
        splitAndAnimateTitles();
        cards();
        backgroundImages();
        cubes();
        scrambleText();
        lists();
        listsEasing();
        buttonSubmit();
        solutionBackgroundLoop(); 
        ScrollTrigger.refresh();
    }

    window.addEventListener("load", animations);
    window.addEventListener("resize", window.utils.debounced(() => {
        ScrollTrigger.refresh();
    }, 800));
})();