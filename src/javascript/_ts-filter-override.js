Ext.override(Rally.ui.filter.plugin.CustomFilterRowController, {
        _buildDataForOperator: function(records, field) {
            console.log('_buildDataForOperator', records, field);
            
            var operatorNames = _.map(records, function(record){
                return record.get('OperatorName');
            });

            var validOperatorNames = _.filter(operatorNames, function(operatorName){
                return operatorName !== 'containsall' && operatorName !== 'containsany';
            });

            return _.map(validOperatorNames, function(operatorName) {
                return {
                    name: operatorName,
                    displayName: field.isCollection() ? operatorName.replace('contains', '=') : operatorName
                };
            }).concat(this.view.additionalOperators || []);
        }

});

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
