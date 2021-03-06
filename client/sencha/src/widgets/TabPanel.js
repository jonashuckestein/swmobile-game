/**
 * @class Ext.TabBar
 * @extends Ext.Panel
 * @xtype tabbar
 */
Ext.TabBar = Ext.extend(Ext.Panel, {
    cmpCls: 'x-tabbar',

    /**
     * @type {Ext.Tab}
     * Read-only property of the currently active tab.
     */
    activeTab: null,

    // @private
    defaultType: 'tab',

    /**
     * @cfg {Boolean} sortable
     * Enable sorting functionality for the TabBar.
     */
    sortable: false,

    /**
     * @cfg {Number} sortHoldThreshold
     * Duration in milliseconds that a user must hold a tab
     * before dragging. The sortable configuration must be set for this setting
     * to be used.
     */
    sortHoldThreshold: 350,

    // @private
    initComponent : function() {
        /**
         * @event change
         * @param {Ext.TabBar} this
         * @param {Ext.Tab} tab The Tab button
         * @param {Ext.Component} card The component that has been activated
         */
        this.addEvents('change');

        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'middle'
        });

        Ext.TabBar.superclass.initComponent.call(this);

        var cardLayout = this.cardLayout;
        if (cardLayout) {
            this.cardLayout = null;
            this.setCardLayout(cardLayout);
        }
    },

    // @private
    initEvents : function() {
        if (this.sortable) {
            this.sortable = new Ext.util.Sortable(this.el, {
                itemSelector: '.x-tab',
                direction: 'horizontal',
                delay: this.sortHoldThreshold,
                constrain: true
            });
            this.mon(this.sortable, 'sortchange', this.onSortChange, this);
        }

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });

        Ext.TabBar.superclass.initEvents.call(this);
    },

    // @private
    onTap : function(e, t) {
        t = e.getTarget('.x-tab');
        if (t) {
            this.onTabTap(Ext.getCmp(t.id));
        }
    },

    // @private
    onSortChange : function(sortable, el, index) {
    },

    // @private
    onTabTap : function(tab) {
        this.activeTab = tab;
        if (this.cardLayout) {
            this.cardLayout.setActiveItem(tab.card);
        }
        this.fireEvent('change', this, tab, tab.card);
    },

    // @private
    setCardLayout : function(layout) {
        if (this.cardLayout) {
            this.mun(this.cardLayout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
        this.cardLayout = layout;
        if (layout) {
            this.mon(layout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
    },

    // @private
    onCardAdd : function(panel, card) {
        this.add({
            xtype: 'tab',
            card: card
        });
    },

    // @private
    onCardRemove : function(panel, card) {
        var items = this.items.items,
            ln = items.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.card === card) {
                this.remove(item, true);
                return;
            }
        }
    },

    getCardLayout : function() {
        return this.cardLayout;
    }
});

Ext.reg('tabbar', Ext.TabBar);


/**
 * @class Ext.Tab
 * @extends Ext.Button
 * @xtype tab
 */
Ext.Tab = Ext.extend(Ext.Button, {
    /**
     * @type {Boolean}
     * Set to true if this button is an Ext.Tab
     */
    isTab: true,
    baseCls: 'x-tab',

    /**
     * @cfg {String} pressedCls
     * The CSS class to be applied to a Tab when it is pressed. Defaults to 'x-tab-pressed'.
     * Providing your own CSS for this class enables you to customize the pressed state.
     */
    pressedCls: 'x-tab-pressed',

    /**
     * @cfg {String} activeCls
     * The CSS class to be applied to a Tab when it is active. Defaults to 'x-tab-active'.
     * Providing your own CSS for this class enables you to customize the active state.
     */
    activeCls: 'x-tab-active',

    // @private
    initComponent : function() {
        this.addEvents(
            /**
             * @event activate
             * @param {Ext.Tab} this
             */
            'activate',
            /**
             * @event deactivate
             * @param {Ext.Tab} this
             */
            'deactivate'
        );

        Ext.Tab.superclass.initComponent.call(this);

        var card = this.card;
        if (card) {
            this.card = null;
            this.setCard(card);
        }
    },

    /**
     * Sets the card associated with this tab
     */
    setCard : function(card) {
        if (this.card) {
            this.mun(this.card, {
                activate: this.activate,
                deactivate: this.deactivate,
                scope: this
            });
        }
        this.card = card;
        if (card) {
            Ext.apply(this, card.tab || {});
            this.setText(this.title || card.title || this.text );
            this.setIconClass(this.iconCls || card.iconCls);
            this.setBadge(this.badgeText || card.badgeText);

            this.mon(card, {
                beforeactivate: this.activate,
                beforedeactivate: this.deactivate,
                scope: this
            });
        }
    },

    /**
     * Retrieves a reference to the card associated with this tab
     * @returns {Mixed} card
     */
    getCard : function() {
        return this.card;
    },

    // @private
    activate : function() {
        this.el.addClass(this.activeCls);
        this.fireEvent('activate', this);
    },

    // @private
    deactivate : function() {
        this.el.removeClass(this.activeCls);
        this.fireEvent('deactivate', this);
    }
});

Ext.reg('tab', Ext.Tab);

/**
 * @class Ext.TabPanel
 * @extends Ext.Panel
 * @xtype tabpanel
 *
 * TabPanel is a Container which can hold other components to be accessed in a tabbed
 * interface.
 *
 * <pre><code>
new Ext.TabPanel({
    fullscreen: true,
    ui: 'dark',
    sortable: true,
    items: [{
        title: 'Tab 1',
        html: '1',
        cls: 'card1'
    }, {
        title: 'Tab 2',
        html: '2',
        cls: 'card2'
    }, {
        title: 'Tab 3',
        html: '3',
        cls: 'card3'
    }]
});</code></pre>
 */
Ext.TabPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} animation
     * Animation to be used during transitions of cards.
     * Any valid value from Ext.anims can be used ('fade', 'slide', 'flip', 'cube', 'pop', 'wipe').
     * Defaults to null.
     */
    animation: null,

    /**
     * @cfg {String} tabBarPosition
     * Where to dock the Ext.TabPanel. Valid values are 'top' and 'bottom'.
     */
    tabBarPosition: 'top',
    cmpCls: 'x-tabpanel',

    /**
     * @cfg {String} ui
     * Defaults to 'dark'.
     */
    ui: 'dark',

    /**
     * @cfg {Object} layout
     * @hide
     */

    /**
     * @cfg {Object} tabBar
     * An Ext.TabBar configuration
     */

    /**
     * @cfg {Boolean} sortable
     * Enable sorting functionality for the TabBar.
     */

    // @private
    initComponent : function() {
        var layout = new Ext.layout.CardLayout();
        this.layout = null;
        this.setLayout(layout);

        this.tabBar = new Ext.TabBar(Ext.apply({}, this.tabBar || {}, {
            cardLayout: layout,
            animation: this.animation,
            dock: this.tabBarPosition,
            ui: this.ui,
            sortable: this.sortable
        }));

        if (this.dockedItems && !Ext.isArray(this.dockedItems)) {
            this.dockedItems = [this.dockedItems];
        }
        else if (!this.dockedItems) {
            this.dockedItems = [];
        }
        this.dockedItems.push(this.tabBar);

        Ext.TabPanel.superclass.initComponent.call(this);
    },

    /**
     * Retrieves a reference to the Ext.TabBar associated with the TabPanel.
     * @returns {Ext.TabBar} tabBar
     */
    getTabBar : function() {
        return this.tabBar;
    },
    
    afterLayout : function() {
        Ext.TabPanel.superclass.afterLayout.call(this);
        this.getTabBar().doLayout();
    }
});

Ext.reg('tabpanel', Ext.TabPanel);
