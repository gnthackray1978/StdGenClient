var JSMaster, QryStrUtils,AncUtils,Panels,SourceTypeLookup;

var AncSources = function () {
    this.tableMaker = new TableMaker();
    this.qryStrUtils = new QryStrUtils();
    
    this.ancUtils = new AncUtils();
  
    this.DEFAULT_SOURCESELECT_URL = '/Sources/Select';
    this.DEFAULT_SOURCEDELETE_URL = '/Sources/Delete';
    this.DEFAULT_BATCHENTRY_URL = '../HtmlPages/batchEntry.html';
    this.DEFAULT_SOURCEEDITOR_URL = '../HtmlPages/SourceEditor.html';
    this.DEFAULT_PERSONSEARCH_URL = '../HtmlPages/PersonSearch.html';
    this.DEFAULT_MARRIAGESEARCH_URL = '../HtmlPages/MarriageSearch.html';

   // this.selection = [];
    this.parishId = '';

    this.postParams = { 
        url: '',
        data: '',
        idparam: undefined,
        refreshmethod: this.getSources,
        refreshArgs: ['1'],
        Context: this
    };
 
};

AncSources.prototype = {

    init: function () {


        var isActive = this.qryStrUtils.getParameterByName('active');

        var panels = new Panels();

        $("body").on("click", "#main", $.proxy(function () { panels.sourcesShowPanel('1'); return false; }, panels));
        $("body").on("click", "#more", $.proxy(function () { panels.sourcesShowPanel('2'); return false; }, panels));
        $("body").on("click", "#additional", $.proxy(function () { panels.sourcesShowPanel('3'); return false; }, panels));
        $("body").on("click", "#refresh", $.proxy(function () { this.getSources(); return false; }, this));


        $("body").on("click", "#add", $.proxy(function () { this.addSource('00000000-0000-0000-0000-000000000000'); return false; }, this));
        $("body").on("click", "#viewmarriages", $.proxy(function () { this.openMarriages(); return false; }, this));
        $("body").on("click", "#viewpersons", $.proxy(function () { this.openPersons(); return false; }, this));
        
        $("body").on("click", "#delete", $.proxy(function () { this.deleteSources(); return false; }, this));
        $("body").on("click", "#print", $.proxy(function () { this.printableSources(); return false; }, this));
        $("body").on("click", "#select_return", $.proxy(function () { this.returnselection(); return false; }, this));

        $("body").on("click", "#sdate", $.proxy(function () { this.sort("SourceDate"); return false; }, this));
        $("body").on("click", "#sref", $.proxy(function () { this.sort("SourceRef"); return false; }, this));
        $("body").on("click", "#sdesc", $.proxy(function () { this.sort("SourceDescription"); return false; }, this));



        if (isActive == '1') {

            $('#txtSourceRef').val(this.qryStrUtils.getParameterByName('sref', ''));
            $('#txtSourceDescription').val(this.qryStrUtils.getParameterByName('sdesc', ''));
            $('#txtOriginalLocation').val(this.qryStrUtils.getParameterByName('origLoc', ''));

            $('#txtLowerDateRangeLower').val(this.qryStrUtils.getParameterByName('ldrl', ''));
            $('#txtLowerDateRangeUpper').val(this.qryStrUtils.getParameterByName('ldru', ''));
            $('#txtUpperDateRangeLower').val(this.qryStrUtils.getParameterByName('udrl', ''));
            $('#txtUpperDateRangeUpper').val(this.qryStrUtils.getParameterByName('udru', ''));

            $('#txtCountNo').val(this.qryStrUtils.getParameterByName('fcount', ''));
            $('#chkIsThackrayFound').val(this.qryStrUtils.getParameterByName('ist', ''));
            $('#chkIsCopyHeld').val(this.qryStrUtils.getParameterByName('isc', ''));
            $('#chkIsViewed').val(this.qryStrUtils.getParameterByName('isv', ''));
            $('#chkUseOptions').val(this.qryStrUtils.getParameterByName('isuo', ''));


            this.getSources();
        }



        var sourceTypeLookup = new SourceTypeLookup();
        sourceTypeLookup.init();

        var isPersonImpSelection = this.qryStrUtils.getParameterByName('scs', '');

        if (isPersonImpSelection !== '') {
            $("#rLink").removeClass("hidePanel").addClass("displayPanel");
        }
        else {
            $("#rLink").addClass("hidePanel").removeClass("displayPanel");
        }

    }
    ,
    getSources: function () {

        var params = {};
        params[0] = this.qryStrUtils.getParameterByName('stids', '');
        params[1] = $('#txtSourceRef').val();
        params[2] = $('#txtSourceDescription').val();
        params[3] = $('#txtOriginalLocation').val();
        params[4] = $('#txtLowerDateRangeLower').val();
        params[5] = $('#txtLowerDateRangeUpper').val();
        params[6] = $('#txtUpperDateRangeLower').val();
        params[7] = $('#txtUpperDateRangeUpper').val();
        params[8] = $('#txtCountNo').val();
        params[9] = 'false'; // $('#chkIsThackrayFound').val();
        params[10] = 'false'; // $('#chkIsCopyHeld').val();
        params[11] = 'false'; // $('#chkIsViewed').val();
        params[12] = 'false'; // $('#chkUseOptions').val();
        params[13] = String(this.qryStrUtils.getParameterByName('page', 0));
        params[14] = '30';
        params[15] = this.qryStrUtils.getParameterByName('sort_col', 'sdate');
    
        this.ancUtils.twaGetJSON(this.DEFAULT_SOURCESELECT_URL, params, $.proxy(this.processData, this));

        this.createQryString();
        return false;
    },

    returnselection: function () {

        var parishLst = this.makeSourceList();

        this.qryStrUtils.updateQryPar('scs', parishLst);

        var sources = this.qryStrUtils.getParameterByName('scs', '');
        //dont lose these if they are there.
        var parishs = this.qryStrUtils.getParameterByName('parl', '');

        var _loc = '#?scs=' + sources + '&parl=' + parishs;

        var url = this.DEFAULT_BATCHENTRY_URL + _loc;

        window.location.href = url;
    },

    openPersons:function(){
        
        var parishLst = this.makeSourceList();
        
        var redirectWindow = window.open(this.DEFAULT_PERSONSEARCH_URL + '?#active=1&sids='+ parishLst +'');
 
    },
    
    makeSourceList: function(){
        var parishLst = '';

        $.each(this.tableMaker.selectedRows, function (idx, val) {
            if (idx > 0) {
                parishLst += ',' + val;
            }
            else {
                parishLst += val;
            }
        });
        
        return parishLst;
    },
    openMarriages:function(){
        
        var parishLst = this.makeSourceList();
        
        var redirectWindow = window.open(this.DEFAULT_MARRIAGESEARCH_URL + '?#active=1&sids='+ parishLst +'');
    },

    createQryString: function () {

        var args = {
            "active": '1',
            "sref": $('#txtSourceRef'),
            "sdesc": $('#txtSourceDescription'),
            "origLoc": $('#txtOriginalLocation'),
            "ldrl": $('#txtLowerDateRangeLower'),
            "ldru": $('#txtLowerDateRangeUpper'),
            "udrl": $('#txtUpperDateRangeLower'),
            "udru": $('#txtUpperDateRangeUpper'),
            "fcount": $('#txtCountNo')
        };

        this.qryStrUtils.updateQry(args);

    },

    processData: function (data) {
      
        var that = this;

        var tableData = {
            column1Func : function(){console.log('hello1');},
            column4Func : function(){console.log('hello4');},
            column5Func : function(){console.log('hello5');},
            rows : []
        }; 

        $.each(data.serviceSources, function (idx, value) {
            var _loc = window.location.hash;
            _loc = that.qryStrUtils.updateStrForQry(_loc, 'id', value.SourceId);
            
            
            var rowObj ={
                id :value.SourceId,
                idx : idx,
                column1 : {
                    isLink :false,
                    ref : value.SourceYear
                },
                column2 : {
                    isLink :false,
                    ref : value.SourceYearTo
                },
                column3 : {
                    isLink :false,
                    ref : value.PersonCount
                },
                column4 : {
                    isLink :false,
                    ref : value.MarriageCount
                },
                column5 : {
                    isLink :true,
                    href : that.DEFAULT_SOURCEEDITOR_URL+_loc,
                    ref : 'Edit'
                },
                column6 : {
                    isLink :true,
                    key :true,
                    title : value.SourceRef,
                    ref : value.SourceRef,
                    className : 'sourceref'
                },
                column7 : {
                    isLink :false,
                    title : value.SourceDesc,
                    ref : value.SourceDesc,
                    className : 'source_d'
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
        
        this.tableMaker.MakeBody(tableData,pagerparams);
    },
    sort: function (sort_col) {
        this.qryStrUtils.sort_inner(sort_col);
        this.getSources();
    },
    getLink: function (toPage) {
        this.qryStrUtils.updateQryPar('page', toPage);
        this.getSources();
    },
    addSource: function (path) {
        window.location.href = this.DEFAULT_SOURCEEDITOR_URL + '#' + this.qryStrUtils.makeIdQryString('id', path);
    },
    deleteSources: function () {
        this.postParams.url = this.DEFAULT_SOURCEDELETE_URL;
        this.postParams.data = { sourceId: this.qryStrUtils.convertToCSV(this.tableMaker.selectedRows) };
        this.ancUtils.twaPostJSON(this.postParams);
    },
    printableSources: function () {
        //not implemented yet.
    }

}

