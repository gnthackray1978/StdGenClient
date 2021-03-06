var JSMaster, QryStrUtils, AncUtils,Panels;

var AncMarriages = function () {
    this.qryStrUtils = new QryStrUtils();
    this.selectorTools = new SelectorTools();
    this.ancUtils = new AncUtils();
    this.pager = new Pager();
    this.DEFAULT_MARRIAGESELECT_URL = '/MarriageService/Get/Select';
    this.DEFAULT_SOURCESSELECT_URL = '/Sources/Select';
    this.DEFAULT_MARRIAGEEDITOR_URL = '../HtmlPages/MarriageEditor.html';
    this.DEFAULT_MARRIAGEDELETE_URL = '/MarriageService/Delete';
    this.DEFAULT_MARRIAGEDUPLICATE_URL = '/MarriageService/SetDuplicate';
    this.DEFAULT_MARRIAGEREMOVELINK_URL = '/MarriageService/RemoveLinks';
    this.DEFAULT_MARRIAGEREORDER_URL = '/MarriageService/ReorderMarriages';
    this.DEFAULT_MARRIAGEMERGE_URL = '/MarriageService/MergeMarriages';
    this.DEFAULT_MARRIAGESWITCHSPOUSES_URL = '/MarriageService/SwitchSpouses';
    this.DEFAULT_MARRIAGESETSOURCE_URL = '/Sources/AddMarriageTreeSource';
    this.DEFAULT_MARRIAGEREMOVESOURCE_URL = '/Sources/RemoveTreeSources';


    this.selection = [];
    this.parishId = '';
    this.sourceIds = '';
    this.postParams = { 
        url: '',
        data: '',
        idparam: undefined,
        refreshmethod: this.getMarriages,
        refreshArgs: ['1'],
        Context: this
    };
 
};

AncMarriages.prototype = {

    init: function () {
        var isActive = this.qryStrUtils.getParameterByName('active', '');


        var panels = new Panels();



        $('body').on("click", "#main", $.proxy(function () { panels.sourcesShowPanel('1'); return false; }, panels));
        $('body').on("click", "#more", $.proxy(function () { panels.sourcesShowPanel('2'); return false; }, panels));

        $('body').on("click", "#refresh", $.proxy(function () { this.getMarriages("0"); return false; }, this));

        $('body').on("click", "#add", $.proxy(function () { this.addMarriage('00000000-0000-0000-0000-000000000000'); return false; }, this));
        $('body').on("click", "#delete", $.proxy(function () { this.DeleteRecord(); return false; }, this));
        $('body').on("click", "#reorder", $.proxy(function () { this.Reorder(); return false; }, this));
        $('body').on("click", "#dupe", $.proxy(function () { this.SetDuplicates(); return false; }, this));
        $('body').on("click", "#merge", $.proxy(function () { this.SetMergeMarriages(); return false; }, this));
        $('body').on("click", "#remove", $.proxy(function () { this.SetRemoveLink(); return false; }, this));
        $('body').on("click", "#switch", $.proxy(function () { this.SwitchSpouses(); return false; }, this));
        
        $('body').on("click", "#year_hed", $.proxy(function () { this.sort('MarriageDate'); return false; }, this));
        $('body').on("click", "#mcname_hed", $.proxy(function () { this.sort('MaleCName'); return false; }, this));
        $('body').on("click", "#msname_hed", $.proxy(function () { this.sort('MaleSName'); return false; }, this));
        $('body').on("click", "#fcname_hed", $.proxy(function () { this.sort('FemaleCName'); return false; }, this));
        $('body').on("click", "#fsname_hed", $.proxy(function () { this.sort('FemaleSName'); return false; }, this));

        $('body').on("click","#locat_hed", $.proxy(function () { this.sort('MarriageLocation'); return false; }, this));

        $('body').on("click", "#remove-trees", $.proxy(function () { this.RemoveSources(); return false; }, this));
        $('body').on("click", "#add-tree", $.proxy(function () { this.SetSources(); return false; }, this));


        if (isActive == '1') {
            $('#txtMaleCName').val(this.qryStrUtils.getParameterByName('mcname', ''));
            $('#txtMaleSName').val(this.qryStrUtils.getParameterByName('msname', ''));
            $('#txtFemaleCName').val(this.qryStrUtils.getParameterByName('fcname', ''));
            $('#txtFemaleSName').val(this.qryStrUtils.getParameterByName('fsname', ''));
            $('#txtLocation').val(this.qryStrUtils.getParameterByName('locat', ''));
            $('#txtWitnessName').val(this.qryStrUtils.getParameterByName('wit', ''));
            $('#txtLowerDateRangeLower').val(this.qryStrUtils.getParameterByName('ldrl', ''));
            $('#txtLowerDateRangeUpper').val(this.qryStrUtils.getParameterByName('ldru', ''));

            this.parishId = this.qryStrUtils.getParameterByName('parid', '');
            this.sourceIds = this.qryStrUtils.getParameterByName('sids', '');
            
            this.getMarriages('1');

            
        }

        this.getSources();
    },

    createQryString: function () {

        var args = {
            "active": '1',
            "mcname": $('#txtMaleCName'),
            "msname": $('#txtMaleSName'),
            "fcname": $('#txtFemaleCName'),
            "fsname": $('#txtFemaleSName'),
            "locat": $('#txtLocation'),
            "ldrl": $('#txtLowerDateRangeLower'),
            "ldru": $('#txtLowerDateRangeUpper'),
            "wit": $('#txtWitnessName'),
            "parid": this.parishId,
            "sids": this.sourceIds
        };


        this.qryStrUtils.updateQry(args);

    },

    getMarriages: function (showdupes) {
        console.time('getMarriages');
        var parentId = '';
        if (showdupes == '0') {
            this.qryStrUtils.updateQryPar('_parentId', parentId);
        }
        else {
            parentId = this.qryStrUtils.getParameterByName('_parentId', '');
        }

        var params = {};
        params[0] = parentId;
        params[1] = String($('#txtMaleCName').val());
        params[2] = String($('#txtMaleSName').val());
        params[3] = String($('#txtFemaleCName').val());
        params[4] = String($('#txtFemaleSName').val());
        params[5] = String($('#txtLocation').val());
        params[6] = String($('#txtLowerDateRangeLower').val());
        params[7] = String($('#txtLowerDateRangeUpper').val());
        params[8] = this.sourceIds;
        params[9] = this.parishId;
        params[10] = String($('#txtWitnessName').val());
        params[11] = String(this.qryStrUtils.getParameterByName('page', 0));
        params[12] = '30';
        params[13] = this.qryStrUtils.getParameterByName('sort_col', 'MarriageDate');

        this.ancUtils.twaGetJSON(this.DEFAULT_MARRIAGESELECT_URL, params, $.proxy(this.marriageResult, this));

        this.createQryString();

        return false;
    },
    
    getSources: function () {

        var params = {};
        params[0] = '87';
        params[1] = '';
        params[2] = '';
        params[3] = '';
        params[4] = '0';
        params[5] = '0';
        params[6] = '2000';
        params[7] = '2000';
        params[8] = '';
        params[9] = 'false'; 
        params[10] = 'false'; 
        params[11] = 'false'; 
        params[12] = 'false';
        params[13] = '0';
        params[14] = '30';
        params[15] = 'sdate';

        this.ancUtils.twaGetJSON(this.DEFAULT_SOURCESSELECT_URL, params, function (data) {
            var tableBody = '';
            $.each(data.serviceSources, function (source, sourceInfo) {
                //<option value="volvo">Volvo</option> //sourceInfo.SourceDesc           
                tableBody += '<option value="' + sourceInfo.SourceId + '">' + sourceInfo.SourceRef + '</option>';
            });
            if (tableBody !== '') $('#tree-select').html(tableBody);
        });
         
        return false;
    },
   
    marriageResult: function (data) {

        console.time('result');

        var tableBody = '';
        var visibleRecords = [];

        var dupeEvents = [];
        var selectEvents = [];

        var _idx = 0;

        var that = this;

        $.each(data.serviceMarriages, function (source, sourceInfo) {

            var hidPID = '<input type="hidden" name="MarriageId" id="MarriageId" value ="' + sourceInfo.MarriageId + '"/>';
            var hidParID = '<input type="hidden" name="parent_id" id="parent_id" value ="' + sourceInfo.UniqueRef + '"/>';

            var arIdx = jQuery.inArray(sourceInfo.MarriageId, that.selection);

            if (arIdx >= 0) {
                tableBody += '<tr class = "highLightRow">' + hidPID + hidParID;
            }
            else {
                tableBody += '<tr>' + hidPID + hidParID;
            }

            var _loc = window.location.hash;
            _loc = that.qryStrUtils.updateStrForQry(_loc, 'id', sourceInfo.MarriageId);

            tableBody += '<td><a id= "d' + _idx + '" href=""><div>' + sourceInfo.TotalEvents + '</div></a></td>';
            dupeEvents.push({ key: 'd' + _idx, value: sourceInfo.UniqueRef });

            tableBody += '<td><a id= "s' + _idx + '" href="" title="'+ sourceInfo.Notes +'"><div>' + sourceInfo.MarriageDate + '</div></a></td>';
            selectEvents.push({ key: 's' + _idx, value: sourceInfo.MarriageId });

            tableBody += '<td><a href="'+that.DEFAULT_MARRIAGEEDITOR_URL + _loc + '"><div> Edit </div></a></td>';

            tableBody += '<td><div>' + sourceInfo.MaleCName + '</div></td>';
            
     //       tableBody += '<td><div>' + sourceInfo.MaleSName + '</div></td>';

            if (sourceInfo.LinkedTrees !== '')
                tableBody += '<td><div class = "associatedTrees" title="' + sourceInfo.LinkedTrees + '">' + sourceInfo.MaleSName + '</div></td>';
            else
                tableBody += '<td><div>' + sourceInfo.MaleSName + '</div></td>';

            tableBody += '<td><div>' + sourceInfo.FemaleCName + '</div></td>';
            tableBody += '<td><div>' + sourceInfo.FemaleSName + '</div></td>';
            tableBody += '<td><div>' + sourceInfo.MarriageLocation + '</div></td>';
            tableBody += '<td><div>' + sourceInfo.Witnesses + '</div></td>';
            tableBody += '</tr>';

            visibleRecords.push(sourceInfo.MarriageId);

            _idx++;
        });

        if (this.selection !== undefined) {
            this.selection = this.selection.RemoveInvalid(visibleRecords);
        }

        if (tableBody !== '') {

            $('#search_bdy').html(tableBody);

            //create pager based on results
            var pagerparams = { ParentElement: 'pager',
                Batch: data.Batch,
                BatchLength: data.BatchLength,
                Total: data.Total,
                Function: this.getLink,
                Context: this
            };

            this.pager.createpager(pagerparams);

            $('#reccount').html(data.Total + ' Marriages');
        }
        else {

            $('#search_bdy').html(tableBody);
            $('#reccount').html('0 Marriages');
        }


        this.selectorTools.addlinks(dupeEvents, this.loadDupes, this);

        this.selectorTools.addlinks(selectEvents, this.processSelect, this);
        console.timeEnd('getMarriages');
        console.timeEnd('result');
        console.log('result ended');
    },

    loadDupes: function (id) {
        this.qryStrUtils.updateQryPar('_parentId', id);
        this.getMarriages('1');
    },

    processSelect: function (evt) {
        console.log('processSelect');
        this.selectorTools.handleSelection(evt, this.selection, '#search_bdy tr', "#MarriageId");
    },

    getLink: function (toPage) {
        this.qryStrUtils.updateQryPar('page', toPage);
        this.getMarriages('1');
    },

    sort: function (sort_col) {
        this.qryStrUtils.sort_inner(sort_col);
        this.getMarriages('1');
    },

    DeleteRecord: function () {
        this.postParams.url = this.DEFAULT_MARRIAGEDELETE_URL;
        this.postParams.data = { marriageIds: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    SetDuplicates: function () {
        this.postParams.url = this.DEFAULT_MARRIAGEDUPLICATE_URL;
        this.postParams.data = { marriages: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    SetRemoveLink: function () {
        this.postParams.url = this.DEFAULT_MARRIAGEREMOVELINK_URL;
        this.postParams.data = { marriage: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    Reorder: function () {
        this.postParams.url = this.DEFAULT_MARRIAGEREORDER_URL;
        this.postParams.data = { marriage: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    SetMergeMarriages: function () {
        this.postParams.url = this.DEFAULT_MARRIAGEMERGE_URL;
        this.postParams.data = { marriage: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    addMarriage: function (path) {
        window.location.href = this.DEFAULT_MARRIAGEEDITOR_URL +'#' + this.qryStrUtils.makeIdQryString('id', path);
    },

    SwitchSpouses: function () {
        this.postParams.url = this.DEFAULT_MARRIAGESWITCHSPOUSES_URL;
        this.postParams.data = { marriage: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    SetSources: function () {
        this.postParams.url = this.DEFAULT_MARRIAGESETSOURCE_URL;
        this.postParams.data = { record: this.qryStrUtils.convertToCSV(this.selection), sources: $("#tree-select").val() };
        this.ancUtils.twaPostJSON(this.postParams);
    },

    RemoveSources: function () {
        this.postParams.url = this.DEFAULT_MARRIAGEREMOVESOURCE_URL;
        this.postParams.data = { record: this.qryStrUtils.convertToCSV(this.selection) };
        this.ancUtils.twaPostJSON(this.postParams);
    }
};


