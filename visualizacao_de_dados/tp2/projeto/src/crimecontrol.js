var CrimeControl = (function() {
    
    'use strict';
    
    var self = {};
    
    //usado na interface de configuração
    self.ocurrenceControl = [];
    self.totalControl = [];
    self.policeReactionControl = [];
    
    self.timeWindow = {
        isMonth: true,
        typeActived: 0, //0=monthSpecific, 1=yearSpecific, 2=monthPeriodic, 3=yearPeriodic
        timeWindowMonthSpecific: {
            startMonth: 0,
            startYear: "2013",
            endMonth: 11,
            endYear: "2017",
            
            
        },
        timeWindowYearSpecific: {
            startYear: "2013",
            endYear: "2017"
        },
        timeWindowMonthPeriodic: {
            months: [0,1,2,3,4,5,6,7,8,9,10,11],
            years: [2013,2014,2015,2016,2017]
        },
        timeWindowYearPeriodic: {
            years: [2013,2014,2015,2016,2017]
        }
    };
    
    /*
        Estrutura do map
        DP->Anos->ano->Crimes->crime->mes
        DP->Anos->ano->Totais->total->mes
        DP->Anos->ano->Reações->reação->mes
    */
    self.crimeMap = {}; 
    
    //maps com todos os keys de cada zoom, exceto DP porque dá pra pegar pelo self.crimeMap
    self.aispNames = {};
    self.citiesNames = {};
    self.rispNames = {};
    
    self.average = null;
    self.averageRelative = null;
    self.showAverage = true;
    
    var initAndReturnArray = function(size, value) {
        var array = [];
        while(size--) 
            array[size] = value;
        
        return array;
    }
    
    var initAndReturnCrimeArray = function(size) {
        var crimeArray = [];
        while(size--)
            crimeArray[size] = initAndReturnArray(13, 0);
        
        return crimeArray;
    }
    
    var processedCrimes = 0;
    var initCrimeMap = function(callback) {
        //lendo arquivos de crimes e criando um Map responsável por todos os crimes
        for (var y = 0; y < Files.years.length; y++) {
            var year = Files.years[y];
            
            var filenames = Files.getAllOccurrencesFileNames(year);
            for (var f = 0; f < filenames.length; f++) {
                var filename = filenames[f];
                
                Utils.readCSVFile('./dataset/' + filename, f, year, filenames.length, function(data, crimeIndex, year, filenamesLength) {
                    for(var i = 0; i < data.length; i++) {
                        var dpKey = data[i]["CISP (DP)"];
                        if (!self.crimeMap.hasOwnProperty(dpKey)) {
                            self.crimeMap[dpKey] = {};
                            self.crimeMap[dpKey]["Município"] = data[i]["Município"];
                            self.crimeMap[dpKey]["Municípios"] = data[i]["Municípios"];
                            self.crimeMap[dpKey]["AISP (BPM)"] = data[i]["AISP (BPM)"];
                            self.crimeMap[dpKey]["RISP"] = data[i]["RISP"];
                            self.crimeMap[dpKey]["GrandeArea"] = data[i]["GrandeArea"];
                            
                            self.crimeMap[dpKey]["years"] = {};
                            self.crimeMap[dpKey]["totalYearsCrimes"] = 0;
                            self.crimeMap[dpKey]["totalYearsTotals"] = 0;
                            self.crimeMap[dpKey]["totalYearsReactions"] = 0;
                            
                            //Criando estruturas com nomes das chaves de cada zoom
                            if (!self.citiesNames.hasOwnProperty(data[i]["Município"])  && data[i]["Município"] != undefined)
                                self.citiesNames[data[i]["Município"]] = data[i]["Município"];
                            
                            if (!self.rispNames.hasOwnProperty(data[i]["RISP"]) && data[i]["RISP"] != undefined)
                                self.rispNames[data[i]["RISP"]] = data[i]["RISP"];
                            
                            if (!self.aispNames.hasOwnProperty(data[i]["AISP (BPM)"]) && data[i]["AISP (BPM)"] != undefined)
                                self.aispNames[data[i]["AISP (BPM)"]] = data[i]["AISP (BPM)"];
                        }
                        var dpYearsValue = self.crimeMap[dpKey]["years"];
                        if (!dpYearsValue.hasOwnProperty(year)) {
                            dpYearsValue[year] = {};
                        }
                        var yearValue = dpYearsValue[year];
                        if (!yearValue.hasOwnProperty("crimes")) {
                            yearValue["crimes"] = initAndReturnCrimeArray(filenamesLength);
                            yearValue["totalCrimes"] = 0;
                        }
                        var crimes = yearValue["crimes"];
                        crimes[crimeIndex][0] = data[i]["jan"]; 
                        crimes[crimeIndex][1] = data[i]["fev"]; 
                        crimes[crimeIndex][2] = data[i]["mar"]; 
                        crimes[crimeIndex][3] = data[i]["abr"]; 
                        crimes[crimeIndex][4] = data[i]["mai"]; 
                        crimes[crimeIndex][5] = data[i]["jun"]; 
                        crimes[crimeIndex][6] = data[i]["jul"]; 
                        crimes[crimeIndex][7] = data[i]["ago"]; 
                        crimes[crimeIndex][8] = data[i]["set"]; 
                        crimes[crimeIndex][9] = data[i]["out"]; 
                        crimes[crimeIndex][10] = data[i]["nov"]; 
                        crimes[crimeIndex][11] = data[i]["dez"]; 
                        crimes[crimeIndex][12] = data[i]["total"];  
                        yearValue["totalCrimes"] += data[i]["total"];
                        self.crimeMap[dpKey]["totalYearsCrimes"] += data[i]["total"];
                    }
                    processedCrimes++;
                    if (processedCrimes >= (Files.years.length * Files.occurrencesFileNames.length) ) {
                        initTotalMap(callback);
                    }
                    
                });
            }
        }
    }
    
    //Só é chamada essa função após terminar o initCrimeMap
    var processedTotals = 0;
    var initTotalMap = function(callback) {
        //lendo arquivos de totais e criando um Map responsável por todos os totais crimes
        for (var y = 0; y < Files.years.length; y++) {
            var year = Files.years[y];
            
            var filenames = Files.getAllTotalFileNames(year);
            for (var f = 0; f < filenames.length; f++) {
                var filename = filenames[f];
                
                Utils.readCSVFile('./dataset/' + filename, f, year, filenames.length, function(data, crimeIndex, year, filenamesLength) {
                    for(var i = 0; i < data.length; i++) {
                        var dpKey = data[i]["CISP (DP)"];
                        if (!self.crimeMap.hasOwnProperty(dpKey)) {
                            self.crimeMap[dpKey] = {};
                            self.crimeMap[dpKey]["Município"] = data[i]["Município"];
                            self.crimeMap[dpKey]["AISP (BPM)"] = data[i]["AISP (BPM)"];
                            self.crimeMap[dpKey]["RISP"] = data[i]["RISP"];
                            
                            self.crimeMap[dpKey]["years"] = {};
                            self.crimeMap[dpKey]["totalYearsTotals"] = 0;
                        }
                        var dpYearsValue = self.crimeMap[dpKey]["years"];
                        if (!dpYearsValue.hasOwnProperty(year)) {
                            dpYearsValue[year] = {};
                            
                        }
                        var yearValue = dpYearsValue[year];
                        if (!yearValue.hasOwnProperty("totals")) {
                            yearValue["totals"] = initAndReturnCrimeArray(filenamesLength);
                            yearValue["totalTotals"] = 0;
                        }
                        var totals = yearValue["totals"];
                        totals[crimeIndex][0] = data[i]["jan"]; 
                        totals[crimeIndex][1] = data[i]["fev"]; 
                        totals[crimeIndex][2] = data[i]["mar"]; 
                        totals[crimeIndex][3] = data[i]["abr"]; 
                        totals[crimeIndex][4] = data[i]["mai"]; 
                        totals[crimeIndex][5] = data[i]["jun"]; 
                        totals[crimeIndex][6] = data[i]["jul"]; 
                        totals[crimeIndex][7] = data[i]["ago"]; 
                        totals[crimeIndex][8] = data[i]["set"]; 
                        totals[crimeIndex][9] = data[i]["out"]; 
                        totals[crimeIndex][10] = data[i]["nov"]; 
                        totals[crimeIndex][11] = data[i]["dez"]; 
                        totals[crimeIndex][12] = data[i]["total"];  
                        yearValue["totalTotals"] += data[i]["total"];
                        self.crimeMap[dpKey]["totalYearsTotals"] += data[i]["total"];
                        
                        /*if (isNaN(self.crimeMap[dpKey]["totalYearsTotals"])) {
                            console.log("NaN encontrado.");
                        }*/
                    }
                    
                    processedTotals++;
                    if (processedTotals >= (Files.years.length * Files.totalFileNames.length) ) {
                        initPoliceReactionMap(callback);
                    }
                });
            }
        }
        
        //console.log(self.totalMap);
    }
    
    //Só é chamada essa função após terminar o initTotalMap
    var processedPoliceReactions = 0
    var initPoliceReactionMap = function(callback) {
        
        for (var y = 0; y < Files.years.length; y++) {
            var year = Files.years[y];
            
            var filenames = Files.getAllPoliceReactionsFileNames(year);
            for (var f = 0; f < filenames.length; f++) {
                var filename = filenames[f];
                
                Utils.readCSVFile('./dataset/' + filename, f, year, filenames.length, function(data, crimeIndex, year, filenamesLength) {
                    for(var i = 0; i < data.length; i++) {
                        var dpKey = data[i]["CISP (DP)"];
                        if (!self.crimeMap.hasOwnProperty(dpKey)) {
                            self.crimeMap[dpKey] = {};
                            self.crimeMap[dpKey]["Município"] = data[i]["Município"];
                            self.crimeMap[dpKey]["AISP (BPM)"] = data[i]["AISP (BPM)"];
                            self.crimeMap[dpKey]["RISP"] = data[i]["RISP"];
                            
                            self.crimeMap[dpKey]["years"] = {};
                            self.crimeMap[dpKey]["totalYearsReactions"] = 0;
                        }
                        var dpYearsValue = self.crimeMap[dpKey]["years"];
                        if (!dpYearsValue.hasOwnProperty(year)) {
                            dpYearsValue[year] = {};
                            
                        }
                        var yearValue = dpYearsValue[year];
                        if (!yearValue.hasOwnProperty("reactions")) {
                            yearValue["reactions"] = initAndReturnCrimeArray(filenamesLength);
                            yearValue["totalReactions"] = 0;
                        }
                        var reactions = yearValue["reactions"];
                        reactions[crimeIndex][0] = data[i]["jan"]; 
                        reactions[crimeIndex][1] = data[i]["fev"]; 
                        reactions[crimeIndex][2] = data[i]["mar"]; 
                        reactions[crimeIndex][3] = data[i]["abr"]; 
                        reactions[crimeIndex][4] = data[i]["mai"]; 
                        reactions[crimeIndex][5] = data[i]["jun"]; 
                        reactions[crimeIndex][6] = data[i]["jul"]; 
                        reactions[crimeIndex][7] = data[i]["ago"]; 
                        reactions[crimeIndex][8] = data[i]["set"]; 
                        reactions[crimeIndex][9] = data[i]["out"]; 
                        reactions[crimeIndex][10] = data[i]["nov"]; 
                        reactions[crimeIndex][11] = data[i]["dez"]; 
                        reactions[crimeIndex][12] = data[i]["total"];  
                        yearValue["totalReactions"] += data[i]["total"];
                        self.crimeMap[dpKey]["totalYearsReactions"] += data[i]["total"];
                    }
                    
                    processedPoliceReactions++;
                    if (processedPoliceReactions >= (Files.years.length * Files.policeReactionsNames.length) ) {
                        callback();
                    }
                });
            }
        }
        
        //console.log(self.crimeMap);
        console.log(self.aispNames)
        console.log(self.citiesNames)
        console.log(self.rispNames)
    }
    
    var initOcurrenceControl = function(){
        for (var i = 0; i < Files.occurrencesNames.length; i++) {
            var crime = Files.occurrencesNames[i];
            var newInfo = {
                id: i,
                name: crime,
                weight: 1,
                active: true
            };
            
            self.ocurrenceControl.push(newInfo);
        }
    }
    
    var initTotalControl = function(){
        for (var i = 0; i < Files.totalNames.length; i++) {
            var total = Files.totalNames[i];
            var newInfo = {
                id: i,
                name: total,
                weight: 1,
                active: true
            };
            
            self.totalControl.push(newInfo);
        }
    }
    
    var initPoliceReactionControl = function(){
        for (var i = 0; i < Files.policeReactionsNames.length; i++) {
            var reaction = Files.policeReactionsNames[i];
            var newInfo = {
                id: i,
                name: reaction,
                weight: 1,
                active: true
            };
            
            self.policeReactionControl.push(newInfo);
        }
    }
    
    var getTotalKeyDataType = function(dataType) {
        var keyDataType = "totalYearsCrimes";
        
        if (dataType == undefined) {
            return keyDataType;
        }
        
        if (dataType == 1) {
            keyDataType = "totalYearsTotals";
        } else if (dataType == 2) {
            keyDataType = "totalYearsReactions";
        }
        
        return keyDataType;
    }
    
    var getKeyDataType = function(dataType) {
        var keyDataType = "crimes";
        
        if (dataType == undefined) {
            return keyDataType;
        }
        
        if (dataType == 1) {
            keyDataType = "totals";
        } else if (dataType == 2) {
            keyDataType = "reactions";
        }
        
        return keyDataType;
    }
    
    //dataType-> 0= crime, 1= totais, 2= reações
    self.getActiveOcurrences = function(dataType) {
        var l = [];
        var changed = false;
        
        if (dataType == undefined) {
            dataType = 0;
        }
        
        if (dataType == 0) {
            for (var i = 0; i < self.ocurrenceControl.length; i++) {
                if (self.ocurrenceControl[i].active) {
                    l.push({id: i, weight: self.ocurrenceControl[i].weight, name: self.ocurrenceControl[i].name});
                    if (self.ocurrenceControl[i].weight != 1)
                        changed = true
                }
            }
        } else if (dataType == 1) {
            for (var i = 0; i < self.totalControl.length; i++) {
                if (self.totalControl[i].active) {
                    l.push({id: i, weight: self.totalControl[i].weight, name: self.totalControl[i].name});
                    if (self.totalControl[i].weight != 1)
                        changed = true
                }
            }
        } else {
            for (var i = 0; i < self.policeReactionControl.length; i++) {
                if (self.policeReactionControl[i].active) {
                    l.push({id: i, weight: self.policeReactionControl[i].weight, name: self.policeReactionControl[i].name});
                    if (self.policeReactionControl[i].weight != 1)
                        changed = true
                }
            }
        }
        
        return {list: l, weightChanged: changed};
    }
    
    var canOptimizeQuery = function(activeListSize, dataType) {
        if (dataType == undefined) {
            dataType = 0;
        }
        
        if (dataType == 0) {
            if (activeListSize >= self.ocurrenceControl.length)
                return true;
        } else if (dataType == 1) {
            if (activeListSize >= self.totalControl.length)
                return true;
        } else if (dataType == 2) {
            if (activeListSize >= self.policeReactionControl.length)
                return true;
        }
        
        return false
    }
    
    var optimizedQuery = function(name, dataType, zoomOption) {
        //testa se todas as ocorrências foram selecionadas
        if (zoomOption === 0) {
            return self.queryRISP_AllOcurrences(name, dataType);
        } else if (zoomOption === 1) {
            return self.queryCity_AllOcurrences(name, dataType);
        } else if (zoomOption === 2) {
            return self.queryAISP_AllOcurrences(name, dataType);
        } else if (zoomOption === 3) {
            return self.queryDP_AllOcurrences(name, dataType);
        }
        
        return 0;
    }
    
    self.getTimeWindowLists = function() {
        var ms = [];
        var ys = [];
        var monthsMap = null;
        
        if (self.timeWindow.typeActived == 0) {
            
            monthsMap = {};
            
            /*for (var i = self.timeWindow.timeWindowMonthSpecific.startMonth; i <= self.timeWindow.timeWindowMonthSpecific.endMonth; i++) {
                ms.push(i);
            }*/
            
            var startYear = parseInt(self.timeWindow.timeWindowMonthSpecific.startYear);
            var endYear = parseInt(self.timeWindow.timeWindowMonthSpecific.endYear);
            var endMonth = self.timeWindow.timeWindowMonthSpecific.endMonth;
            var startMonth = self.timeWindow.timeWindowMonthSpecific.startMonth;
            
            for (var i = startYear; i <= endYear; i++) {
                ys.push(i);
                
                if (!monthsMap.hasOwnProperty(i.toString())) {
                    monthsMap[i.toString()] = [];
                }
                
                var lastMonth = i != endYear ? 11 : endMonth;
                var beginMonth = i != startYear ? 0 : startMonth;
                
                for (var y = beginMonth; y <= lastMonth; y++) {
                    ms.push(y);
                    monthsMap[i.toString()].push(y);
                }
            }
        } else if (self.timeWindow.typeActived == 1) {
            for (var i = parseInt(self.timeWindow.timeWindowYearSpecific.startYear); i <= parseInt(self.timeWindow.timeWindowYearSpecific.endYear); i++) {
                ys.push(i);
            }
            
            ms = [0,1,2,3,4,5,6,7,8,9,10,11];
        } else if (self.timeWindow.typeActived == 2) {
            if (self.timeWindow.timeWindowMonthPeriodic.months.length === 0) {
                ms = [0,1,2,3,4,5,6,7,8,9,10,11];
            } else {
                ms = self.timeWindow.timeWindowMonthPeriodic.months;
            }
            
            if (self.timeWindow.timeWindowMonthPeriodic.years.length ===0) {
                ys = [2013,2014,2015,2016,2017];
            } else {
                ys = self.timeWindow.timeWindowMonthPeriodic.years;
            }
            
        } else if (self.timeWindow.typeActived == 3) {
            if (self.timeWindow.timeWindowYearPeriodic.years.length === 0) {
                ys = [2013,2014,2015,2016,2017];
            } else {
                ys = self.timeWindow.timeWindowYearPeriodic.years;
            }
        }
        
        return {months: ms, years: ys, yearMonthsMap: monthsMap};
    }
    
    self.clearTemps = function() {
        delete self.average;
        self.average = null;
        
        delete self.averageRelative;
        self.averageRelative = null;
    }
    
    self.querySelecteds = function(zoomKeyName, selecteds) {
        var dataType = 0;
        var result = [];
        
        var keyDataTypeCrimes = getKeyDataType(0);
        var keyDataTypeTotals = getKeyDataType(1);
        var keyDataTypeReactions = getKeyDataType(2);
        
        var activeListCrimes = self.getActiveOcurrences(0).list;
        var activeListTotals = self.getActiveOcurrences(1).list;
        var activeListReactions = self.getActiveOcurrences(2).list;
        
        var timeWindowList = self.getTimeWindowLists();
        
        for (var zoomIndex = 0; zoomIndex < selecteds.length; zoomIndex++) {
            //var zoom = selecteds[zoomIndex].id;            
            var zoomObject = selecteds[zoomIndex];
            var dp = null;
            
            //if (!Utils.listContains(result, zoom))
                result.push({crimes: {}, totals: {}, reactions: {}, name: zoomObject.name, id: zoomObject.id});
            
            for (var dpkey in self.crimeMap) {
                dp = self.crimeMap[dpkey];
                if (zoomKeyName == 'DP' || dp[zoomKeyName] == zoomObject.id) {
                    
                    for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
                        var y = timeWindowList.years[yIndex].toString();
                        var year = dp['years'][y];
                        
                        var crimes = year[keyDataTypeCrimes];
                        var totals = year[keyDataTypeTotals];
                        var reactions = year[keyDataTypeReactions];
                        
                        for (var i = 0; i < activeListCrimes.length; i++) {
                            var index = activeListCrimes[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = crimes[index][m]*activeListCrimes[i].weight;

                                    var totalRisp = result[zoomIndex].crimes;
                                    var totalKey = y + "_" + (m+1).toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'year': y, month: m, value: val};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = crimes[index][12]*activeListCrimes[i].weight;

                                var totalRisp = result[zoomIndex].crimes;
                                var totalKey = y.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'year': y, value: val};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListTotals.length; i++) {
                            var index = activeListTotals[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = totals[index][m]*activeListTotals[i].weight;

                                    var totalRisp = result[zoomIndex].totals;
                                    var totalKey = y + "_" + (m+1).toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'year': y, month: m, value: val};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = totals[index][12]*activeListTotals[i].weight;

                                var totalRisp = result[zoomIndex].totals;
                                var totalKey = y.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'year': y, value: val};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListReactions.length; i++) {
                            var index = activeListReactions[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = reactions[index][m]*activeListReactions[i].weight;

                                    var totalRisp = result[zoomIndex].reactions;
                                    var totalKey = y + "_" + (m+1).toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'year': y, month: m, value: val};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = reactions[index][12]*activeListReactions[i].weight;

                                var totalRisp = result[zoomIndex].reactions;
                                var totalKey = y.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'year': y, value: val};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (self.showAverage) {
            if (self.average == null)
                self.average = self.queryAverageZoomInMonths(zoomKeyName);
        
            result.push(self.average);
        }
        
        return result;
    }
    
    self.querySelectedsByPop = function(zoomKeyName, selecteds, maxValue) {
        var dataType = 0;
        var result = [];
        
        var keyDataTypeCrimes = getKeyDataType(0);
        var keyDataTypeTotals = getKeyDataType(1);
        var keyDataTypeReactions = getKeyDataType(2);
        
        var activeListCrimes = self.getActiveOcurrences(0).list;
        var activeListTotals = self.getActiveOcurrences(1).list;
        var activeListReactions = self.getActiveOcurrences(2).list;
        
        var timeWindowList = self.getTimeWindowLists();
        
        for (var zoomIndex = 0; zoomIndex < selecteds.length; zoomIndex++) {
            //var zoom = selecteds[zoomIndex].id;            
            var zoomObject = selecteds[zoomIndex];
            
            var dp = null;
            
            result.push({crimes: {}, totals: {}, reactions: {}, name: zoomObject.name, id: zoomObject.id});
            
            for (var dpkey in self.crimeMap) {
                dp = self.crimeMap[dpkey];
                if (zoomKeyName == 'DP' || dp[zoomKeyName] == zoomObject.id) {
                    
                    for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
                        var y = timeWindowList.years[yIndex].toString();
                        var year = dp['years'][y];
                        
                        var crimes = year[keyDataTypeCrimes];
                        var totals = year[keyDataTypeTotals];
                        var reactions = year[keyDataTypeReactions];
                        
                        for (var i = 0; i < activeListCrimes.length; i++) {
                            var index = activeListCrimes[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = crimes[index][m]*activeListCrimes[i].weight;

                                    var totalRisp = result[zoomIndex].crimes;
                                    var totalKey = y + "_" + (m+1).toString();

                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'year': y, month: m, value: val};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = crimes[index][12]*activeListCrimes[i].weight;

                                var totalRisp = result[zoomIndex].crimes;
                                var totalKey = y.toString();

                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'year': y, value: val};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListTotals.length; i++) {
                            var index = activeListTotals[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = totals[index][m]*activeListTotals[i].weight;

                                    var totalRisp = result[zoomIndex].totals;
                                    var totalKey = y + "_" + (m+1).toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'year': y, month: m, value: val};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = totals[index][12]*activeListTotals[i].weight;

                                var totalRisp = result[zoomIndex].totals;
                                var totalKey = y.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'year': y, value: val};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListReactions.length; i++) {
                            var index = activeListReactions[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = reactions[index][m]*activeListReactions[i].weight;

                                    var totalRisp = result[zoomIndex].reactions;
                                    var totalKey = y + "_" + (m+1).toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'year': y, month: m, value: val};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = reactions[index][12]*activeListReactions[i].weight;

                                var totalRisp = result[zoomIndex].reactions;
                                var totalKey = y.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'year': y, value: val};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        //recuperando lista mensal com máximos para ser usado no cálculo relatico
        var maxValues = self.queryMaxByPopZoomInMonths(zoomKeyName);
        
        //tornando valor relativo. Talvez dá pra usar o loop anterior
        for (var keyIndex = 0; keyIndex < result.length; keyIndex++) {
        
            var key = result[keyIndex].id;
            var object = result[keyIndex];
            var pop = 0;
            
            if (zoomKeyName == "Município") {
                pop = PopulationMap.getPopulationByMunicipio(key);
                pop = (pop == undefined) ? 0 : pop;
                
            } else if (zoomKeyName == "AISP (BPM)") {
                pop = PopulationMap.getPopulationByBPM(key);
	            pop = (pop == undefined) ? 0 : pop;
            }
            
            var crimes = object["crimes"];
            var totals = object["totals"];
            var reactions = object["reactions"];
            
            //o certo seria procurar um maxValue para cada combinação ano e mês
            //porém, podemos ter um maxValue estimado por mês dividindo maxValue pelo número de entrada em crimes
            //var estimatedMaxValue = maxValue / Object.keys(crimes).length;
            
            for (var cKey in crimes) {
                var cObject = crimes[cKey];
                var denominador = maxValues.crimes[cKey];
                
                cObject.value = (pop != 0 && denominador != 0) ? ((100*(cObject.value / pop)) / denominador ) : 0;
            }
            
            for (var cKey in totals) {
                var cObject = totals[cKey];
                var denominador = maxValues.totals[cKey];
                
                cObject.value = (pop != 0 && denominador != 0) ? ((100*(cObject.value / pop)) / denominador) : 0;
            }
            
            for (var cKey in reactions) {
                var cObject = reactions[cKey];
                var denominador = maxValues.reactions[cKey];
                
                cObject.value = (pop != 0 && denominador != 0) ? ((100*(cObject.value / pop)) / denominador) : 0;
            }
        }
        
        if (self.showAverage) {
            if (self.averageRelative == null)
                self.averageRelative = self.queryAverageByPopZoomInMonths(zoomKeyName, maxValues);

            result.push(self.averageRelative);
        }
        
        return result;
    }
    
    self.querySelectedsForHistogram = function(zoomKeyName, selecteds) {
        var result = [];
        
        var keyDataTypeCrimes = getKeyDataType(0);
        var keyDataTypeTotals = getKeyDataType(1);
        var keyDataTypeReactions = getKeyDataType(2);
        
        var activeListCrimes = self.getActiveOcurrences(0).list;
        var activeListTotals = self.getActiveOcurrences(1).list;
        var activeListReactions = self.getActiveOcurrences(2).list;
        
        var timeWindowList = self.getTimeWindowLists();
        
        for (var zoomIndex = 0; zoomIndex < selecteds.length; zoomIndex++) {
            //var zoom = selecteds[zoomIndex].id;            
            var zoomObject = selecteds[zoomIndex];
        
            var dp = null;
            
            result.push({crimes: {}, totals: {}, reactions: {}, name: zoomObject.name, id: zoomObject.id});
            
            for (var dpkey in self.crimeMap) {
                dp = self.crimeMap[dpkey];
                if (zoomKeyName == 'DP' || dp[zoomKeyName] == zoomObject.id) {
                    
                    for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
                        var y = timeWindowList.years[yIndex].toString();
                        var year = dp['years'][y];
                        
                        var crimes = year[keyDataTypeCrimes];
                        var totals = year[keyDataTypeTotals];
                        var reactions = year[keyDataTypeReactions];
                        
                        for (var i = 0; i < activeListCrimes.length; i++) {
                            var index = activeListCrimes[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = crimes[index][m]*activeListCrimes[i].weight;

                                    var totalRisp = result[zoomIndex].crimes;
                                    var totalKey = index.toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = crimes[index][12]*activeListCrimes[i].weight;

                                var totalRisp = result[zoomIndex].crimes;
                                var totalKey = index.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListTotals.length; i++) {
                            var index = activeListTotals[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = totals[index][m]*activeListTotals[i].weight;

                                    var totalRisp = result[zoomIndex].totals;
                                    var totalKey = index.toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = totals[index][12]*activeListTotals[i].weight;

                                var totalRisp = result[zoomIndex].totals;
                                var totalKey = index.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListReactions.length; i++) {
                            var index = activeListReactions[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = reactions[index][m]*activeListReactions[i].weight;

                                    var totalRisp = result[zoomIndex].reactions;
                                    var totalKey = index.toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = reactions[index][12]*activeListReactions[i].weight;

                                var totalRisp = result[zoomIndex].reactions;
                                var totalKey = index.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        //iterando no result para calcular os totais de cada zoom
        
        for (var keyIndex = 0; keyIndex < result.length; keyIndex++) {
                        
            var crimes = result[keyIndex].crimes;
            var totals = result[keyIndex].totals;
            var reactions = result[keyIndex].reactions;
            
            if (Object.keys(crimes).length > 1) {
                var sumCrimes = 0;
                for (var cKey in crimes) {
                    var crime = crimes[cKey];

                    sumCrimes += crime.value;
                }

                crimes["Total"] = {'name': "Total", value: sumCrimes, id: 19};
            }
            
            /*var sumTotals = 0;
            for (var cKey in totals) {
                var total = totals[cKey];
                
                sumTotals += total.value;
            }
            
            totals["Total"] = {'name': "Total", value: sumTotals, id: 19};*/
            
            if (Object.keys(reactions).length > 1) {
                var sumReactions = 0;
                for (var cKey in reactions) {
                    var reaction = reactions[cKey];

                    sumReactions += reaction.value;
                }

                reactions["Total"] = {'name': "Total", value: sumReactions, id: 19};
            }
        }
        
        return result;
    }
    
    self.querySelectedsForHistogramByPop = function(zoomKeyName, selecteds, maxValue) {
        var result = [];
        
        var keyDataTypeCrimes = getKeyDataType(0);
        var keyDataTypeTotals = getKeyDataType(1);
        var keyDataTypeReactions = getKeyDataType(2);
        
        var activeListCrimes = self.getActiveOcurrences(0).list;
        var activeListTotals = self.getActiveOcurrences(1).list;
        var activeListReactions = self.getActiveOcurrences(2).list;
        
        var timeWindowList = self.getTimeWindowLists();
        
        for (var zoomIndex = 0; zoomIndex < selecteds.length; zoomIndex++) {
            //var zoom = selecteds[zoomIndex].id;            
            var zoomObject = selecteds[zoomIndex];
            var dp = null;
            
            //if (!result.hasOwnProperty(zoom))
            result.push({crimes: {}, totals: {}, reactions: {}, name: zoomObject.name, id: zoomObject.id});
            
            for (var dpkey in self.crimeMap) {
                dp = self.crimeMap[dpkey];
                if (zoomKeyName == 'DP' || dp[zoomKeyName] == zoomObject.id) {
                    
                    for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
                        var y = timeWindowList.years[yIndex].toString();
                        var year = dp['years'][y];
                        
                        var crimes = year[keyDataTypeCrimes];
                        var totals = year[keyDataTypeTotals];
                        var reactions = year[keyDataTypeReactions];
                        
                        for (var i = 0; i < activeListCrimes.length; i++) {
                            var index = activeListCrimes[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = crimes[index][m]*activeListCrimes[i].weight;

                                    var totalRisp = result[zoomIndex].crimes;
                                    var totalKey = index.toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = crimes[index][12]*activeListCrimes[i].weight;

                                var totalRisp = result[zoomIndex].crimes;
                                var totalKey = index.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListTotals.length; i++) {
                            var index = activeListTotals[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = totals[index][m]*activeListTotals[i].weight;

                                    var totalRisp = result[zoomIndex].totals;
                                    var totalKey = index.toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = totals[index][12]*activeListTotals[i].weight;

                                var totalRisp = result[zoomIndex].totals;
                                var totalKey = index.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                        
                        for (var i = 0; i < activeListReactions.length; i++) {
                            var index = activeListReactions[i].id;
                            
                            if (self.timeWindow.isMonth) {
                                if (timeWindowList.yearMonthsMap != null) {
                                    timeWindowList.months = timeWindowList.yearMonthsMap[y];
                                }

                                for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                    var m = parseInt(timeWindowList.months[mIndex]);
                                    var val = reactions[index][m]*activeListReactions[i].weight;

                                    var totalRisp = result[zoomIndex].reactions;
                                    var totalKey = index.toString();
                                    if (!totalRisp.hasOwnProperty(totalKey)) {
                                        totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                    } else {
                                        totalRisp[totalKey].value += val;
                                    }
                                }
                            } else {
                                var val = reactions[index][12]*activeListReactions[i].weight;

                                var totalRisp = result[zoomIndex].reactions;
                                var totalKey = index.toString();
                                if (!totalRisp.hasOwnProperty(totalKey)) {
                                    totalRisp[totalKey] = {'name': Files.occurrencesNames[index], value: val, id: index};
                                } else {
                                    totalRisp[totalKey].value += val;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        //iterando no result para calcular os totais de cada zoom
        for (var keyIndex = 0; keyIndex < result.length; keyIndex++) {
            
            var objectValue = result[keyIndex];
            var pop = 0;
            
            if (zoomKeyName == "Município") {
                pop = PopulationMap.getPopulationByMunicipio(objectValue.id);
                pop = (pop == undefined) ? 0 : pop;
                
            } else if (zoomKeyName == "AISP (BPM)") {
                pop = PopulationMap.getPopulationByBPM(objectValue.id);
	            pop = (pop == undefined) ? 0 : pop;
            }
            
            var crimes = result[keyIndex].crimes;
            var totals = result[keyIndex].totals;
            var reactions = result[keyIndex].reactions;
            
            if (Object.keys(crimes).length > 1) {
                var sumCrimes = 0;
                for (var cKey in crimes) {
                    var crime = crimes[cKey];

                    crime.value = (pop != 0 && maxValue != 0) ? ((100*(crime.value / pop)) / maxValue ) : 0;
                    crime.value = parseFloat(crime.value.toFixed(2));

                    sumCrimes += crime.value;
                }
                
                sumCrimes = parseFloat(sumCrimes.toFixed(2));
                crimes["Total"] = {'name': "Total", value: sumCrimes, id: 19};
            }
            
            
            /*var sumTotals = 0;
            for (var cKey in totals) {
                var total = totals[cKey];
                
                total.value = (pop != 0 && maxValue != 0) ? ((100*(total.value / pop)) / maxValue ) : 0;
                total.value = parseFloat(total.value.toFixed(2));
                
                sumTotals += total.value;
            }
            
            sumTotals = parseFloat(sumTotals.toFixed(2));
            totals["Total"] = {'name': "Total", value: sumTotals, id: 19};*/
            
            if (Object.keys(reactions).length > 1) {
                var sumReactions = 0;
                for (var cKey in reactions) {
                    var reaction = reactions[cKey];

                    reaction.value = (pop != 0 && maxValue != 0) ? ((100*(reaction.value / pop)) / maxValue ) : 0;
                    reaction.value = parseFloat(reaction.value.toFixed(2));

                    sumReactions += reaction.value;
                }

                sumReactions = parseFloat(sumReactions.toFixed(2));
                reactions["Total"] = {'name': "Total", value: sumReactions, id: 19};
            }
        }
        
        return result;
    }
    
    //dataType-> 0= crime, 1= totais, 2= reações
    self.queryRISP = function(risp, dataType) {
        
        var keyDataType = getKeyDataType(dataType);
        var activeOcurrences = self.getActiveOcurrences(dataType);
        var activeList = activeOcurrences.list;
        var weightChanged = activeOcurrences.weightChanged;
        
        var timeWindowList = self.getTimeWindowLists();
	
	    if (!weightChanged && (timeWindowList.months.length == 12 && timeWindowList.years.length == 5) && canOptimizeQuery(activeList.length, dataType)) {
            return optimizedQuery(risp, dataType, 0);
        }
        
        var value = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            if (dp['RISP'] == risp) {
                for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			        var y = timeWindowList.years[yIndex].toString();
                    var year = dp['years'][y];
                    var crimes = year[keyDataType];
                    for (var i = 0; i < activeList.length; i++) {
                        var index = activeList[i].id;
                        
                        if (self.timeWindow.isMonth) {
                            if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                            for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                var m = parseInt(timeWindowList.months[mIndex]);
                                value += crimes[index][m]*activeList[i].weight;
                            }
                        } else {
                             value += crimes[index][12]*activeList[i].weight;
                        }
                    }
                }
            }
        }
        
        return value;
    }
    
    //usar essa função quando todos os crimes foram selecionados
    self.queryRISP_AllOcurrences = function(risp, dataType) {
        
        var keyDataType = getTotalKeyDataType(dataType);
        
        var value = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            if (dp['RISP'] == risp) {
                value += dp[keyDataType];
            }
        }
        
        return value;
    }
    
    //exceto para dp
    self.queryMaxZoom = function(zoomKeyName, dataType) {
        var keyDataType = getKeyDataType(dataType);
        var activeOcurrences = self.getActiveOcurrences(dataType);
        var activeList = activeOcurrences.list;
        var weightChanged = activeOcurrences.weightChanged;
        
        var timeWindowList = self.getTimeWindowLists();
	
	    if (!weightChanged && (timeWindowList.months.length == 12 && timeWindowList.years.length == 5) && canOptimizeQuery(activeList.length, dataType)) {
            return self.queryMaxZoom_AllOcurrences(zoomKeyName, dataType);
        }
        
        var valueMap = {};
        var maxValue = 0;
        var dp = null;
        
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            var valueDP = 0;
            
            if (!valueMap.hasOwnProperty(dp[zoomKeyName])) {
                valueMap[dp[zoomKeyName]] = 0;
            }

            for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			    var y = timeWindowList.years[yIndex].toString();
                
                var year = dp['years'][y];
                var crimes = year[keyDataType];
                for (var i = 0; i < activeList.length; i++) {
                    var index = activeList[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                            timeWindowList.months = timeWindowList.yearMonthsMap[y];
                        }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            valueDP += crimes[index][m]*activeList[i].weight;
                        } 
                    } else {
                        valueDP += crimes[index][12]*activeList[i].weight;
                    }
                }
            }
            
            valueMap[dp[zoomKeyName]] += valueDP;
        }
        
        for (var key in valueMap) {
            var value = valueMap[key];
            if (value > maxValue)
                maxValue = value;
        }
        
        return maxValue;
    }
    
    self.queryMaxByPopZoom = function(zoomKeyName, dataType) {
        var keyDataType = getKeyDataType(dataType);
        var activeOcurrences = self.getActiveOcurrences(dataType);
        var activeList = activeOcurrences.list;
        var weightChanged = activeOcurrences.weightChanged;
        
        var timeWindowList = self.getTimeWindowLists();
	
	    if (!weightChanged && (timeWindowList.months.length == 12 && timeWindowList.years.length == 5) && canOptimizeQuery(activeList.length, dataType)) {
            return self.queryMaxByPopZoom_AllOcurrences(zoomKeyName, dataType);
        }
        
        var valueMap = {};
        var maxValue = 0;
        var dp = null;
        
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            var valueDP = 0;
            
            if (!valueMap.hasOwnProperty(dp[zoomKeyName])) {
                valueMap[dp[zoomKeyName]] = 0;
            }

            for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			    var y = timeWindowList.years[yIndex].toString();
                
                var year = dp['years'][y];
                var crimes = year[keyDataType];
                for (var i = 0; i < activeList.length; i++) {
                    var index = activeList[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            valueDP += crimes[index][m]*activeList[i].weight;
                        }
                    } else {
                        valueDP += crimes[index][12]*activeList[i].weight;
                    }
                }
            }
            
            valueMap[dp[zoomKeyName]] += valueDP;
        }
        
        for (var key in valueMap) {
            var value = valueMap[key];
            var pop = 0;
            if (zoomKeyName == "Município")
                pop = PopulationMap.getPopulationByMunicipio(key);
            else
                pop = PopulationMap.getPopulationByBPM(key);
            
            pop = (pop == undefined) ? 0 : pop;
            var newValue = pop != 0 ? (value / pop) : 0;
            
            if (newValue > maxValue) {
                maxValue = newValue;
            }
        }
        
        return maxValue;
    }
    
    self.queryMaxByPopZoomInMonths = function(zoomKeyName) {
        var keyDataTypeCrimes = getKeyDataType(0);
        var keyDataTypeTotals = getKeyDataType(1);
        var keyDataTypeReactions = getKeyDataType(2);
        
        var activeListCrimes = self.getActiveOcurrences(0).list;
        var activeListTotals = self.getActiveOcurrences(1).list;
        var activeListReactions = self.getActiveOcurrences(2).list;
        
        var timeWindowList = self.getTimeWindowLists();
        
        var valueMap = {};
        var result = {crimes: {}, totals: {}, reactions: {}};
        
        var dp = null;
        
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            
            if (!valueMap.hasOwnProperty(dp[zoomKeyName])) {
                valueMap[dp[zoomKeyName]] = {crimes: {}, totals: {}, reactions: {}};
            }

            for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			    var y = timeWindowList.years[yIndex].toString();
                
                var year = dp['years'][y];
                
                var crimes = year[keyDataTypeCrimes];
                var totals = year[keyDataTypeTotals];
                var reactions = year[keyDataTypeReactions];
                
                for (var i = 0; i < activeListCrimes.length; i++) {
                    var index = activeListCrimes[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                            timeWindowList.months = timeWindowList.yearMonthsMap[y];
                        }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = crimes[index][m]*activeListCrimes[i].weight;

                            var mapCrimes = valueMap[dp[zoomKeyName]].crimes;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = crimes[index][12]*activeListCrimes[i].weight;

                        var mapCrimes = valueMap[dp[zoomKeyName]].crimes;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
                
                for (var i = 0; i < activeListTotals.length; i++) {
                    var index = activeListTotals[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                            timeWindowList.months = timeWindowList.yearMonthsMap[y];
                        }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = totals[index][m]*activeListTotals[i].weight;

                            var mapCrimes = valueMap[dp[zoomKeyName]].totals;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = totals[index][12]*activeListTotals[i].weight;

                        var mapCrimes = valueMap[dp[zoomKeyName]].totals;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
                
                for (var i = 0; i < activeListReactions.length; i++) {
                    var index = activeListReactions[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = reactions[index][m]*activeListReactions[i].weight;

                            var mapCrimes = valueMap[dp[zoomKeyName]].reactions;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = reactions[index][12]*activeListReactions[i].weight;

                        var mapCrimes = valueMap[dp[zoomKeyName]].reactions;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
            }
        }
        
        for (var key in valueMap) {
            var obj = valueMap[key];
            var pop = 0;

            if (zoomKeyName == "Município") {
                pop = PopulationMap.getPopulationByMunicipio(key);
                pop = (pop == undefined) ? 0 : pop;

            } else if (zoomKeyName == "AISP (BPM)") {
                pop = PopulationMap.getPopulationByBPM(key);
                pop = (pop == undefined) ? 0 : pop;
            }

            var crimes = obj["crimes"];
            var totals = obj["totals"];
            var reactions = obj["reactions"];

            for (var cKey in crimes) {
                var cObject = crimes[cKey];

                if (!result.crimes.hasOwnProperty(cKey)) {
                    result.crimes[cKey] = pop != 0 ? (cObject.value / pop) : 0;
                } else {
                    var newValue = pop != 0 ? (cObject.value / pop) : 0;
                    if (newValue > result.crimes[cKey])
                        result.crimes[cKey] = newValue;
                }
            }

            for (var cKey in totals) {
                var cObject = totals[cKey];

                if (!result.totals.hasOwnProperty(cKey)) {
                    result.totals[cKey] = pop != 0 ? (cObject.value / pop) : 0;
                } else {
                    var newValue = pop != 0 ? (cObject.value / pop) : 0;
                    if (newValue > result.totals[cKey])
                        result.totals[cKey] = newValue;
                }
            }

            for (var cKey in reactions) {
                var cObject = reactions[cKey];

                if (!result.reactions.hasOwnProperty(cKey)) {
                    result.reactions[cKey] = pop != 0 ? (cObject.value / pop) : 0;
                } else {
                    var newValue = pop != 0 ? (cObject.value / pop) : 0;
                    if (newValue > result.reactions[cKey])
                        result.reactions[cKey] = newValue;
                }
            }
        }
        
        return result;
    }
    
    self.queryAverageZoomInMonths = function(zoomKeyName) {
        var keyDataTypeCrimes = getKeyDataType(0);
        var keyDataTypeTotals = getKeyDataType(1);
        var keyDataTypeReactions = getKeyDataType(2);
        
        var activeListCrimes = self.getActiveOcurrences(0).list;
        var activeListTotals = self.getActiveOcurrences(1).list;
        var activeListReactions = self.getActiveOcurrences(2).list;
        
        var timeWindowList = self.getTimeWindowLists();
        
        var valueMap = {};
        var result = {crimes: {}, totals: {}, reactions: {}, name: "Average"};
        
        var dp = null;
        
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            
            var valueMapKey = (zoomKeyName == "DP") ? dpkey : dp[zoomKeyName];
            
            if (!valueMap.hasOwnProperty(valueMapKey)) {
                valueMap[valueMapKey] = {crimes: {}, totals: {}, reactions: {}};
            }

            for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			    var y = timeWindowList.years[yIndex].toString();
                
                var year = dp['years'][y];
                
                var crimes = year[keyDataTypeCrimes];
                var totals = year[keyDataTypeTotals];
                var reactions = year[keyDataTypeReactions];
                
                for (var i = 0; i < activeListCrimes.length; i++) {
                    var index = activeListCrimes[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = crimes[index][m]*activeListCrimes[i].weight;

                            var mapCrimes = valueMap[valueMapKey].crimes;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = crimes[index][12]*activeListCrimes[i].weight;

                        var mapCrimes = valueMap[valueMapKey].crimes;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
                
                for (var i = 0; i < activeListTotals.length; i++) {
                    var index = activeListTotals[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                            timeWindowList.months = timeWindowList.yearMonthsMap[y];
                        }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = totals[index][m]*activeListTotals[i].weight;

                            var mapCrimes = valueMap[valueMapKey].totals;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = totals[index][12]*activeListTotals[i].weight;

                        var mapCrimes = valueMap[valueMapKey].totals;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
                
                for (var i = 0; i < activeListReactions.length; i++) {
                    var index = activeListReactions[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = reactions[index][m]*activeListReactions[i].weight;

                            var mapCrimes = valueMap[valueMapKey].reactions;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = reactions[index][12]*activeListReactions[i].weight;

                        var mapCrimes = valueMap[valueMapKey].reactions;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
            }
        }
        
        var countAverage = 0;
        
        if (zoomKeyName == "DP") {
            countAverage = Object.keys(self.crimeMap).length;
        } else if (zoomKeyName == "Municípios") {
            countAverage = Object.keys(self.citiesNames).length;
        } else if (zoomKeyName == "AISP (BPM)") {
            countAverage = Object.keys(self.aispNames).length;
        } else { //RISP
            countAverage = Object.keys(self.rispNames).length;
        }
        
        for (var key in valueMap) {
            var obj = valueMap[key];
            
            var crimes = obj["crimes"];
            var totals = obj["totals"];
            var reactions = obj["reactions"];

            for (var cKey in crimes) {
                var cObject = crimes[cKey];

                if (!result.crimes.hasOwnProperty(cKey)) {
                    result.crimes[cKey] = {};
                    result.crimes[cKey].value = cObject.value / countAverage;
                } else {
                    var newValue = cObject.value / countAverage;
                    result.crimes[cKey].value += newValue;
                }
            }

            for (var cKey in totals) {
                var cObject = totals[cKey];

                if (!result.totals.hasOwnProperty(cKey)) {
                    result.totals[cKey] = {};
                    result.totals[cKey].value = cObject.value / countAverage;
                } else {
                    var newValue = cObject.value / countAverage;
                    result.totals[cKey].value += newValue;
                }
            }

            for (var cKey in reactions) {
                var cObject = reactions[cKey];

                if (!result.reactions.hasOwnProperty(cKey)) {
                    result.reactions[cKey] = {};
                    result.reactions[cKey].value = cObject.value / countAverage;
                } else {
                    var newValue = cObject.value / countAverage;
                    result.reactions[cKey].value += newValue;
                }
            }
        }
        
        return result;
    }
    
    self.queryAverageByPopZoomInMonths = function(zoomKeyName, maxValues) {
        var keyDataTypeCrimes = getKeyDataType(0);
        var keyDataTypeTotals = getKeyDataType(1);
        var keyDataTypeReactions = getKeyDataType(2);
        
        var activeListCrimes = self.getActiveOcurrences(0).list;
        var activeListTotals = self.getActiveOcurrences(1).list;
        var activeListReactions = self.getActiveOcurrences(2).list;
        
        var timeWindowList = self.getTimeWindowLists();
        
        var valueMap = {};
        var result = {crimes: {}, totals: {}, reactions: {}, name: "Average"};
        
        var dp = null;
        
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            
            var valueMapKey = (zoomKeyName == "DP") ? dpkey : dp[zoomKeyName];
            
            if (!valueMap.hasOwnProperty(valueMapKey)) {
                valueMap[valueMapKey] = {crimes: {}, totals: {}, reactions: {}};
            }

            for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			    var y = timeWindowList.years[yIndex].toString();
                
                var year = dp['years'][y];
                
                var crimes = year[keyDataTypeCrimes];
                var totals = year[keyDataTypeTotals];
                var reactions = year[keyDataTypeReactions];
                
                for (var i = 0; i < activeListCrimes.length; i++) {
                    var index = activeListCrimes[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = crimes[index][m]*activeListCrimes[i].weight;

                            var mapCrimes = valueMap[valueMapKey].crimes;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = crimes[index][12]*activeListCrimes[i].weight;

                        var mapCrimes = valueMap[valueMapKey].crimes;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
                
                for (var i = 0; i < activeListTotals.length; i++) {
                    var index = activeListTotals[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = totals[index][m]*activeListTotals[i].weight;

                            var mapCrimes = valueMap[valueMapKey].totals;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    } else {
                        var val = totals[index][12]*activeListTotals[i].weight;

                        var mapCrimes = valueMap[valueMapKey].totals;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
                
                for (var i = 0; i < activeListReactions.length; i++) {
                    var index = activeListReactions[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            var val = reactions[index][m]*activeListReactions[i].weight;

                            var mapCrimes = valueMap[valueMapKey].reactions;
                            var mapKey = y + "_" + (m+1).toString();

                            if (!mapCrimes.hasOwnProperty(mapKey)) {
                                mapCrimes[mapKey] = {value: val};
                            } else {
                                mapCrimes[mapKey].value += val;
                            }
                        }
                    }else {
                        var val = reactions[index][12]*activeListReactions[i].weight;

                        var mapCrimes = valueMap[valueMapKey].reactions;
                        var mapKey = y.toString();

                        if (!mapCrimes.hasOwnProperty(mapKey)) {
                            mapCrimes[mapKey] = {value: val};
                        } else {
                            mapCrimes[mapKey].value += val;
                        }
                    }
                }
            }
        }
        
        var countAverage = 0;
        
        if (zoomKeyName == "DP") {
            countAverage = Object.keys(self.crimeMap).length;
        } else if (zoomKeyName == "Município") {
            countAverage = Object.keys(self.citiesNames).length;
        } else if (zoomKeyName == "AISP (BPM)") {
            countAverage = Object.keys(self.aispNames).length;
        } else { //RISP
            countAverage = Object.keys(self.rispNames).length;
        }
        
        for (var key in valueMap) {
            var obj = valueMap[key];
            
            var pop = 0;
		
            if (zoomKeyName == "Município") {
                pop = PopulationMap.getPopulationByMunicipio(key);
                pop = (pop == undefined) ? 0 : pop;

            } else if (zoomKeyName == "AISP (BPM)") {
                pop = PopulationMap.getPopulationByBPM(key);
                pop = (pop == undefined) ? 0 : pop;
            }
            
            var crimes = obj["crimes"];
            var totals = obj["totals"];
            var reactions = obj["reactions"];

            for (var cKey in crimes) {
                var cObject = crimes[cKey];

                var denominador = maxValues.crimes[cKey];
                var newValue = (pop != 0 && denominador != 0) ? ((100*(cObject.value / pop)) / denominador ) : 0;
                
                if (!result.crimes.hasOwnProperty(cKey)) {
                    result.crimes[cKey] = {};
                    result.crimes[cKey].value = newValue / countAverage;
                } else {
                    newValue = newValue / countAverage;
                    result.crimes[cKey].value += newValue;
                }
            }

            for (var cKey in totals) {
                var cObject = totals[cKey];

                var denominador = maxValues.totals[cKey];
                var newValue = (pop != 0 && denominador != 0) ? ((100*(cObject.value / pop)) / denominador ) : 0;
                
                if (!result.totals.hasOwnProperty(cKey)) {
                    result.totals[cKey] = {};
                    result.totals[cKey].value = newValue / countAverage;
                } else {
                    newValue = newValue / countAverage;
                    result.totals[cKey].value += newValue;
                }
            }

            for (var cKey in reactions) {
                var cObject = reactions[cKey];

                var denominador = maxValues.reactions[cKey];
                var newValue = (pop != 0 && denominador != 0) ? ((100*(cObject.value / pop)) / denominador ) : 0;
                
                if (!result.reactions.hasOwnProperty(cKey)) {
                    result.reactions[cKey] = {};
                    result.reactions[cKey].value = newValue / countAverage;
                } else {
                    newValue = newValue / countAverage;
                    result.reactions[cKey].value += newValue;
                }
            }
        }
        
        return result;
    }
    
    self.queryMaxZoom_AllOcurrences = function(zoomKeyName, dataType) {
        var keyDataType = getTotalKeyDataType(dataType);
        
        var valueMap = {};
        var maxValue = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            
            if (!valueMap.hasOwnProperty(dp[zoomKeyName])) {
                valueMap[dp[zoomKeyName]] = 0;
            }
            
            valueMap[dp[zoomKeyName]] += dp[keyDataType];
        }
        
        for (var key in valueMap) {
            var value = valueMap[key];
            if (value > maxValue)
                maxValue = value;
        }
        
        return maxValue;
    }
    
    self.queryMaxByPopZoom_AllOcurrences = function(zoomKeyName, dataType) {
        var keyDataType = getTotalKeyDataType(dataType);
        
        var valueMap = {};
        var maxValue = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            
            if (!valueMap.hasOwnProperty(dp[zoomKeyName])) {
                valueMap[dp[zoomKeyName]] = 0;
            }
            
            valueMap[dp[zoomKeyName]] += dp[keyDataType];
        }
        
        for (var key in valueMap) {
            var value = valueMap[key];
            var pop = 0;
            if (zoomKeyName == "Município")
                pop = PopulationMap.getPopulationByMunicipio(key);
            else if (zoomKeyName == "AISP (BPM)")
                pop = PopulationMap.getPopulationByBPM(key);
            
            pop = (pop == undefined) ? 0 : pop;
            var newValue = pop != 0 ? (value / pop) : 0;
            
            if (newValue > maxValue) {
                maxValue = newValue;
            }
        }
        
        return maxValue;
    }
    
    self.queryCity = function(city, dataType) {
        var keyDataType = getKeyDataType(dataType);
        var activeOcurrences = self.getActiveOcurrences(dataType);
        var activeList = activeOcurrences.list;
        var weightChanged = activeOcurrences.weightChanged;
        
        var timeWindowList = self.getTimeWindowLists();
	
	    if (!weightChanged && (timeWindowList.months.length == 12 && timeWindowList.years.length == 5) && canOptimizeQuery(activeList.length, dataType)) {
            return optimizedQuery(city, dataType,1);
        }
        
        var value = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            if (dp['Município'] == city) {
                
                for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			        var y = timeWindowList.years[yIndex].toString();
                    var year = dp['years'][y];
                    var crimes = year[keyDataType];
                    for (var i = 0; i < activeList.length; i++) {
                        var index = activeList[i].id;
                        if (self.timeWindow.isMonth) {
                            if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                            for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                var m = parseInt(timeWindowList.months[mIndex]);
                                value += crimes[index][m]*activeList[i].weight;
                            }
                        } else {
                            value += crimes[index][12]*activeList[i].weight;
                        }
                    }
                }
            }
        }
        
        return value;
    }
    
    self.queryCity_AllOcurrences = function(city, dataType) {
        var keyDataType = getTotalKeyDataType(dataType);
        
        var value = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            //console.log(dp["Município"]);
            if (dp['Município'] == city) {
                value += dp[keyDataType];
            }
        }
        
        return value;
    }
    
    self.queryAISP = function(aisp, dataType) {    
        var keyDataType = getKeyDataType(dataType);
        var activeOcurrences = self.getActiveOcurrences(dataType);
        var activeList = activeOcurrences.list;
        var weightChanged = activeOcurrences.weightChanged;
        
        var timeWindowList = self.getTimeWindowLists();
	
	    if (!weightChanged && (timeWindowList.months.length == 12 && timeWindowList.years.length == 5) && canOptimizeQuery(activeList.length, dataType)) {
            return optimizedQuery(aisp, dataType,2);
        }
        
        var value = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            if (dp['AISP (BPM)'] == aisp) {
                for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++){
			        var y = timeWindowList.years[yIndex].toString();
                    var year = dp['years'][y];
                    var crimes = year[keyDataType];
                    for (var i = 0; i < activeList.length; i++) {
                        var index = activeList[i].id;
                        
                        if (self.timeWindow.isMonth) {
                            if (timeWindowList.yearMonthsMap != null) {
                                timeWindowList.months = timeWindowList.yearMonthsMap[y];
                            }

                            for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                                var m = parseInt(timeWindowList.months[mIndex]);
                                value += crimes[index][m]*activeList[i].weight;
                            }
                        } else {
                            value += crimes[index][12]*activeList[i].weight;
                        }
                    }
                }
            }
        }
        
        return value;
    }
    
    self.queryAISP_AllOcurrences = function(aisp, dataType) {
        var keyDataType = getTotalKeyDataType(dataType);
        
        var value = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            if (dp['AISP (BPM)'] == aisp) {
                value += dp[keyDataType];
            }
        }
        
        return value;
    }
    
    self.queryDP = function(dp, dataType) {
        var keyDataType = getKeyDataType(dataType);
        var activeOcurrences = self.getActiveOcurrences(dataType);
        var activeList = activeOcurrences.list;
        var weightChanged = activeOcurrences.weightChanged;
        
        var timeWindowList = self.getTimeWindowLists();
	
	    if (!weightChanged && (timeWindowList.months.length == 12 && timeWindowList.years.length == 5) && canOptimizeQuery(activeList.length, dataType)) {
            return optimizedQuery(dp, dataType,3);
        }
        
        var value = 0;
        var dpValue = self.crimeMap[dp];

        for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++) {
            var y = timeWindowList.years[yIndex].toString();
            var year = dpValue['years'][y];
            var crimes = year[keyDataType];
            for (var i = 0; i < activeList.length; i++) {
                var index = activeList[i].id;
                
                if (self.timeWindow.isMonth) {
                    if (timeWindowList.yearMonthsMap != null) {
                        timeWindowList.months = timeWindowList.yearMonthsMap[y];
                    }

                    for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                        var m = parseInt(timeWindowList.months[mIndex]);
                        value += crimes[index][m]*activeList[i].weight;
                    }
                } else {
                    value += crimes[index][12]*activeList[i].weight;
                }
            }
        }
        
        return value;
    }
    
    self.queryDP_AllOcurrences = function(dp, dataType) {
        var keyDataType = getTotalKeyDataType(dataType);
        
        var value = 0;
        
        value = self.crimeMap[dp][keyDataType];
        
        return value;
    }
    
    self.queryMaxDP = function(dataType) {
        var keyDataType = getKeyDataType(dataType);
        var activeOcurrences = self.getActiveOcurrences(dataType);
        var activeList = activeOcurrences.list;
        var weightChanged = activeOcurrences.weightChanged;
        
        var timeWindowList = self.getTimeWindowLists();
        
        if (!weightChanged && (timeWindowList.months.length == 12 && timeWindowList.years.length == 5) && canOptimizeQuery(activeList.length, dataType)) {
            return self.queryMaxDP_AllOcurrences(dataType);
        }
        
        var maxValue = 0;
        var dp = null;
        
        
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            var valueDP = 0;
            
            for (var yIndex = 0; yIndex < timeWindowList.years.length; yIndex++) {
                var y = timeWindowList.years[yIndex].toString();
                var year = dp['years'][y];
                var crimes = year[keyDataType];
                for (var i = 0; i < activeList.length; i++) {
                    var index = activeList[i].id;
                    
                    if (self.timeWindow.isMonth) {
                        if (timeWindowList.yearMonthsMap != null) {
                            timeWindowList.months = timeWindowList.yearMonthsMap[y];
                        }
                    
                        for (var mIndex = 0; mIndex < timeWindowList.months.length; mIndex++) {
                            var m = parseInt(timeWindowList.months[mIndex]);
                            valueDP += crimes[index][m]*activeList[i].weight;
                        }
                    } else {
                        valueDP += crimes[index][12]*activeList[i].weight;
                    }
                }
            }
            
            if (valueDP > maxValue)
                maxValue = valueDP;
        }
        
        return maxValue;
    }
    
    self.queryMaxDP_AllOcurrences = function(dataType) {
        var keyDataType = getTotalKeyDataType(dataType);
        
        var value = 0;
        var maxValue = 0;
        var dp = null;
        for (var dpkey in self.crimeMap) {
            dp = self.crimeMap[dpkey];
            
            value = dp[keyDataType];
            
            if (value > maxValue)
                maxValue = value;
        }
        
        return maxValue;
    }
    
    self.init = function(callback) {
        
        //iniciando estrutura de controle dos pesos que será usado na janela de configurações
        initOcurrenceControl();
        initTotalControl();
        initPoliceReactionControl();
        
        //Iniciando mapa que contém todos os CSVs. Buscas serão feitas em cima dele
        initCrimeMap(callback); //vamos repassando o callback até carregar tudo
    }
    
    return self;
})();