
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // Camada visual premium: barra de progresso da página e cabeçalho ao rolar.
    const progressBar = document.getElementById("scroll-progress");
    const siteHeader = document.querySelector(".site-header");
    let scrollTicking = false;

    function updateScrollEffects() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

        if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
        scrollTicking = false;
    }

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(updateScrollEffects);
            scrollTicking = true;
        }
    }, { passive: true });
    updateScrollEffects();

    // Revela seções e cartões conforme entram na tela. Sem Observer, o conteúdo continua visível.
    const revealTargets = document.querySelectorAll(
        ".section-heading, .about-content, .artist-featured, .artist-card, .service-card, .gallery-card, .form-card"
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("IntersectionObserver" in window && !reduceMotion) {
        revealTargets.forEach((element, index) => {
            element.classList.add("js-reveal");
            if (element.classList.contains("artist-card") || element.classList.contains("service-card") || element.classList.contains("gallery-card")) {
                element.style.setProperty("--reveal-delay", `${(index % 4) * 75}ms`);
            }
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

        revealTargets.forEach((element) => revealObserver.observe(element));
    }
    // Ano automático no rodapé
    const currentYear = document.getElementById("current-year");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Impede selecionar uma data passada
    const dateInput = document.getElementById("booking-date");

    if (dateInput) {
        const today = new Date();
        const localToday = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        dateInput.min = localToday;
    }

    // Botões de seleção de artista
    const artistButtons = document.querySelectorAll(".artist-select");
    const artistSelect = document.getElementById("booking-artist");
    const bookingSection = document.getElementById("agendamento");

    artistButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const artistName = button.dataset.artist;

            if (artistSelect && artistName) {
                artistSelect.value = artistName;
            }

            if (bookingSection) {
                bookingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Organizador de ideias de tatuagem
    const ideaForm = document.getElementById("idea-form");
    const ideaResult = document.getElementById("idea-result");
    const ideaDescription = document.getElementById("idea-description");
    const ideaLocation = document.getElementById("idea-location");
    const bookingDescription = document.getElementById("booking-description");

    if (ideaForm) {
        ideaForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const description = ideaDescription.value.trim();
            const location = ideaLocation.value;

            if (!description || !location) {
                ideaResult.textContent =
                    "Preencha a descrição e a região do corpo.";
                return;
            }

            const preparedIdea =
                "Ideia da tatuagem: " + description +
                " | Região do corpo: " + location;

            if (bookingDescription) {
                bookingDescription.value = preparedIdea;
            }

            ideaResult.textContent =
                "Sua ideia foi organizada e copiada para o formulário de agendamento.";

            if (bookingSection) {
                bookingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    // Formulário de agendamento pelo WhatsApp
    const bookingForm = document.getElementById("booking-form");
    const bookingResult = document.getElementById("booking-result");

    if (bookingForm) {
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!bookingForm.reportValidity()) {
                return;
            }

            const formData = new FormData(bookingForm);

            const name = String(formData.get("name") || "").trim();
            const phone = String(formData.get("phone") || "").trim();
            const artist = String(formData.get("artist") || "");
            const date = String(formData.get("date") || "");
            const time = String(formData.get("time") || "");
            const style = String(formData.get("style") || "");
            const description =
                String(formData.get("description") || "").trim();

            if (
                !name ||
                !phone ||
                !artist ||
                !date ||
                !time ||
                !style ||
                !description
            ) {
                bookingResult.textContent =
                    "Confira se todos os campos obrigatórios foram preenchidos.";
                return;
            }

            const dateParts = date.split("-");
            const formattedDate = dateParts.length === 3
                ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
                : date;

            const message = [
                "Olá! Gostaria de solicitar um agendamento no Morellatos Tattoo Studio.",
                "",
                "Nome: " + name,
                "Telefone: " + phone,
                "Artista desejado: " + artist,
                "Data desejada: " + formattedDate,
                "Período desejado: " + time,
                "Estilo: " + style,
                "Ideia da tatuagem: " + description,
                "",
                "Gostaria de confirmar a disponibilidade desse horário."
            ].join("\n");

            // Confira se este número é o WhatsApp correto do estúdio.
            const whatsappNumber = "5511983775682";

            const whatsappUrl =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(message);

            bookingResult.textContent =
                "Se o WhatsApp não abrir automaticamente, use o link abaixo.";

            bookingResult.replaceChildren();

            const link = document.createElement("a");
            link.href = whatsappUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "text-link";
            link.textContent = "Abrir WhatsApp e enviar solicitação ↗";

            bookingResult.appendChild(link);

            window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
            );
        });
    }

    // Ampliar as fotos da galeria
    const galleryButtons = document.querySelectorAll(".gallery-card");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxClose = document.getElementById("lightbox-close");

    if (lightbox && lightboxImage && lightboxClose) {
        let previousFocus = null;

        function openLightbox(image) {
            if (!image || !image.src) return;

            previousFocus = document.activeElement;
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt || "Foto ampliada";
            lightbox.hidden = false;
            document.body.classList.add("no-scroll");
            lightboxClose.focus();
        }

        function closeLightbox() {
            lightbox.hidden = true;
            lightboxImage.removeAttribute("src");
            document.body.classList.remove("no-scroll");

            if (previousFocus && typeof previousFocus.focus === "function") {
                previousFocus.focus();
            }
        }

        galleryButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const image = button.querySelector("img");
                openLightbox(image);
            });
        });

        lightboxClose.addEventListener("click", closeLightbox);

        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !lightbox.hidden) {
                closeLightbox();
            }
        });
    }

    // Aviso para imagens que não forem encontradas
    document.querySelectorAll("img").forEach((image) => {
        image.addEventListener("error", () => {
            console.warn("Não foi possível carregar a imagem:", image.src);
            image.classList.add("image-error");
            image.alt = "Imagem não encontrada. Confira o nome do arquivo e a pasta imagens.";
        });
    });

    console.log("Morellatos Tattoo Studio: site carregado.");
});
