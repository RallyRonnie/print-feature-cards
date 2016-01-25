Ext.override(Rally.ui.filter.CustomFilterPanel, {
    _getItems: function() {
        console.log(this.boxWidths);
        return [
            {
                xtype: 'container',
                cls: 'custom-filter-header',
                layout: 'column',
                defaults: {
                    xtype: 'component',
                    cls: 'filter-panel-label'
                },
                items: [
                    {
                        height: 1,
                        width: 30
                    },
                    {
                        html: 'Field',
                        width: this.boxWidths.field + 5 || 137
                    },
                    {
                        html: 'Operator',
                        width: this.boxWidths.operator + 5|| 137
                    },
                    {
                        html: 'Value',
                        width: this.boxWidths.value + 5 || 135
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'customFilterRows'
            }
        ];
    }
});
