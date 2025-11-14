
"use strict";

document.addEventListener('DOMContentLoaded', (event) => {
    console.log(`${event.type} Event Fired`);
    const lottieAnimationTag = document.getElementById("lottie-animation");

    lottieAnimationTag.addEventListener('load' , () => {
        const hiddenTag = document.getElementById("hidden-404-text");
        hiddenTag.style.opacity = 1;
        hiddenTag.style.transition = 'opacity 2s ease-in-out';
    }, { once: true });
}, { once: true });