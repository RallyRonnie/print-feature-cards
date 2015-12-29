Ext.define('Rally.technicalservices.window.PrintCards',{
    extend: 'Ext.Window',
    logger: new Rally.technicalservices.Logger(),
    truncateText: '...',
    config: {
        title: 'Print Feature Cards',
        records: null,
        styleSheetTitle: "printCards",
        currentDocument: null,
        /**
         *  Array of the following:
         *  dataIndex
         *  maxLength (default 0)
         *  cls (defaults are: card-title, content,
         */
        displayFields: null
    },
    constructor: function(config){
        this.initConfig(config);
    },
    show: function(){
        var options = "toolbar=1,menubar=1,scrollbars=yes,scrolling=yes,resizable=yes,width=1000,height=500";
        var win = window.open('',this.title);

        var html = this._buildCardsHTML();

        win.document.write('<html><head><title>' + this.title + '</title>');
        win.document.write('<style>');
        win.document.write(this._getStyleSheet(this.styleSheetTitle));
        win.document.write('</style>');
        win.document.write('</head><body class="landscape">');
        win.document.write(html);
        win.document.write('</body></html>');
    },
    _buildCardsHTML: function() {

        var html = '';
        var total_cards = this.records.length;
        var card_num = 0;

        var t = Ext.create('Rally.technicalservices.CardTemplate', {
            displayFields: Rally.technicalservices.CardConfiguration.displayFields
        });

        Ext.each(this.records, function(r){

            html += t.apply(r.getData());

            card_num ++;
            if ((card_num + 1) % 2 === 0) {
                html += '<div class=pb></div>';
            } else if (card_num === total_cards - 1) {
                html += '<div class=cb>&nbsp;</div>';
            }
        },this);
        //console.log('html',html);
        return html;
    },
    _getStyleSheet: function(styleSheetTitle) {
        this.logger.log('getStyleSheet');
        var styleSheet;
        // var docs = Ext.getDoc();
        var elems = this.currentDocument.query('style');

        for (var i=0; i< elems.length; i++){
            if (elems[i].title == styleSheetTitle){
                styleSheet = elems[i];
            }
        }
        return styleSheet.innerHTML;
    }
});