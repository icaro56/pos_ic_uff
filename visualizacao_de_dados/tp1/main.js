var myApp = (function(){
    
'use strict';
    
var self = {};

self.hdataset1 = [5, 10, 13, 19, 21, 25, 22, 18, 15, 13];
self.hdataset2 = [11, 12, 15, 20, 18, 17, 16, 18, 23, 25];
self.hdataset3 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    
self.sdataset1 = [ {x:5, y:20, t:1}, {x:480, y:90, t:2}, {x:250, y:50, t:3}, {x:100, y:33, t:2}, {x:85, y:21, t:3}]; 
self.sdataset2 = [ {x:330, y:95, t:2}, {x:410, y:12, t:1}, {x:475, y:44, t:1}, {x:25, y:67, t:1}, {x:99, y:21, t:3}, {x:220, y:88, t:1}, {x:0, y:0, t:3} ];
    
self.tdataset1 = {formated: false,
                  cities: [ {city: "New York", temperatures: [63.4,58.0,53.3,55.7,64.2,58.8,57.9,61.8,69.3,71.2,68.7,61.8,63.0,66.9,61.7,61.8,62.8,60.8,62.1,65.1,55.6,54.4,54.4,54.8,57.9]},
					        {city: "San Francisco", temperatures: [62.7,59.9,59.1,58.8,58.7,57.0,56.7,56.8,56.7,60.1,61.1,61.5,64.3,67.1,64.6,61.6,61.1,59.2,58.9,57.2,56.4,60.7,65.1,60.9,56.1]},
					        {city: "Austin", temperatures: [72.2,67.7,69.4,68.0,72.4,77.0,82.3,78.9,68.8,68.7,70.3,75.3,76.6,66.6,68.0,70.6,71.1,70.0,61.6,57.4,64.3,72.4,72.4,72.5,72.7]}
                         ],
		          dates: [20111001,20111002,20111003,20111004,20111005,20111006,20111007,20111008,20111009,20111010,20111011,20111012,20111013,20111014,20111015,20111016,20111017,20111018,20111019,20111020,20111021,20111022,20111023,20111024,20111025]};
    
self.tdataset2 = {formated: false,
                  cities: [ {city: "Rio de Janeiro", temperatures: [90.4,58.0,53.3,55.7,64.2,58.8,57.9,61.8,69.3,71.2,68.7,61.8,63.0,66.9,61.7,61.8,62.8,60.8,62.1,65.1,55.6,54.4,54.4,54.8,57.9]},
					        {city: "São Paulo", temperatures: [62.7,59.9,59.1,58.8,58.7,57.0,56.7,56.8,56.7,45.1,61.1,61.5,64.3,67.1,64.6,61.6,61.1,59.2,58.9,57.2,56.4,60.7,65.1,60.9,56.1]},
					        {city: "Belo Horizonte", temperatures: [72.2,67.7,69.4,68.0,72.4,77.0,82.3,78.9,68.8,68.7,70.3,75.3,76.6,66.6,68.0,70.6,71.1,70.0,61.6,57.4,64.3,72.4,72.4,72.5,72.7]}
                         ],
		          dates: [20111001,20111002,20111003,20111004,20111005,20111006,20111007,20111008,20111009,20111010,20111011,20111012,20111013,20111014,20111015,20111016,20111017,20111018,20111019,20111020,20111021,20111022,20111023,20111024,20111025]};
    
self.tdataset3 = {formated: false,
                  cities: [ {city: "A", temperatures: [63.4,58.0,53.3,55.7,64.2,58.8,57.9,61.8,69.3,71.2,68.7,61.8,63.0,66.9,61.7,61.8,62.8,60.8,62.1,65.1,55.6,54.4,54.4,54.8,57.9]},
					        {city: "B", temperatures: [62.7,59.9,59.1,58.8,58.7,57.0,56.7,56.8,56.7,60.1,61.1,61.5,64.3,67.1,64.6,61.6,61.1,59.2,58.9,57.2,56.4,60.7,65.1,60.9,56.1]},
					        {city: "C", temperatures: [30.2,67.7,69.4,68.0,72.4,77.0,82.3,78.9,16.8,68.7,70.3,75.3,76.6,66.6,68.0,70.6,71.1,70.0,61.6,57.4,64.3,72.4,72.4,72.5,37.7]}
                         ],
		          dates: [20111001,20111002,20111003,20111004,20111005,20111006,20111007,20111008,20111009,20111010,20111011,20111012,20111013,20111014,20111015,20111016,20111017,20111018,20111019,20111020,20111021,20111022,20111023,20111024,20111025]};

self.H = undefined;
self.H2 = undefined;
    
self.S = undefined;
self.S2 = undefined;
    
self.T = undefined;
self.T2 = undefined;
    
//1 = histogram, 2 = scatterplot, 3 = temporalseries
self.tipo = 1;

self.run = function () 
{
    
    var margins = {
        top: 10,
        bottom: 50,
        left: 55,
        right: 150
    };

    if (self.tipo == 1) {
        var datasets = [{dataset: self.hdataset1, name: "Dataset 1"},
                        {dataset: self.hdataset2, name: "Dataset 2"} 
                       ];
    
        self.H = new VisUFF.Histogram("mainDiv", margins, 500, 300, datasets);
        self.H.init();

        self.H2 = new VisUFF.Histogram("mainDiv2", margins, 500, 300, datasets);
        self.H2.init();
    }
    else if (self.tipo == 2) {
        var datasets = [{dataset: self.sdataset1, name: "Scatter 1"},
                        {dataset: self.sdataset2, name: "Scatter 2"} 
                        ];
        
        self.S = new VisUFF.ScatterPlots("mainDiv", margins, 500, 300, datasets);
        self.S.init();

        self.S2 = new VisUFF.ScatterPlots("mainDiv2", margins, 500, 300, datasets);
        self.S2.init();
    }
    else if (self.tipo == 3) {
        
        var datasets = [{dataset: self.tdataset1, name: "TimeSeries 1"}/*,
                        {dataset: self.tdataset2, name: "TimeSeries 2"} */
                        ];
        
        self.T = new VisUFF.TimeSeries("mainDiv", margins, 500, 300, datasets);
        self.T.init();

        self.T2 = new VisUFF.TimeSeries("mainDiv2", margins, 500, 300, datasets);
        self.T2.init();
    }
}

self.update = function(){
    if (self.tipo == 1){
        var datasets2 = [{dataset: self.hdataset2,name: "Dataset 2"},
                        {dataset: self.hdataset3,name: "Dataset 1"} 
                        ];
    
        self.H.updateHistogram(datasets2);
        self.H2.updateHistogram(datasets2);
    }
    else if (self.tipo == 2) {
        var datasets = [{dataset: self.sdataset2, name: "Scatter 1"},
                        {dataset: self.sdataset1, name: "Scatter 2"} 
                        ];
        
        self.S.updateScatterPlot(datasets);
        self.S2.updateScatterPlot(datasets);
    }
    else{
        var datasets = [{dataset: self.tdataset2, name: "TimeSeries 1"}/*,
                        {dataset: self.tdataset2, name: "TimeSeries 2"} */
                        ];
        
        self.T.updateTimeSeries(datasets);
        self.T2.updateTimeSeries(datasets);
    }
}

window.onload = self.run;
    
return {
    update: self.update
};
    
})();
