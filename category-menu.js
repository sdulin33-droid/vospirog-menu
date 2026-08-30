(function(){

'use strict';


/* =========================================================
   CONFIG
   ========================================================= */

var CATEGORIES = [

    {
        title: 'Сытные пироги',
        target: 'sit'
    },

    {
        title: 'Сладкие пироги',
        target: 'slad'
    },

    {
        title: 'Пирожки',
        target: null
    },

    {
        title: 'Десерты',
        target: null
    },

    {
        title: 'Напитки',
        target: null
    }

];


var state = {

    menu: null,

    placeholder: null,

    items: [],

    sections: [],

    menuTop: 0,

    menuHeight: 64,

    isFixed: false,

    initialized: false,

    raf: 0

};


/* =========================================================
   SCROLL
   ========================================================= */

function getScrollY(){

    return (
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0
    );

}


/* =========================================================
   FIND TARGET
   ========================================================= */

function findTarget(id){

    if(!id){

        return null;

    }


    var element =
        document.getElementById(id);


    if(!element){

        try{

            element =
                document.querySelector(
                    '[name="' +
                    CSS.escape(id) +
                    '"]'
                );

        }catch(e){

            element =
                document.querySelector(
                    '[name="' +
                    id +
                    '"]'
                );

        }

    }


    return element || null;

}


/* =========================================================
   ACTIVE
   ========================================================= */

function setActive(item){

    state.items.forEach(
        function(element){

            element.classList.remove(
                'is-active'
            );

        }
    );


    if(item){

        item.classList.add(
            'is-active'
        );

    }

}


/* =========================================================
   COLLECT SECTIONS
   ========================================================= */

function collectSections(){

    state.sections = [];


    state.items.forEach(
        function(item){

            var id =
                item.getAttribute(
                    'data-target'
                );


            if(!id){

                return;

            }


            var target =
                findTarget(id);


            if(!target){

                return;

            }


            state.sections.push({

                item: item,

                target: target,

                id: id

            });

        }
    );

}


/* =========================================================
   SCROLL SPY
   ========================================================= */

function updateActiveCategory(){

    if(
        !state.sections.length ||
        !state.menu
    ){

        return;

    }


    var scrollPosition =
        getScrollY();


    var menuHeight =
        state.menu.offsetHeight ||
        state.menuHeight;


    var checkPosition =
        scrollPosition +
        menuHeight +
        80;


    var current =
        state.sections[0];


    state.sections.forEach(
        function(section){

            var sectionTop =
                section.target
                    .getBoundingClientRect()
                    .top +
                scrollPosition;


            if(
                sectionTop <=
                checkPosition
            ){

                current =
                    section;

            }

        }
    );


    if(current){

        setActive(
            current.item
        );

    }

}


/* =========================================================
   MENU CLICK
   ========================================================= */

function handleCategoryClick(event){

    var item =
        event.currentTarget;


    var targetId =
        item.getAttribute(
            'data-target'
        );


    /*
     * Эти пункты пока без якорей.
     */

    if(!targetId){

        return;

    }


    var target =
        findTarget(
            targetId
        );


    if(!target){

        console.warn(
            'VP MENU: не найден #' +
            targetId
        );

        return;

    }


    event.preventDefault();

    event.stopPropagation();


    setActive(
        item
    );


    var targetTop =
        target
            .getBoundingClientRect()
            .top +
        getScrollY();


    var offset =
        (
            state.menu.offsetHeight ||
            state.menuHeight
        ) +
        20;


    window.scrollTo({

        top:
            Math.max(
                0,
                targetTop - offset
            ),

        behavior:
            'smooth'

    });

}


/* =========================================================
   CREATE MENU
   ========================================================= */

function createMenu(){

    /*
     * Если меню уже существует,
     * второе не создаём.
     */

    var existing =
        document.querySelector(
            '.vp-category-menu'
        );


    if(existing){

        return existing;

    }


    var menu =
        document.createElement(
            'div'
        );


    menu.className =
        'vp-category-menu';


    menu.setAttribute(
        'data-vp-cloudflare-menu',
        '1'
    );


    var inner =
        document.createElement(
            'div'
        );


    inner.className =
        'vp-category-menu__inner';


    CATEGORIES.forEach(
        function(category,index){

            var button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';


            button.className =
                'vp-category-menu__item';


            if(
                index === 0
            ){

                button.classList.add(
                    'is-active'
                );

            }


            if(
                category.target
            ){

                button.setAttribute(
                    'data-target',
                    category.target
                );

            }


            button.textContent =
                category.title;


            inner.appendChild(
                button
            );

        }
    );


    menu.appendChild(
        inner
    );


    /*
     * Ставим меню перед #sit.
     */

    var sit =
        document.getElementById(
            'sit'
        );


    if(
        sit &&
        sit.parentNode
    ){

        sit.parentNode.insertBefore(
            menu,
            sit
        );

    }else{

        var allRecords =
            document.getElementById(
                'allrecords'
            );


        if(allRecords){

            allRecords.insertBefore(
                menu,
                allRecords.firstChild
            );

        }else{

            document.body.insertBefore(
                menu,
                document.body.firstChild
            );

        }

    }


    return menu;

}


/* =========================================================
   RECALCULATE
   ========================================================= */

function recalculate(){

    if(
        !state.menu ||
        state.isFixed
    ){

        return;

    }


    state.menuTop =
        state.menu
            .getBoundingClientRect()
            .top +
        getScrollY();


    state.menuHeight =
        state.menu.offsetHeight ||
        64;


    if(
        state.placeholder
    ){

        state.placeholder.style.height =
            state.menuHeight +
            'px';

    }

}


/* =========================================================
   UNFIX
   ========================================================= */

function unfixMenu(){

    if(
        !state.menu
    ){

        return;

    }


    state.isFixed =
        false;


    state.menu.classList.remove(
        'vp-menu-fixed'
    );


    if(
        state.placeholder
    ){

        state.placeholder.classList.remove(
            'vp-placeholder-active'
        );


        state.placeholder.style.height =
            '0px';

    }

}


/* =========================================================
   STICKY
   ========================================================= */

function updateSticky(){

    if(
        !state.menu
    ){

        return;

    }


    /*
     * =====================================================
     * STICKY РАБОТАЕТ НА ВСЕХ УСТРОЙСТВАХ.
     *
     * Здесь больше НЕТ проверки ширины экрана.
     * =====================================================
     */

    if(
        getScrollY() >=
        state.menuTop
    ){

        if(
            !state.isFixed
        ){

            state.isFixed =
                true;


            state.menuHeight =
                state.menu.offsetHeight ||
                64;


            if(
                state.placeholder
            ){

                state.placeholder.style.height =
                    state.menuHeight +
                    'px';


                state.placeholder.classList.add(
                    'vp-placeholder-active'
                );

            }


            state.menu.classList.add(
                'vp-menu-fixed'
            );

        }


    }else{

        if(
            state.isFixed
        ){

            unfixMenu();

        }

    }

}


/* =========================================================
   SCROLL UPDATE
   ========================================================= */

function scheduleScrollUpdate(){

    if(
        state.raf
    ){

        return;

    }


    state.raf =
        window.requestAnimationFrame(
            function(){

                state.raf =
                    0;


                updateSticky();

                updateActiveCategory();

            }
        );

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents(){

    state.items.forEach(
        function(item){

            if(
                item.getAttribute(
                    'data-vp-bound'
                ) === '1'
            ){

                return;

            }


            item.setAttribute(
                'data-vp-bound',
                '1'
            );


            item.addEventListener(
                'click',
                handleCategoryClick
            );

        }
    );


    window.addEventListener(
        'scroll',
        scheduleScrollUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        'resize',
        function(){

            /*
             * При resize пересчитываем
             * положение меню.
             */

            unfixMenu();


            setTimeout(
                function(){

                    recalculate();

                    collectSections();

                    updateSticky();

                    updateActiveCategory();

                },
                0
            );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   INIT
   ========================================================= */

function initCategoryMenu(){

    if(
        state.initialized
    ){

        return;

    }


    var menu =
        createMenu();


    if(
        !menu
    ){

        return;

    }


    state.menu =
        menu;


    /*
     * Placeholder сохраняет место,
     * когда меню становится fixed.
     */

    state.placeholder =
        document.createElement(
            'div'
        );


    state.placeholder.className =
        'vp-menu-placeholder';


    menu.parentNode.insertBefore(
        state.placeholder,
        menu
    );


    state.items =
        Array.prototype.slice.call(
            menu.querySelectorAll(
                '.vp-category-menu__item'
            )
        );


    collectSections();

    recalculate();

    bindEvents();

    updateSticky();

    updateActiveCategory();


    state.initialized =
        true;

}


/* =========================================================
   START
   ========================================================= */

function start(){

    initCategoryMenu();


    /*
     * Tilda может дорисовывать каталог
     * немного позже.
     */

    [
        300,
        800,
        1500,
        2500
    ].forEach(
        function(delay){

            setTimeout(
                function(){

                    collectSections();

                    recalculate();

                    updateSticky();

                    updateActiveCategory();

                },
                delay
            );

        }
    );

}


/* =========================================================
   DOM READY
   ========================================================= */

if(
    document.readyState ===
    'loading'
){

    document.addEventListener(
        'DOMContentLoaded',
        start
    );

}else{

    start();

}

})();
