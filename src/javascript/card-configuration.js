Ext.define('Rally.technicalservices.CardConfiguration',{
    singleton: true,

    fetchFields: ["FormattedID","Name","State","Owner","InvestmentCategory","Description","Notes"],
    displayFields: {
        r1left: {
            dataIndex: function(recordData){
                return recordData.FormattedID + ': ' + recordData.Name;
            },
            maxLength: 40
        },
        r1right: {
            dataIndex: function(recordData){
                return (recordData.State && recordData.State.Name) || "No Entry";
            }
        },
        r2left: {
            dataIndex: 'Name',
            maxLength: 20
        },
        r2middle: {
            dataIndex: function(recordData){
                return recordData.Owner && recordData.Owner.DisplayName || "None";
            },
            maxLength: 20
        },
        r2right: {
            dataIndex: 'InvestmentCategory'
        },
        r3middle: {
            dataIndex: 'Description',
            maxLength: 255
        },
        r4middle: {
            dataIndex: 'Notes',
            maxLength: 255
        }
    }
});
