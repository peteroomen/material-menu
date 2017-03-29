(function ($) {
    var i = 0;
    var menus = {};

    $.fn.materialMenu = function (action, options) {
        var settings = $.extend({
            animationSpeed: 250,
            id: "material-menu-" + i++,
            position: "",
            items: []
        }, options);

        return this.each(function (item) {
            var parent = $(this);
            if (action === "init") {
                parent.uniqueId();
                var menu = getMenuForParent(parent);
                menu.element = $('<div class="material-menu"><ul></ul></div>');
                Ps.initialize(menu.element[0]);
                menu.parent = parent;
                menu.settings = settings;
                menu.items = [];

                settings.items.forEach(function (item) {
                    var item = $.extend({
                        text: "",
                        type: "normal",
                        click: function () { }
                    }, item);
                    if (item.type === 'toggle') {
                        var elStr = "<li class='check" + (item.checked ? "" : " unchecked") + "'></li>";
                        var itemElement = $(elStr)
                            .append("<i class='material-icons md-18'>check</i>")
                            .append("<span>" + item.text + "</span>")
                            .click(function () {
                                if (item.checked) {
                                    item.element.addClass('unchecked');
                                } else {
                                    item.element.removeClass('unchecked');
                                }
                                item.checked = !item.checked;
                                item.click(menu.parent, item.checked);
                                closeMenu(menu);
                            });
                    } else if (item.type === 'radio') {
                        var elStr = "<li class='check" + (item.checked ? "" : " unchecked") + "'></li>";
                        var itemElement = $(elStr)
                            .append("<i class='material-icons md-18'>check</i>")
                            .append("<span>" + item.text + "</span>")
                            .click(function () {
                                menu.items.forEach(function (otherItem) {
                                    if (otherItem.radioId === item.radioId) {
                                        if (otherItem == item) {
                                            item.element.removeClass('unchecked');
                                            otherItem.checked = false;
                                        } else {
                                            otherItem.element.addClass('unchecked');
                                            otherItem.checked = false;
                                        }
                                    }
                                });
                                item.click(menu.parent, item.checked);
                                closeMenu(menu);
                            });
                    } else if (item.type === 'divider') {
                        var itemElement = $("<li class='divider'></li>");
                    } else if (item.type === 'label') {
                        var itemElement = $("<li class='label'></li>")
                            .html(item.text);
                    } else if (item.type === 'normal') {
                        var itemElement = $("<li></li>")
                            .html(item.text)
                            .click(function () {
                                item.click(menu.parent);
                                closeMenu(menu);
                            });
                    } else {
                        console.log("Menu item with invalid type, type was: " + item.type);
                        return;
                    }
                    itemElement.uniqueId();
                    item.element = itemElement;
                    menu.element.children('ul').append(itemElement);
                    menu.items.push(item);
                });
                menu.element.attr('id', options.id);
                menu.element.hide();
                $('body').append(menu.element);

                return this;
            }

            if (action === "open") {
                var menu = getMenuForParent(parent);
                if (menu.open) {
                    return;
                }
                openMenu(menu);
                return this;
            }

            if (action === "close") {
                var menu = getMenuForParent(parent);
                if (!menu.open) {
                    return;
                }
                closeMenu(menu);
                return this;
            }
        });
    };

    function openMenu(menu) {
        menu.open = true;
        updatePos(menu);

        menu.element.css('opacity', 0)
          .slideDown(menu.settings.animationSpeed)
          .animate(
            { opacity: 1 },
            { queue: false, duration: 'slow' }
          );

        $(document).on('mousedown', function (event) {
            if (!$(event.target).closest(menu.element).length) {
                closeMenu(menu);
            }
        });
    }

    function closeMenu(menu) {
        menu.element.fadeOut(menu.settings.animationSpeed / 2, function () {
            menu.open = false;
        });
    }

    function updatePos(menu) {
        // position the div, according to it's parent using the worlds most hacky thing ever
        var offset = $("#" + menu.parent.attr('id')).offset();
        var left = offset.left;
        var top = offset.top + menu.parent.outerHeight();

        // If doing right hand positioning, subtract width
        if (menu.settings.position.indexOf('right') >= 0) {
            left -= menu.element.outerWidth() - menu.parent.outerWidth();
        }
        
        // If the menu is greater than 75% of the screen size, it should scroll
        menu.element.height('auto'); // so the height calculation works correctly
        var menuHeight = menu.element.outerHeight();
        var windowHeight = $(window).height();
        if (menuHeight > windowHeight * 0.75) {
            menu.element.height(windowHeight * 0.75);
            menuHeight = menu.element.outerHeight();
        }

        // Offset top, if the menu would appear below the screen (with 5px margin)
        var distanceFromBottom = windowHeight - menuHeight - top - 5;
        if (distanceFromBottom < 0) {
            // Need to adjust the menu, to make it fit the screen bounds
            if (distanceFromBottom > -menuHeight / 2) {
                menu.element.height(menu.element.height() + distanceFromBottom);

                // If doing overlay positioning, subtract height
                if (menu.settings.position.indexOf('overlay') >= 0) {
                    top -= menu.parent.outerHeight();
                }
            } else {
                top -= menuHeight;
                // If NOT doing overlay positioning, subtract height
                if (menu.settings.position.indexOf('overlay') == -1) {
                    top -= menu.parent.outerHeight();
                }
            }
        } else {
            //menu.element.height("auto");
            menu.element.removeClass('ps-active-y');
        }

        menu.element.css({ top: top, left: left });
        //menu.element.css('visibility', 'hidden');
        //menu.element.show();
    }

    function getMenuForParent(parent) {
        var id = parent.attr('id');
        if (menus[id] == undefined) {
            menus[id] = {};
        }
        return menus[id];
    }
}(jQuery));