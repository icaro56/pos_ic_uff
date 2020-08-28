var SeriesControl = (function() {
    
    'use strict';
    
    var self = {};
    
    self.crimeSeries = null;
    self.totalSeries = null;
    self.reactionSeries = null;
    
    var margins = {
        top: 10,
        bottom: 70,
        left: 55,
        right: 150
    };
    
    self.callbackBrushes = function(s) {
        //console.log("crime");
        if (self.crimeSeries !== null) {
            self.crimeSeries.updateBrush(s);
        }
        
        if (self.totalSeries !== null) {
            self.totalSeries.updateBrush(s);
        }
        
        if (self.reactionSeries !== null) {
            self.reactionSeries.updateBrush(s);
        }
    }
    
    self.callbackBrushesFinish = function(selectedPaths) {
    
        if (self.crimeSeries !== null) {
            self.crimeSeries.updateFinished();
        }
        
        if (self.totalSeries !== null) {
            self.totalSeries.updateFinished();
        }
        
        if (self.reactionSeries !== null) {
            self.reactionSeries.updateFinished();
        }
        
        //nova janela de tempo
        /*if (selectedPaths.length) {
            if (selectedPaths[0].length) {
            
                var start = selectedPaths[0][0];
                var end = selectedPaths[0][selectedPaths[0].length - 1];

                var startYear = parseInt(start.year);
                var startMonth = start.month;

                var endYear = parseInt(end.year);
                var endMonth = end.month;
                
                var activeTimeWindow = CrimeControl.getTimeWindowLists();
                
                var newYears = [];
                for (var i = 0; i < activeTimeWindow.years.length; i++) {
                    var y = activeTimeWindow.years[i];
                    if (y >= startYear && y <= endYear)
                        newYears.push(y);
                }
                
                var newMonths = [];
                for (var i = 0; i < activeTimeWindow.months.length; i++) {
                    var m = activeTimeWindow.months[i];
                    if (m >= startYear && y <= endYear)
                        newYears.push(y);
                }
            }
            
        }*/
    }
    
    self.callbackZoomX = function(t) {
        if (self.crimeSeries !== null) {
            self.crimeSeries.updateZoomedX(t);
        }
        
        if (self.totalSeries !== null) {
            self.totalSeries.updateZoomedX(t);
        }
        
        if (self.reactionSeries !== null) {
            self.reactionSeries.updateZoomedX(t);
        }
    }
    
    self.callbackZoomY = function(t) {
        if (self.crimeSeries !== null) {
            self.crimeSeries.updateZoomedY(t);
        }
        
        if (self.totalSeries !== null) {
            self.totalSeries.updateZoomedY(t);
        }
        
        if (self.reactionSeries !== null) {
            self.reactionSeries.updateZoomedY(t);
        }
    }


    self.update = function(selecteds, isMonth) {
        if (selecteds) {
            var dateFormat = "%b %y";
            
            var timeWindowList = CrimeControl.getTimeWindowLists();
            
            //var ticksCount = timeWindowList.months.length;
            var ticksCountX = 12;
            
            if (!isMonth) {
                dateFormat = "%Y";
                ticksCountX = timeWindowList.years.length;
            }
            
            if (self.crimeSeries == null) {
                self.crimeSeries = new VisUFF.TimeSeries("mainDivCrimes", margins, 500, 300, selecteds, "crimes", 
                                                         self.callbackBrushes, self.callbackBrushesFinish, self.callbackZoomX, self.callbackZoomY,isMonth);
                
                self.crimeSeries.init(true, "s", dateFormat, 10, ticksCountX, true, true, "", "Qty. of Crimes");
            } else {
                self.crimeSeries.updateTimeSeries(selecteds);
            }
            
            if (self.totalSeries == null) {
                self.totalSeries = new VisUFF.TimeSeries("mainDivTotals", margins, 500, 300, selecteds, "totals", 
                                                         self.callbackBrushes, self.callbackBrushesFinish, self.callbackZoomX, self.callbackZoomY,isMonth);
                self.totalSeries.init(true, "s", dateFormat, 10, ticksCountX, true, true, "", "Qty. of Ocurrences");
            } else {
                self.totalSeries.updateTimeSeries(selecteds);
            }
            
            if (self.reactionSeries == null) {
                self.reactionSeries = new VisUFF.TimeSeries("mainDivReactions", margins, 500, 300, selecteds, "reactions", 
                                                            self.callbackBrushes, self.callbackBrushesFinish, self.callbackZoomX, self.callbackZoomY,isMonth);
                self.reactionSeries.init(true, "s", dateFormat, 10, ticksCountX, true, true, "", "Qty. of Police Actions");
            } else {
                self.reactionSeries.updateTimeSeries(selecteds);
            }
        }
    }
    
    self.clear = function() {
        if (self.crimeSeries != null) {
            self.crimeSeries.destroyAll();
            delete self.crimeSeries;
            self.crimeSeries = null;
        }
        
        if (self.totalSeries != null) {
            self.totalSeries.destroyAll();
            delete self.totalSeries;
            self.totalSeries = null;
        }
        
        if (self.reactionSeries != null) {
            self.reactionSeries.destroyAll();
            delete self.reactionSeries;
            self.reactionSeries = null;
        }
    }
    
    return self;
})();