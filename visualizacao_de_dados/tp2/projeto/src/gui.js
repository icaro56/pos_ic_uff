var GUI = (function() {
    
    'use strict';
    
    var moduleExports = {};
    
    //variáveis de controle
    var activeGranOpt = "";
    var activeWindowOpt = "";
    //var activeZoomOpt = "";
    var activeZoomOptMain = "";
    var buttonUpdateClicked = false;
    var activeDataTypeOpt = 0;
    var activeQuantificationOpt = 0;
    
    //--------------------------------------------------------------------------------------
    var limitWindowMonthSpecific = function() {
        if ($('#selYearEnd').val() < $('#selYearStart').val()) {
            $('#selYearEnd').val($('#selYearStart').val());
            $('#selYearEnd').trigger('change');
        }

        if ($('#selYearEnd').val() == $('#selYearStart').val()) {
            if ($('#selMonthEnd').val() < $('#selMonthStart').val()) {
                $('#selMonthEnd').val($('#selMonthStart').val());
                $('#selMonthEnd').trigger('change');
            }
        }
    };
    
    var limitWindowYearSpecific = function() {
        if ($('#selOnlyYearEnd').val() < $('#selOnlyYearStart').val()) {
            $('#selOnlyYearEnd').val($('#selOnlyYearStart').val());
            $('#selOnlyYearEnd').trigger('change');
        }
    };
    
    var updateMonthPeriodic = function() {
        var selectedOptions = $('#selMonths option:selected');
        CrimeControl.timeWindow.timeWindowMonthPeriodic.months = [];
        for (var i = 0; i < selectedOptions.length; i++) {
            CrimeControl.timeWindow.timeWindowMonthPeriodic.months.push(selectedOptions[i].value);
        }
    };
    
    var updateYearPeriodic = function() {
        var selectedOptions = $('#selYears option:selected');
        CrimeControl.timeWindow.timeWindowMonthPeriodic.years = [];
        for (var i = 0; i < selectedOptions.length; i++) {
            CrimeControl.timeWindow.timeWindowMonthPeriodic.years.push(selectedOptions[i].value);
        }
    };
    
    var updateOnlyYearPeriodic = function() {
        var selectedOptions = $('#selOnlyYears option:selected');
        CrimeControl.timeWindow.timeWindowYearPeriodic.years = [];
        for (var i = 0; i < selectedOptions.length; i++) {
            CrimeControl.timeWindow.timeWindowYearPeriodic.years.push(selectedOptions[i].value);
        }
    };
    
    var timeWindowEvent = function() {
        
        if (activeWindowOpt == "windowOptSpecific") {
            if (activeGranOpt == "grandOptMonth") {
                $('#selMonthStart').change(function(){
                    var monthIndexStart = $(this).val();
                    CrimeControl.timeWindow.timeWindowMonthSpecific.startMonth = parseInt(monthIndexStart);
                    
                    limitWindowMonthSpecific();
                });

                $('#selMonthEnd').change(function(){
                    var monthIndexEnd = $(this).val();
                    CrimeControl.timeWindow.timeWindowMonthSpecific.endMonth = parseInt(monthIndexEnd);
                    
                    limitWindowMonthSpecific();
                });

                $('#selYearStart').change(function(){
                    var yearStart = $(this).val();
                    CrimeControl.timeWindow.timeWindowMonthSpecific.startYear = yearStart;
                    
                    limitWindowMonthSpecific();
                });

                $('#selYearEnd').change(function(){
                    var yearEnd = $(this).val();
                    CrimeControl.timeWindow.timeWindowMonthSpecific.endYear = yearEnd;
                    
                    limitWindowMonthSpecific();
                });
            } else {
                $('#selOnlyYearStart').change(function(){
                    var yearStart = $(this).val();
                    CrimeControl.timeWindow.timeWindowYearSpecific.startYear = yearStart;
                    limitWindowYearSpecific();
                });

                $('#selOnlyYearEnd').change(function(){
                    var yearEnd = $(this).val();
                    CrimeControl.timeWindow.timeWindowYearSpecific.endYear = yearEnd;
                    limitWindowYearSpecific();
                });
            }
        } else {
            if (activeGranOpt == "grandOptMonth") {
                $('#selMonths').multiselect({
                    includeSelectAllOption: true,
                    onSelectAll: function() {
                        updateMonthPeriodic();
                    },
                    onDeselectAll: function() {
                        updateMonthPeriodic();
                    },
                    onChange: function(option, checked) {
                        updateMonthPeriodic();
                    }
                });
                
                $('#selYears').multiselect({
                    includeSelectAllOption: true,
                    onSelectAll: function() {
                        updateYearPeriodic();
                    },
                    onDeselectAll: function() {
                        updateYearPeriodic();
                    },
                    onChange: function(option, checked) {
                        updateYearPeriodic();
                    }
                });
                
                
            } else {
                $('#selOnlyYears').multiselect({
                    includeSelectAllOption: true,
                    onSelectAll: function() {
                        updateOnlyYearPeriodic();
                    },
                    onDeselectAll: function() {
                        updateOnlyYearPeriodic();
                    },
                    onChange: function(option, checked) {
                        updateOnlyYearPeriodic();
                    }
                });
            }
        }
        
        
    };
    
    var updateTimeWindowContent = function() {
        //limpa conteúdo para posterior atualização
        $('#timeWindowContent').empty();
        
        if (activeWindowOpt == "windowOptSpecific") {
            if (activeGranOpt == "grandOptMonth") {
                $("#timeWindowContent").load("./templates/monthYear.html", timeWindowEvent);
                CrimeControl.timeWindow.typeActived = 0;
                CrimeControl.timeWindow.isMonth = true;
            } /*else if (activeGranOpt == "grandOptSeason") {
                $("#timeWindowContent").load("./templates/seasonYear.html")
            } */else {
                $("#timeWindowContent").load("./templates/onlyYear.html", timeWindowEvent);
                CrimeControl.timeWindow.typeActived = 1;
                CrimeControl.timeWindow.isMonth = false;
            }
        } else {
            if (activeGranOpt == "grandOptMonth") {
                $("#timeWindowContent").load("./templates/monthYearPeriodic.html", timeWindowEvent);
                CrimeControl.timeWindow.typeActived = 2;
                CrimeControl.timeWindow.isMonth = true;
            }/*else if (activeGranOpt == "grandOptSeason") {
                $("#timeWindowContent").load("./templates/seasonYearPeriodic.html")
            }*/ else {
                $("#timeWindowContent").load("./templates/onlyYearPeriodic.html", timeWindowEvent);
                CrimeControl.timeWindow.typeActived = 3;
                CrimeControl.timeWindow.isMonth = false;
            }
        }
        
    };
    
    var changeEvents = function() {
        $('input[type=radio][name=granOpt]').change(function() {
            if (activeGranOpt != $(this).attr("id")) {
                activeGranOpt = $(this).attr("id");
                updateTimeWindowContent();
                
            }
        });
        
        $('input[type=radio][name=windowOpt]').change(function() {
            if (activeWindowOpt != $(this).attr("id")) {
                activeWindowOpt = $(this).attr("id");
                updateTimeWindowContent();
            }
        });
        
        /*$('input[type=radio][name=zoomOpt]').change(function() {
            if (activeZoomOpt != $(this).attr("id")) {
                activeZoomOpt = $(this).attr("id");
            }
        });*/
      
        $('input[type=radio][name=quantificationOpt]').change(function() {
            if (activeQuantificationOpt != $(this).val()) {
                activeQuantificationOpt = $(this).val();
                
                Map.setActiveQuantificationOption(activeQuantificationOpt);
            }
        });
        
        $('input[type=radio][name=dataTypeOpt]').change(function() {
            if (activeDataTypeOpt != $(this).val()) {
                activeDataTypeOpt = $(this).val();
                
                Map.setActiveDataTypeOption(activeDataTypeOpt);
            }
        });
        
        $('input[type=radio][name=zoomOptMain]').change(function() {
            if (activeZoomOptMain != $(this).attr("id")) {
                activeZoomOptMain = $(this).attr("id");
                
                //chamar atualização de mapa
                var opt = +activeZoomOptMain.split("_")[1];
                
                var quantDiv = document.getElementById('quantificationDiv');
                if(opt == 1 || opt == 2)
                    quantDiv.style.visibility = 'visible';
                else
                    quantDiv.style.visibility = 'hidden';
                    
                Map.loadMapByZoom(opt);
            }
        });
        
        $('#configUpdateButton').click(function() {
            var opt = +activeZoomOptMain.split("_")[1];
            Map.forceLoadMapByZoom(opt);
            
            $('#configWindow').modal('hide');
            buttonUpdateClicked = true;
        });
        
        $('#configWindow').on('hidden.bs.modal', function () {
            if (!buttonUpdateClicked) {
                bootbox.confirm("Do you want to apply the changes?", function(result) {
                    if (result) {
                        var opt = +activeZoomOptMain.split("_")[1];
                        Map.forceLoadMapByZoom(opt);
                    }
                });
            }
            
            buttonUpdateClicked = false;
        })
        
        $("#crimeAllCheck").click(function () {
            $(".check_crime").prop('checked', $(this).prop('checked'));
            $(".check_crime").trigger('change');
        });
        
        $("#totalAllCheck").click(function () {
            $(".check_total").prop('checked', $(this).prop('checked'));
            $(".check_total").trigger('change');
        });
        
        $("#reactionAllCheck").click(function () {
            $(".check_reaction").prop('checked', $(this).prop('checked'));
            $(".check_reaction").trigger('change');
        });
        
        $('.check_crime').change(function() {
            
            var index = $(this).attr("id").split("_")[1];
            var value = $(this).prop( "checked" );

            //só poderemos fazer isso quando o usuário apertar em save
            CrimeControl.ocurrenceControl[index].active = value;
        });
        
        $('.check_total').change(function() {
            
            var index = $(this).attr("id").split("_")[1];
            var value = $(this).prop( "checked" );

            //só poderemos fazer isso quando o usuário apertar em save
            CrimeControl.totalControl[index].active = value;
        });
        
        $('.check_reaction').change(function() {
            
            var index = $(this).attr("id").split("_")[1];
            var value = $(this).prop( "checked" );

            //só poderemos fazer isso quando o usuário apertar em save
            CrimeControl.policeReactionControl[index].active = value;
        });
        
        $('.trCrime input[type=number]').change(function() {
            var value = $(this).val();
            var index = $(this).parent().parent().attr("id").split("_")[1];
            
            //só poderemos fazer isso quando o usuário apertar em save
            CrimeControl.ocurrenceControl[index].weight = value;
        });
        
        $('.trTotal input[type=number]').change(function() {
            var value = $(this).val();
            var index = $(this).parent().parent().attr("id").split("_")[1];
            
            //só poderemos fazer isso quando o usuário apertar em save
            CrimeControl.totalControl[index].weight = value;
        });
        
        $('.trReaction input[type=number]').change(function() {
            var value = $(this).val();
            var index = $(this).parent().parent().attr("id").split("_")[1];
            
            //só poderemos fazer isso quando o usuário apertar em save
            CrimeControl.policeReactionControl[index].weight = value;
        });
        
        $('#averageCheck').change(function() {
            
            var value = $(this).prop( "checked" );

            CrimeControl.showAverage = value;
        });
    };
    
    var initCrimeRowsContent = function() {
        $('#crimeRowsContent').empty();
        var crimeRowsContent = $('#crimeRowsContent');
        var html = '';
        
        html += "<tr id='crimeAll'><td><strong>Mark All</strong></td><td>-</td><td><div class='checkbox'><input type='checkbox' id='crimeAllCheck' checked='checked'></div></td></tr>";

        for (var i = 0; i < CrimeControl.ocurrenceControl.length; i++) {
            var ocurrence = CrimeControl.ocurrenceControl[i];
            var checked = ocurrence.active ? "checked" : "";
            html += "<tr class='trCrime' id='crime_" + i + "'><td>" + ocurrence.name + "</td><td><input type='number' min='0' value='" + ocurrence.weight + "'></td><td><div class='checkbox'><input type='checkbox' id='crimeCheck_" + i + "'class='check_crime' checked=" + checked + "></div></td></tr>";
        }

        crimeRowsContent.append(html);
    };
    
    var initTotalRowsContent = function() {
        $('#totalRowsContent').empty();
        var totalRowsContent = $('#totalRowsContent');
        var html = '';

        html += "<tr id='totalAll'><td><strong>Mark All</strong></td><td>-</td><td><div class='checkbox'><input type='checkbox' id='totalAllCheck' checked='checked'></div></td></tr>";
        
        for (var i = 0; i < CrimeControl.totalControl.length; i++) {
            var ocurrence = CrimeControl.totalControl[i];
                        
            var checked = ocurrence.active ? "checked" : "";
            html += "<tr class='trTotal' id='total_" + i + "'><td>" + ocurrence.name + "</td><td><input type='number' min='0' value='" + ocurrence.weight + "'></td><td><div class='checkbox'><input type='checkbox' id='totalCheck_" + i + "'class='check_total' checked=" + checked + "></div></td></tr>";
        }

        totalRowsContent.append(html);
    };
    
    var initPoliceReactionRowsContent = function() {
        $('#policeReactionRowsContent').empty();
        var policeReactionRowsContent = $('#policeReactionRowsContent');
        var html = '';
        
        html += "<tr id='reactionAll'><td><strong>Mark All</strong></td><td>-</td><td><div class='checkbox'><input type='checkbox' id='reactionAllCheck' checked='checked'></div></td></tr>";

        for (var i = 0; i < CrimeControl.policeReactionControl.length; i++) {
            var ocurrence = CrimeControl.policeReactionControl[i];
            
            var checked = ocurrence.active ? "checked" : "";
            html += "<tr class='trReaction' id='reaction_" + i + "'><td>" + ocurrence.name + "</td><td><input type='number' min='0' value='" + ocurrence.weight + "'></td><td><div class='checkbox'><input type='checkbox' id='reactionCheck_" + i + "'class='check_reaction' checked=" + checked + "></div></td></tr>";
        }

        policeReactionRowsContent.append(html);
    };
    
    //Código aqui
    moduleExports.init = function() {
        $(document).ready(function() {
            
            //Controles do menu
            $("#menu-toggle").click(function(e) {
                e.preventDefault();
                $("#wrapper").toggleClass("toggled");
            });

            $("#hide-menu").click(function(e) {
                e.preventDefault();
                $("#wrapper").toggleClass("toggled");
            });

            $("#config-menu").click(function(){
                $("#configWindow").modal('show');
            });
            
            activeGranOpt = $('input[name=granOpt]:checked').attr("id");
            activeWindowOpt = $('input[name=windowOpt]:checked').attr("id");
            activeZoomOptMain = $('input[name=zoomOptMain]:checked').attr("id");
            activeDataTypeOpt = $('input[name=dataTypeOpt]:checked').val();
            activeQuantificationOpt = $('input[name=quantificationOpt]:checked').val();

            //verificar qual granularidade e janela de tempo pra criar opções correspondentes
            $("#timeWindowContent").load("./templates/monthYear.html", function() {
                timeWindowEvent();
            });
            
            initTotalRowsContent();
            initPoliceReactionRowsContent();
            initCrimeRowsContent();
            
            changeEvents();
            

            //**************************************
        });
    };
    
    
    
    return moduleExports;
})();