document.addEventListener("DOMContentLoaded", function() {
    function scrollLeft() {
        const cardWrapper = document.querySelector('.card-wrapper');
        cardWrapper.scrollBy({
            top: 0,
            left: -320,
            behavior: 'smooth'
        });
    }

    function scrollRight() {
        const cardWrapper = document.querySelector('.card-wrapper');
        cardWrapper.scrollBy({
            top: 0,
            left: 320,
            behavior: 'smooth'
        });
    }

    document.querySelector('.button-left').addEventListener('click', scrollLeft);
    document.querySelector('.button-right').addEventListener('click', scrollRight);
});
