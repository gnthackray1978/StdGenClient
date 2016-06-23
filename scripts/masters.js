
$(document).ready(function () {
    var jsMaster = new JSMaster();
    
    //console.log('marriage editor ready');

    jsMaster.generateHeader('#1', function () {
        
        var pageName = location.pathname.split("/").slice(-1);
        
        switch(pageName[0]){
            case 'MarriageEditor.html':
                pageName = new AncMarriageEditor();
                pageName.init();
                break;
            
            case 'MarriageSearch.html':
                pageName = new AncMarriages();
                pageName.init();
                break;
                
            case 'batchEntry.html':
                pageName = new BatchCore();
                pageName.init();
                break;
            case 'Events.html':
                pageName = new AncEvents();
                pageName.init();
                break;
            case 'MapView.html':
                pageName = new GeneralMap();
                pageName.init();
                break;
            case 'MapViewCensus.html':
                pageName = new CensusMap();
                pageName.init();
                break;
            case 'ParishEditor.html':
                pageName = new AncParishEditor();
                pageName.init();
                break;
            case 'ParishSearch.html':
                pageName = new AncParishs();
                pageName.init();
                break;
            case 'PersonEditor.html':
                pageName = new AncPersonEditor();
                pageName.init();
                break;
            case 'PersonSearch.html':
                pageName = new AncPersons();
                pageName.init();
                break;
            case 'SourceEditor.html':
                pageName = new AncSourceEditor();
                pageName.init();
                break;
            case 'SourceSearch.html':
                pageName = new AncSources();
                pageName.init();
                break;
            case 'SourceTypeEditor.html':
                pageName = new AncSourceTypeEditor();
                pageName.init();
                break;
            case 'SourceTypesSearch.html':
                pageName = new AncSourceTypes();
                pageName.init();
                break;
            case 'BatchSearch.html':
                pageName = new BatchSearch();
                pageName.init();
                break;
              
        }
        
    });

});




var JSMaster = function () {

    //this.facebookReady = null;
    console.log('setting initFacebook');
    this.urlroot = '..';
    this.imageTools = new ImageTools();
    this.ancUtils = new AncUtils();
    this.qryStrUtils = new QryStrUtils();
    this.panels = new Panels();

    window.fbAsyncInit = this.initFacebook;

    //Window.prototype.facebookReady = readyfunction;

    this.imageTools.setBackground();

    console.log('finished creating JSMaster');
};





JSMaster.prototype = {


    initFacebook: function () {

        console.log('jsmaster FB.init');

        FB.init({ appId: 205401136237103, status: true, cookie: true, xfbml: true, channelUrl: this.urlroot + '/HtmlPages/channel.html' });

        console.log('jsmaster FB.getLoginStatus');
        
        FB.getLoginStatus(function (response) {


            console.log('jsmaster init getLoginStatus');

            if (response.status == 'connected') {
                // showError('connected');
                //window.getLoggedInUserName();
                console.log('jsmaster init connected');
                
                var ancUtils = new AncUtils();
                ancUtils.twaGetJSON("/LoggedInUserName", {}, function (data) {
                    $('#usr_nam').html(data);
                });

                console.log('jsmaster init facebookReady.apply');
                if (window.facebookReady != null) {
                    console.log('jsmaster init facebookReady.apply confirmed to go');
                    window.facebookReady.apply();
                }
            }
            else {
                console.log('jsmaster init facebookReady.apply');
                window.facebookReady.apply();
            }
            

        }, true);

    },

    generateHeader: function (selectorid, readyfunction) {

        //todo rewrite this to use .proxy - i think it shouldnt be necessary to use the window.prototype for this!

        console.log('jsmaster generateHeader');

        var that = this;

        // this.facebookReady = readyfunction;

        var headersection = '';

        headersection += '<div class = "mtropt">';

        headersection += '<div class = "mtrlnk">';
        headersection += '<a id="lnk_mainoptions"   href=""  ><span>Main Options</span></a>';
        headersection += '<a id="lnk_alongwith"     href=""  ><span>Along With</span></a>';
        headersection += '<a id="lnk_tools"         href=""  ><span>Tools</span></a>';
        headersection += '<a id="lnk_settings"      href=""  ><span>Settings</span></a>';
        headersection += '<a id="lnk_mapview"       href=\'../HtmlPages/MapView.html\'><span>Map View</span></a>';
        headersection += '</div>';

        headersection += '<div>';
        headersection += '<div id="panelA" class = "displayPanel">';
        headersection += '<div class = "mtrlnk">';
        headersection += '<a id="lnk_home"      href=\'' + that.urlroot + '/Index.html\'><span>Home</span></a>';
        headersection += '<a id="lnk_marriages" href=\'' + that.urlroot + '/HtmlPages/MarriageSearch.html\'><span>Marriages</span></a>';
        headersection += '<a id="lnk_persons"   href=\'' + that.urlroot + '/HtmlPages/PersonSearch.html\'><span>Persons</span></a>';
        headersection += '<a id="lnk_sources"   href=\'' + that.urlroot + '/HtmlPages/SourceSearch.html\'><span>Sources</span></a>';
        headersection += '</div>';
        headersection += '</div>';

        headersection += '<div id="panelB" class = "hidePanel">';
        headersection += '<div class = "mtrlnk">';
        headersection += '<a id="lnk_parishs"       href=\'' + that.urlroot + '/HtmlPages/ParishSearch.html\'><span>Parishs</span></a>';
        headersection += '<a id="lnk_TotalEvents"        href=\'' + that.urlroot + '/HtmlPages/Events.html\'><span>Events</span></a>';
        headersection += '<a id="lnk_batchTotalEvents"   href=\'' + that.urlroot + '/HtmlPages/BatchSearch.html\'><span>Batch Search</span></a>';
        headersection += '<a id="lnk_files"         href=\'' + that.urlroot + '/Forms/FrmFiles.aspx\'><span>Files</span></a>';
        headersection += '<a id="lnk_sourcetypes"   href=\'' + that.urlroot + '/HtmlPages/SourceTypesSearch.html\'><span>Source Types</span></a>';
        headersection += '</div>';
        headersection += '</div>';
        headersection += '<div id="panelC" class = "hidePanel">';
        headersection += '<div class = "mtrlnk">';
        headersection += '<a id="lnk_viewtrees" href=\'' + that.urlroot + '/HtmlPages/TreeSearch.html\'><span>View Trees</span></a>';
        headersection += '</div>';
        headersection += '</div>';
        headersection += '<div id="panelD" class = "hidePanel">';
        headersection += '<div class = "mtrlnk">';
        headersection += '<a id="lnk_prevback" href=\'' + that.urlroot + '/Default.aspx\'><span>Previous Style</span></a>';
        headersection += '<a id="lnk_nextback" href=\'' + that.urlroot + '/Default.aspx\'><span>Next Style</span></a>';
        headersection += '</div>';
        headersection += '</div>';
        headersection += '</div>';

        headersection += '</div>';

        headersection += '<div id="usrinfo" class = "mtrusr">';


        headersection += '<div id="fb-root">';
        headersection += '<fb:login-button autologoutlink="true" perms="email,user_birthday,status_update"></fb:login-button>';
        headersection += '</div>';

        headersection += '<div id = "usr_nam"></div>';
        headersection += '</div>';

        headersection += '<div class = "mtrlog">Georges Genealogy Database</div>';
        headersection += '<div id="errorDialog" title="Error"></div>';

        headersection += '</div>';

        headersection += '<br />';

        $(selectorid).addClass('midtop');

        $(selectorid).html(headersection);




        $('body').on("click", "#lnk_mainoptions", $.proxy(function () { that.panels.masterShowTab(1); return false; }, that.panels));
        $('body').on("click", "#lnk_alongwith", $.proxy(function () { that.panels.masterShowTab(2); return false; }, that.panels));
        $('body').on("click", "#lnk_tools", $.proxy(function () { that.panels.masterShowTab(3); return false; }, that.panels));
        $('body').on("click", "#lnk_settings", $.proxy(function () { that.panels.masterShowTab(4); return false; }, that.panels));

        $('body').on("click", "#lnk_prevback", $.proxy(function () { that.imageTools.prevBackground(); return false; }, that));
        $('body').on("click", "#lnk_nextback", $.proxy(function () { that.imageTools.nextBackground(); return false; }, that));

        console.log('attempting to connect to facebook');
        
        this.connectfacebook(function () {
            console.log('facebook loaded');
            readyfunction.call();
        });

        

       
    },

    connectfacebook: function (readyfunction) {

        if (this.urlroot == '..') {
            Window.prototype.facebookReady = readyfunction;

            (function () {
                var e = document.createElement('script');
                e.src = 'http://connect.facebook.net/en_US/all.js';
                e.async = true;
                document.getElementById('fb-root').appendChild(e);
            } ());
        }
        else {
            readyfunction.call();

        }
    }



}
