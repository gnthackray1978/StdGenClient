/*POSTMAN CHROME EXTENSION
MANOWAR SLEIPNIR
*/

var JSMaster, QryStrUtils, AncUtils,Panels;

var BatchSearch = function () {
    this.tableMaker = new TableMaker();
    
    this.qryStrUtils = new QryStrUtils();
    this.ancUtils = new AncUtils();
 
    this.DEFAULT_INSERTPERSONS_URL = '/Batches/AddPersons';
    this.DEFAULT_INSERTMARRIAGES_URL = '/Batches/AddMarriages';
    this.DEFAULT_INSERTSOURCES_URL = '/Batches/AddSources';
    this.DEFAULT_INSERTPARISHS_URL = '/Batches/AddParishs';
    this.DEFAULT_REMOVEBATCH_URL = '/Batches/RemoveBatch';
    this.DEFAULT_BATCHSELECT_URL = '/Batches/GetBatches';
    
    this.DEFAULT_PERSONSHEET_URL = 'https://docs.google.com/spreadsheets/d/1nmAHAtyTSeqVNZ0oV0pW1gRSIiuok61ejEsOcy3rZvs/pub?output=csv';
    this.DEFAULT_MARRIAGESHEET_URL = 'https://docs.google.com/spreadsheets/d/1nmAHAtyTSeqVNZ0oV0pW1gRSIiuok61ejEsOcy3rZvs/pub?output=csv';
    this.DEFAULT_SOURCESHEET_URL = 'https://docs.google.com/spreadsheets/d/1nmAHAtyTSeqVNZ0oV0pW1gRSIiuok61ejEsOcy3rZvs/pub?output=csv';
    this.DEFAULT_PARISHSHEET_URL = 'https://docs.google.com/spreadsheets/d/1nmAHAtyTSeqVNZ0oV0pW1gRSIiuok61ejEsOcy3rZvs/pub?output=csv';
     
    this.selection = [];
  
    this.postParams = {
        url: '',
        data: '',
        idparam: undefined,
        refreshmethod: this.getBatches,
        refreshArgs: ['1'],
        Context: this
    };
}



BatchSearch.prototype = {

    init: function () {
         
        var panels = new Panels();

        $('body').on("click", "#main", $.proxy(function () { panels.genericShowPanel('1'); return false; }, panels));
        $('body').on("click", "#more", $.proxy(function () { panels.genericShowPanel('2'); return false; }, panels));
        $('body').on("click", "#refresh", $.proxy(function () { this.getBatches(); return false; }, this));

        $('body').on("click", "#import_persons", $.proxy(function () { this.ImportPersons(); return false; }, this));
        $('body').on("click", "#import_marriages", $.proxy(function () { this.ImportMarriages(); return false; }, this));
        $('body').on("click", "#import_sources", $.proxy(function () { this.ImportSources(); return false; }, this));
        $('body').on("click", "#import_parishs", $.proxy(function () { this.ImportParishs(); return false; }, this));
        
        // if (isActive == '1') {
        //     this.getBatches();
        // }
    },
    
    getBatches: function () {

        var params = {};

        params[0] = String($('#txtDescription').val());
        params[1] = '0';
        params[2] = '30';
        params[3] = 'TimeRun';

        this.ancUtils.twaGetJSON(this.DEFAULT_BATCHSELECT_URL, params, $.proxy(this.processData, this));

       
        return false;
    },

    processData: function (data) {

        var gDateTime = new GDateTime();

        var tableData = {
            column1Func : function(){console.log('hello1');},
            column4Func : function(){console.log('hello4');},
            column5Func : function(id){
                console.log('hello5');
                this.DeleteBatch(id);
            },
            rows : []
        }; 

        $.each(data.Batches, function (idx, value) {
            
            var rowObj ={
                id :value.BatchId,
                idx : idx,
                column1 : {
                    key :true,
                    isLink :true,
                    ref : value.Ref
                },
                column2 : {
                    isLink :false,
                    ref : gDateTime.getDateFromDOTNet(value.TimeRun).toUTCString()
                },
                column3 : {
                    isLink :false,
                    ref : value.IsDeleted
                },
                column4 : {
                    isLink :true,
                    ref : 'View Records'
                },
                column5 : {
                    isLink :true,
                    ref : 'Delete Records'
                }
            };
            
            tableData.rows.push(rowObj);
        });
        
        var pagerparams = { ParentElement: 'pager',
            Batch: data.Batch,
            BatchLength: data.BatchLength,
            Total: data.Total,
            Function: this.getLink,
            Context: this
        };
        
        this.tableMaker.MakeBody(tableData,pagerparams)
    },

    sort: function (sort_col) {
        this.qryStrUtils.sort_inner(sort_col);
        this.getBatches();
    },
    getLink: function (toPage) {
        this.qryStrUtils.updateQryPar('page', toPage);
        this.getBatches();
    },
    
    DeleteBatch: function (id) {
        this.postParams.url = this.DEFAULT_REMOVEBATCH_URL;
        this.postParams.data = { 
            batchId: id
        };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportPersons: function () {
        this.postParams.url = this.DEFAULT_INSERTPERSONS_URL;
   
        this.postParams.data = { 
            sheetUrl: this.DEFAULT_PERSONSHEET_URL, 
            batchRef: String($('#txtDescription').val())
        };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportMarriages: function () {
        this.postParams.url = this.DEFAULT_INSERTMARRIAGES_URL;
        this.postParams.data = { 
            sheetUrl: this.DEFAULT_MARRIAGESHEET_URL,
            batchRef: String($('#txtDescription').val())
        };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportParishs: function () {
        this.postParams.url = this.DEFAULT_INSERTPARISHS_URL;
        this.postParams.data = { 
            sheetUrl: this.DEFAULT_PARISHSHEET_URL,
            batchRef: String($('#txtDescription').val())
        };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    ImportSources: function () {
        this.postParams.url = this.DEFAULT_INSERTSOURCES_URL;
        this.postParams.data = { 
            sheetUrl: this.DEFAULT_SOURCESHEET_URL,
            batchRef: String($('#txtDescription').val())
        };
        this.ancUtils.twaPostJSON(this.postParams);
    }

}


