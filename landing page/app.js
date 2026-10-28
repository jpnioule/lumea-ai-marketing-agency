/* ----------------------------------------------------
   LUMÉA - Application Logic
   Interactive elements, Cart Management & Smooth Animations
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================
       1. Sticky Header Scroll Effect
       ========================================== */
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================
       2. Mobile Navigation Drawer
       ========================================== */
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    let mobileNavDrawer = null;

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            // Check if drawer already exists
            if (!mobileNavDrawer) {
                mobileNavDrawer = document.createElement('div');
                mobileNavDrawer.className = 'mobile-nav-drawer';
                
                const mobileNavLinks = document.createElement('nav');
                mobileNavLinks.className = 'mobile-nav-links';
                
                // Clone header navigation links
                const navLinksList = document.querySelectorAll('.nav-links a');
                navLinksList.forEach(link => {
                    const clone = link.cloneNode(true);
                    // Close drawer when a link is clicked
                    clone.addEventListener('click', () => {
                        toggleMobileMenu(false);
                    });
                    mobileNavLinks.appendChild(clone);
                });
                
                mobileNavDrawer.appendChild(mobileNavLinks);
                document.body.appendChild(mobileNavDrawer);
            }

            const isOpen = mobileNavDrawer.classList.contains('open');
            toggleMobileMenu(!isOpen);
        });
    }

    function toggleMobileMenu(show) {
        if (show) {
            mobileNavDrawer.classList.add('open');
            document.body.classList.add('mobile-nav-active');
            // Change menu icon to "X"
            mobileMenuToggle.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
        } else {
            if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
            document.body.classList.remove('mobile-nav-active');
            // Reset to hamburger icon
            mobileMenuToggle.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;
        }
    }

    /* ==========================================
       3. Ingredient Accordion (FAQ-style)
       ========================================== */
    const accordionItems = document.querySelectorAll('.ingredient-item');

    accordionItems.forEach(item => {
        const headerBtn = item.querySelector('.ingredient-header');
        
        headerBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items first
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.ingredient-header').setAttribute('aria-expanded', 'false');
            });
            
            // If the item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                headerBtn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ==========================================
       4. Testimonial Carousel
       ========================================== */
    const track = document.getElementById('testimonial-track');
    const slides = Array.from(track ? track.children : []);
    const prevButton = document.getElementById('carousel-prev');
    const nextButton = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    
    let currentSlideIndex = 0;
    let autoplayTimer = null;

    if (slides.length > 0) {
        const dots = Array.from(dotsContainer.children);
        
        const updateCarousel = (index) => {
            // Move track
            track.style.transform = `translateX(-${index * 100}%)`;
            
            // Update active states
            slides.forEach((slide, idx) => {
                if (idx === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
            
            dots.forEach((dot, idx) => {
                if (idx === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            currentSlideIndex = index;
        };

        const nextSlide = () => {
            let nextIndex = currentSlideIndex + 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            updateCarousel(nextIndex);
        };

        const prevSlide = () => {
            let prevIndex = currentSlideIndex - 1;
            if (prevIndex < 0) prevIndex = slides.length - 1;
            updateCarousel(prevIndex);
        };

        // Event Listeners
        nextButton.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });

        prevButton.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateCarousel(index);
                resetAutoplay();
            });
        });

        // Autoplay
        const startAutoplay = () => {
            autoplayTimer = setInterval(nextSlide, 6000);
        };

        const resetAutoplay = () => {
            clearInterval(autoplayTimer);
            startAutoplay();
        };

        startAutoplay();
    }

    /* ==========================================
       5. Shopping Cart State & Actions
       ========================================== */
    let cart = [];

    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBadge = document.getElementById('cart-badge');
    
    // Toggle Cart Drawer
    function toggleCart(open) {
        if (open) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Stop page scroll
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (cartToggle) cartToggle.addEventListener('click', () => toggleCart(true));
    if (cartClose) cartClose.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));
    
    // Add to Cart Buttons
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                img: card.dataset.img,
                subtitle: card.querySelector('.product-subtitle').textContent,
                quantity: 1
            };
            addToCart(product);
        });
    });

    // Add to Cart Function
    function addToCart(product) {
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(product);
        }
        
        updateCartUI();
        showToast(product.name);
        bumpBadge();
        
        // Open drawer on add
        setTimeout(() => {
            toggleCart(true);
        }, 300);
    }

    // Bump Badge Animation
    function bumpBadge() {
        cartBadge.classList.add('bump');
        setTimeout(() => {
            cartBadge.classList.remove('bump');
        }, 300);
    }

    // Show Toast Notification
    const toast = document.getElementById('notification-toast');
    const toastText = document.getElementById('notification-text');
    let toastTimeout = null;

    function showToast(name) {
        if (toastTimeout) clearTimeout(toastTimeout);
        
        toastText.innerHTML = `<strong>${name}</strong> a été ajouté au panier.`;
        toast.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update Quantity
    window.changeQuantity = function(id, delta) {
        const item = cart.find(item => item.id === id);
        if (!item) return;
        
        item.quantity += delta;
        
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    };

    // Remove from Cart
    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    };

    // Update UI elements
    function updateCartUI() {
        const cartEmptyState = document.getElementById('cart-empty-state');
        const cartList = document.getElementById('cart-list');
        const cartFooter = document.getElementById('cart-drawer-footer');
        const cartCount = document.getElementById('cart-drawer-count');
        const subtotalPrice = document.getElementById('cart-subtotal-price');
        
        // Calculate totals
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update badge and header counter
        cartBadge.textContent = totalItems;
        cartCount.textContent = totalItems;
        
        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartList.style.display = 'none';
            cartFooter.style.display = 'none';
        } else {
            cartEmptyState.style.display = 'none';
            cartList.style.display = 'flex';
            cartFooter.style.display = 'block';
            
            // Render items
            cartList.innerHTML = '';
            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-img-container">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <p class="cart-item-subtitle">${item.subtitle}</p>
                        <div class="cart-item-row">
                            <div class="quantity-selector">
                                <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
                                <span class="qty-num">${item.quantity}</span>
                                <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                            </div>
                            <span class="cart-item-price">${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Supprimer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                `;
                cartList.appendChild(li);
            });
            
            // Subtotal
            subtotalPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
        }
        
        // Update Free Shipping Progress Bar
        const shippingProgress = document.getElementById('cart-shipping-progress');
        const shippingText = document.getElementById('cart-shipping-text');
        const progressBarFill = document.getElementById('cart-shipping-progress-bar');
        
        if (shippingProgress && shippingText && progressBarFill) {
            if (cart.length === 0) {
                shippingText.innerHTML = `Plus que <strong>50,00 €</strong> pour la livraison gratuite !`;
                progressBarFill.style.width = `0%`;
            } else {
                const threshold = 50.00;
                if (totalPrice >= threshold) {
                    shippingText.innerHTML = `Félicitations ! Vous bénéficiez de la <strong>livraison gratuite</strong> ! 📦`;
                    progressBarFill.style.width = `100%`;
                    progressBarFill.style.backgroundColor = `var(--primary)`;
                } else {
                    const remaining = threshold - totalPrice;
                    shippingText.innerHTML = `Plus que <strong>${remaining.toFixed(2).replace('.', ',')} €</strong> pour la livraison gratuite !`;
                    progressBarFill.style.width = `${(totalPrice / threshold) * 100}%`;
                    progressBarFill.style.backgroundColor = `var(--accent)`;
                }
            }
        }
    }

    /* ==========================================
       6. Checkout Simulation
       ========================================== */
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Félicitations ! Simulation de commande réussie.\nMerci d\'avoir découvert Luméa Cosmétiques.');
            cart = [];
            updateCartUI();
            toggleCart(false);
        });
    }

    /* ==========================================
       7. Newsletter Signup handling
       ========================================== */
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterSuccess = document.getElementById('newsletter-success');

    // URL du webhook n8n (workflow de nurturing email Luméa)
    const LUMEA_WEBHOOK_URL = 'https://jean225.app.n8n.cloud/webhook/lumea-nouveau-lead';

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const prenomInput = document.getElementById('newsletter-prenom');
            const produitSelect = document.getElementById('newsletter-produit');

            if (emailInput && emailInput.value) {
                fetch(LUMEA_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput.value,
                        prenom: prenomInput ? prenomInput.value : '',
                        produit_consulte: produitSelect ? produitSelect.value : ''
                    })
                }).catch((err) => {
                    console.error('Erreur lors de l\'envoi au webhook n8n :', err);
                });

                newsletterForm.style.display = 'none';
                newsletterSuccess.style.display = 'block';
                emailInput.value = '';
                if (prenomInput) prenomInput.value = '';
                if (produitSelect) produitSelect.selectedIndex = 0;
            }
        });
    }

    // Add empty click logic to CTA links that link to #best-sellers for styling feel
    const shopCta = document.getElementById('cart-empty-cta');
    if (shopCta) {
        shopCta.addEventListener('click', () => {
            toggleCart(false);
        });
    }

    /* ==========================================
       8. Chatbot Widget Functionality
       ========================================== */
    const chatbotTrigger = document.getElementById('chatbot-trigger');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotBody = document.getElementById('chatbot-body');
    const chatbotInputForm = document.getElementById('chatbot-input-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotNotification = document.getElementById('chatbot-notification');
    const chatIcon = chatbotTrigger ? chatbotTrigger.querySelector('.chat-icon') : null;
    const closeIcon = chatbotTrigger ? chatbotTrigger.querySelector('.close-icon') : null;

    if (chatbotTrigger && chatbotWindow) {
        // Toggle Chatbot Window
        chatbotTrigger.addEventListener('click', () => {
            const isOpen = chatbotWindow.classList.contains('open');
            toggleChat(!isOpen);
        });

        if (chatbotCloseBtn) {
            chatbotCloseBtn.addEventListener('click', () => {
                toggleChat(false);
            });
        }

        // Hide notification badge when opening chat for the first time
        function toggleChat(open) {
            if (open) {
                chatbotWindow.classList.add('open');
                if (chatbotNotification) chatbotNotification.style.display = 'none';
                if (chatIcon) chatIcon.style.display = 'none';
                if (closeIcon) closeIcon.style.display = 'block';
                setTimeout(() => chatbotInput.focus(), 300);
            } else {
                chatbotWindow.classList.remove('open');
                if (chatIcon) chatIcon.style.display = 'block';
                if (closeIcon) closeIcon.style.display = 'none';
            }
        }

        // Setup Suggested Quick Replies
        const setupQuickReplies = () => {
            const quickReplies = document.querySelectorAll('.quick-reply');
            quickReplies.forEach(btn => {
                btn.replaceWith(btn.cloneNode(true)); // Clear existing listeners to avoid duplicates
            });
            
            const newQuickReplies = document.querySelectorAll('.quick-reply');
            newQuickReplies.forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.textContent;
                    const questionKey = btn.dataset.question;
                    handleUserMessage(text, questionKey);
                });
            });
        };
        setupQuickReplies();

        // Liens du pied de page (FAQ, livraison, retours) : ouvrent l'assistant, avec la question si besoin
        document.querySelectorAll('[data-open-chat]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                toggleChat(true);
                const question = link.dataset.openChat;
                if (question) setTimeout(() => handleUserMessage(question), 350);
            });
        });

        // Handle User Input Submission
        if (chatbotInputForm) {
            chatbotInputForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = chatbotInput.value.trim();
                if (text) {
                    handleUserMessage(text);
                    chatbotInput.value = '';
                }
            });
        }

        // Handle and display user message, then schedule bot response
        function handleUserMessage(text, key = null) {
            // Remove quick replies container to keep history clean
            const existingReplies = document.getElementById('chat-quick-replies');
            if (existingReplies) {
                existingReplies.remove();
            }

            // Append User Message
            appendMessage(text, 'user');

            // Show Typing Indicator
            showTypingIndicator();

            // Simulate Bot Response
            setTimeout(() => {
                removeTypingIndicator();
                const botResponse = getBotResponse(text, key);
                appendMessage(botResponse, 'bot');
                
                // Append new quick replies if relevant
                appendQuickReplies();
            }, 1200);
        }

        // Append message block to chatbot body
        function appendMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message ${sender}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            if (sender === 'bot') {
                // Les réponses de l'assistant passent les **mots** en gras
                contentDiv.innerHTML = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            } else {
                // Le texte tapé par le visiteur est affiché tel quel, jamais interprété comme du HTML
                contentDiv.textContent = text;
            }
            
            msgDiv.appendChild(contentDiv);
            chatbotBody.appendChild(msgDiv);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }

        // Typing indicator
        function showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.id = 'chatbot-typing-indicator';
            indicator.innerHTML = `
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            `;
            chatbotBody.appendChild(indicator);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }

        // Remove typing indicator
        function removeTypingIndicator() {
            const indicator = document.getElementById('chatbot-typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }

        // Bot Response Engine
        function getBotResponse(text, key) {
            const cleaned = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // Testé en premier : « Comment retourner… » ne doit pas déclencher la réponse sur la routine
            if (cleaned.includes('retour') || cleaned.includes('rembours') || cleaned.includes('echange') || cleaned.includes('renvoyer')) {
                return `Les retours sont **gratuits sous 30 jours** après réception. Contactez-nous avec votre numéro de commande : nous vous envoyons une étiquette prépayée, et le remboursement est effectué dès réception du colis. 🔄`;
            }

            
            if (key === 'peau_sensible' || cleaned.includes('sensible') || cleaned.includes('rougeur') || cleaned.includes('irrit') || cleaned.includes('bouton') || cleaned.includes('acne')) {
                return `Pour les peaux sensibles, délicates ou réactives, nous recommandons le rituel suivant :<br>
                1. **Gel Nettoyant Purifiant** à l'Aloe Vera apaisant.<br>
                2. **Brume Tonique Active** à la rose de Damas, qui apaise et rafraîchit.<br>
                3. **Crème Hydratante Intense** enrichie en Jojoba pour réparer la barrière cutanée.<br>
                <a href="#best-sellers">Acheter la collection</a>`;
            }
            
            if (key === 'actifs_bio' || cleaned.includes('actif') || cleaned.includes('ingredient') || cleaned.includes('composition') || cleaned.includes('formule')) {
                return `Nos formules concentrent des actifs végétaux issus de l’agriculture biologique :<br>
                - **Acide hyaluronique végétal**, obtenu par fermentation, pour hydrater.<br>
                - **Aloe Vera Natif** pour hydrater et apaiser.<br>
                - **Hydrolat de Rose de Damas** pour rééquilibrer et illuminer.<br>
                - **Thé vert**, antioxydant, pour aider à protéger la peau des agressions extérieures.<br>
                <a href="#ingredients">En savoir plus</a>`;
            }
            
            if (key === 'routine_etapes' || cleaned.includes('routine') || cleaned.includes('comment') || cleaned.includes('etapes') || cleaned.includes('utiliser') || cleaned.includes('rituel') || cleaned.includes('ordre')) {
                return `Le Rituel Luméa s'applique matin et soir :<br>
                **Étape 1** : Nettoyez délicatement votre visage avec le Gel Purifiant.<br>
                **Étape 2** : Vaporisez la Brume Tonique pour réveiller l'éclat.<br>
                **Étape 3** : Appliquez l'Élixir Éclat le matin et la Crème Intense le soir.<br>
                <a href="#routine">Découvrir les étapes</a>`;
            }
            
            if (key === 'vegan_cruelty' || cleaned.includes('vegan') || cleaned.includes('animaux') || cleaned.includes('bio') || cleaned.includes('label') || cleaned.includes('certif')) {
                return `Oui ! Luméa est une marque engagée :<br>
                - **100% de nos soins sont véganes** et non testés sur les animaux (cruelty-free).<br>
                - **Ingrédients issus de l’agriculture biologique**.<br>
                - **Flacons en verre givré recyclable** et étuis en carton FSC.<br>
                Aucun paraben, silicone ou parfum de synthèse n'est utilisé. 🌿`;
            }

            if (cleaned.includes('bonjour') || cleaned.includes('salut') || cleaned.includes('hello') || cleaned.includes('coucou')) {
                return `Bonjour ! C'est un plaisir de vous aider. N'hésitez pas à me poser vos questions sur nos soins ou sur votre type de peau ! 😊`;
            }

            if (cleaned.includes('prix') || cleaned.includes('tarif') || cleaned.includes('cher') || cleaned.includes('combien')) {
                return `Nos prix varient de **24,00 €** pour le Gel Nettoyant à **42,00 €** pour notre Élixir Éclat à la Vitamine C. Profitez de **-15 % sur votre première commande** en vous inscrivant à notre newsletter en bas de page ! ✨`;
            }

            if (cleaned.includes('livraison') || cleaned.includes('frais de port') || cleaned.includes('envoi') || cleaned.includes('livrer')) {
                return `La livraison à domicile est **offerte dès 50,00 € d'achat** en France et en Europe. Les commandes sont expédiées sous 24h et livrées sous 2 à 4 jours ouvrés. 📦`;
            }
            
            return `Je n'ai pas tout à fait compris votre demande. Je suis encore en formation, mais je peux vous guider sur nos routines ! 😊<br>
            Vous pouvez essayer de me demander : "Peau sensible", "Nos actifs bio", "Comment utiliser la routine" ou "Livraison".`;
        }

        // Add suggested quick replies back after a response
        function appendQuickReplies() {
            const repliesDiv = document.createElement('div');
            repliesDiv.className = 'chat-quick-replies';
            repliesDiv.id = 'chat-quick-replies';
            repliesDiv.innerHTML = `
                <button class="quick-reply" data-question="peau_sensible">Peau sensible, que choisir ?</button>
                <button class="quick-reply" data-question="actifs_bio">Vos actifs bio phares ?</button>
                <button class="quick-reply" data-question="routine_etapes">Comment utiliser le rituel ?</button>
                <button class="quick-reply" data-question="vegan_cruelty">Produits véganes & bio ?</button>
            `;
            chatbotBody.appendChild(repliesDiv);
            setupQuickReplies(); // Re-bind event listeners to the new buttons
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }
    }

    /* ==========================================
       9. Elegant Scroll Reveal Animations
       ========================================== */
    const revealElements = document.querySelectorAll(
        '.step-card, .product-card, .ingredient-item, .section-header, .value-props, .testimonial-card, .newsletter-container'
    );
    
    // Add reveal class to trigger scroll animations
    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                revealObserver.unobserve(entry.target); // Trigger animation only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
});
