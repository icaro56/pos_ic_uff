var BarsControl = (function() {
    
    'use strict';
    
    var self = {};
    
    self.crimeBars = null;
    self.totalBars = null;
    self.reactionBars = null;
    
    var margins = {
        top: 50,
        bottom: 30,
        left: 55,
        right: 200
    };
    
    self.update = function(selecteds) {
        if (selecteds) {
            if (self.crimeBars == null) {
                self.crimeBars = new VisUFF.Histogram("barDivCrimes", margins, 500, 300, selecteds, "crimes");
                self.crimeBars.init(true, "s", 0, 10, true, true, "", "Qty. Crimes");
            } else {
                self.crimeBars.updateHistogram(selecteds);
            }
            
            if (self.totalBars == null) {
                self.totalBars = new VisUFF.Histogram("barDivTotals", margins, 500, 300, selecteds, "totals");
                self.totalBars.init(true, "s", 0, 10, true, true, "", "Qty. Occurrences");
            } else {
                self.totalBars.updateHistogram(selecteds);
            }
            
            if (self.reactionBars == null) {
                self.reactionBars = new VisUFF.Histogram("barDivReactions", margins, 500, 300, selecteds, "reactions");
                self.reactionBars.init(true, "s", 0, 10, true, true, "", "Qty. Actions");
            } else {
                self.reactionBars.updateHistogram(selecteds);
            }
        }
    }
    
    self.clear = function() {
        if (self.crimeBars != null) {
            self.crimeBars.destroyAll();
            delete self.crimeBars;
            self.crimeBars = null;
        }
        
        if (self.totalBars != null) {
            self.totalBars.destroyAll();
            delete self.totalBars;
            self.totalBars = null;
        }
        
        if (self.reactionBars != null) {
            self.reactionBars.destroyAll();
            delete self.reactionBars;
            self.reactionBars = null;
        }
    }
    
    return self;
})();