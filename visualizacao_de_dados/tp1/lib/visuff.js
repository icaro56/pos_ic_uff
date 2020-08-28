var VisUFF = (function(){
    
    'use strict';
    
    var moduleExports = {};
    
    function BaseGraph(divId, margins, width, height, datasets){
        var exports = {};
        
        //variáveis que serão herdadas
        exports.margins = margins;
        exports.gWidth = width;
        exports.gHeight = height;
        
        exports.xScale = undefined;
        exports.yScale = undefined;
        exports.xAxis = undefined;
        exports.yAxis = undefined;
        
        exports.svg = undefined;
        exports.chartGroup = undefined;
        
        exports.divId = "#" + divId;
        exports.chartGroupId = divId + "-chart-area";
        
        exports.datasets = datasets;
        //fim
        
        //funções e métodos que serão herdados
        exports.createSvg = function()
        {
            exports.svg = d3.select(exports.divId).append("svg")
                .attr("width", exports.gWidth + exports.margins.left + exports.margins.right)
                .attr("height", exports.gHeight + exports.margins.top + exports.margins.bottom);
        }
        
        exports.createChartGroup = function() 
        {
            if (exports.svg != undefined)
            {
                exports.chartGroup = exports.svg.append("g")
                    .attr("id", exports.chartGroupId)
                    .attr("width", exports.gWidth)
                    .attr("height", exports.gHeight)
                    .attr("transform", "translate( " + exports.margins.left + ", " + exports.margins.top + ")");
            }
            else
            {
                console.error("SVG não foi criado")
            }
        }
        
        return exports;
    }

    /**
     * Construtor de Histograma
     * @param {String} divId
     * @param {JsonObject} margins. Ex: {top: 10, bottom: 30, left: 25, right: 35}
     * @param {Number} width Largura da área de desenho
     * @param {Number} height Altura da área de desenho
     * @param {array} datasets array. Ex: [{dataset: d, name: n}, {dataset: d2, name: n2}, ....]. dataset é um array de uma dimensão
     * @return {Histogram} class
    */
    moduleExports.Histogram = function(divId, margins, width, height, datasets)
    {
        var self = this;
        var exports = {};
        
        //classe pai
        var parent = BaseGraph(divId, margins, width, height, datasets);
        
        //declaração de variáveis privadas
        self.barWidth = undefined;
        self.rationBarWidth = undefined;
        
        self.colorScale = undefined;
        
        self.minElement = 0;
        self.maxElement = 100;
        
        self.rangeColor = ['#8c510a','#d8b365','#f6e8c3','#5ab4ac','#01665e'];
        self.rangeValues = [];
        
        self.zoomY = undefined;
        self.zoomX = undefined;
        self.brush = undefined;
        
        self.newScaleX = undefined;
        self.newScaleY = undefined;
        
        self.lastX0 = undefined;
        self.lastX1 = undefined;

        //fim
        
        self.findMinMaxElements = function(maxEnable = true, minEnable = false)
        {
            self.minElement = minEnable ? 9999999 : 0;
            self.maxElement = maxEnable ? -1 : 0;
            var lenthTotal = 0;
            
            for (var i = 0; i < parent.datasets.length; i++)
            {
                if (parent.datasets[i].dataset[0] !== undefined) {
                    if (parent.datasets[i].dataset[0] != 0) {
                        parent.datasets[i].dataset.unshift(0);
                    }
                }
                
                if (maxEnable){
                    var auxMax = d3.max(parent.datasets[i].dataset);

                    if (auxMax > self.maxElement)
                    {
                        self.maxElement = auxMax;
                    }
                }
                
                if (minEnable){
                    var auxMin = d3.min(parent.datasets[i].dataset);

                    if (auxMin < self.minElement)
                    {
                        self.minElement = auxMin;
                    }
                }
                
                lenthTotal += parent.datasets[i].dataset.length;
            }
            
            self.rationBarWidth = 100.0 / lenthTotal;
            
            self.colorScale = d3.scaleQuantize()
                                .domain([self.minElement, self.maxElement])
                                .range(self.rangeColor);
            
            var offset = self.maxElement / self.rangeColor.length;
            for (var i = 0; i < self.rangeColor.length; i++) {
                var aux = i < self.rangeColor.length-1 ? 1 : 0;
                var secondPart = ((i+1) * offset) - aux;
                self.rangeValues.push((i*offset) + " - " + secondPart );
            }
            
        }
        
        self.createAxis = function(tickFormat, ticksCount, showAxisX, showAxisY, labelX, labelY, showLegend)
        {
            if (parent.svg != undefined)
            {
                parent.xScale = d3.scaleLinear().domain([0, 100]).range([0, parent.gWidth]);
                self.newScaleX = parent.xScale;
                
                self.barWidth = parent.xScale(self.rationBarWidth);
                
                parent.yScale = d3.scaleLinear().domain([self.minElement, self.maxElement + 1]).range([parent.gHeight, 0]);
                self.newScaleY = parent.yScale;
                
                if (showAxisY) {
                    var yAxisGroup = parent.svg.append('g') .attr('class', 'yAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.margins.top) + ')');
                    
                    parent.yAxis = d3.axisLeft(parent.yScale);
                    parent.yAxis.ticks(ticksCount, tickFormat);
                    
                    yAxisGroup.call(parent.yAxis);
                    
                    parent.svg.append("text")
                          .attr("class", "yAxisLabel")
                          .attr("transform", "rotate(-90)")
                          .attr("y", parent.margins.left - 50)
                          .attr("x", -(parent.gHeight / 2))
                          .attr("dy", "1em")
                          .style("text-anchor", "middle")
                          .text(labelY); 
                }
                
                if (showAxisX){
                    var xAxisGroup = parent.svg.append('g') .attr('class', 'xAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.gHeight + parent.margins.top) + ')'); 
                    
                    parent.xAxis = d3.axisBottom(parent.xScale); 
                    parent.xAxis.ticks(ticksCount, tickFormat);
                    xAxisGroup.call(parent.xAxis);
                    
                    //adicionando label
                    parent.svg.append("text")
                                .attr("class", "xAxisLabel")
                                .attr("transform", "translate( " + (parent.gWidth/2 + parent.margins.left) + ", " + (parent.gHeight + parent.margins.top + 40) + ")" )
                                .style("text-anchor", "middle")
                                .text(labelX);
                }
                
                if (showLegend) {
                    var legend = parent.chartGroup.selectAll(".legend")
                        .data(self.rangeValues)
                        .enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function(d, i) { return "translate(" + (parent.gWidth + parent.margins.right - 40) + "," + i * 11 + ")"; });

                    legend.append("rect")
                          .attr("x", - 10)
                          .attr("width", 10)
                          .attr("height", 10)
                          .style("fill", function(d){return self.colorScale(d.split(" - ")[0])});

                    legend.append("text")
                          .attr("x", - 16)
                          .attr("y", 5)
                          .attr("dy", ".35em")
                          .style("text-anchor", "end")
                          .style("font-size", "10px")
                          .text(function(d) { return d; });
                }
                
            }
            else
            {
                console.error("Não foi possível criar eixos porque SVG não foi criado");
            }
        }
        
        self.createHistogram = function(){
            
            var lastTam = 0;
            for (var i = 0; i < parent.datasets.length; i++){
                
                var tam = (parent.datasets[i].dataset.length * self.barWidth);
                var textPos = tam / 2;
                
                var newTam = lastTam + tam;
                
                
                var barGroup = parent.chartGroup.append("g")
                                    .attr("id", "barGroup" + i)
                                    .attr("class", "barGroup")
                                    .attr("width", tam)
                                    .attr("height", parent.gHeight)
                                    .attr("transform", "translate( " + lastTam + ",0)");
                
                var text = barGroup.append("text")
                                .attr("x", textPos)
                                .attr("y", parent.gHeight + parent.margins.top + 20)
                                .text(parent.datasets[i].name);
                
                var bar = barGroup.selectAll("g")
                                .data(parent.datasets[i].dataset);

                bar.attr("transform", function(d, idx){
                    return "translate( " + idx * self.barWidth + ", 0)";
                })
                .attr("class", "barElement");

                bar = bar.enter()
                        .append("g")
                        .attr("transform", function(d, idx){
                            return "translate( " + idx * self.barWidth + ", 0)";
                        })
                        .attr("class", "barElement");

                bar.append("rect")
                    .attr("y", function(d){return parent.yScale(d);})
                    .attr("width", self.barWidth - 1)
                    .attr("height", function(d){return parent.gHeight - parent.yScale(d);})
                    .style("fill", function(d){return self.colorScale(d)});

                bar.append("text")
                    .attr("x", self.barWidth / 2)
                    .attr("y", function (d) {return parent.yScale(d)})
                    .attr("dy", ".85em")
                    .attr("class", "text-bar")
                    .text(function(d){return d;});
                
                lastTam += tam;
            }
        }
        
        self.brushed = function()
	{
		var s = d3.event.selection;

		var x0 = undefined;
		var x1 = undefined;

		if (s !== undefined) {
			self.lastX0 = x0 = s[0];
    			self.lastX1 = x1 = s[1];
		}
		else {
			x0 = self.lastX0;
    			x1 = self.lastX1;
		}                
		    

		var barElement = parent.svg.selectAll('.barElement');
		barElement.select("rect").style("fill", function(d, idx) {
		    
		    var xCoord = self.newScaleX(idx * self.rationBarWidth) + parent.xScale(self.rationBarWidth/2);
		    
		    if (xCoord >= x0 && xCoord <= x1){
			return "#ec7014";
		    } else {
			return self.colorScale(d);
		    }
		});
	};
        
        self.addBrush = function() {
            self.brush = d3.brushX()
                    .on("start brush", self.brushed);

            parent.chartGroup.append("g")
                .attr("class", "brush")
                .call(self.brush);
        }
        
        self.zoomedX = function()
        {
            var t = d3.event.transform;
            var auxBarWidth = self.barWidth * t.k;

            var nScaleX = t.rescaleX(parent.xScale);
            parent.xAxis.scale(nScaleX);
            
            self.newScaleX = nScaleX;

            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);

            var lastTam = 0;
            for (var i = 0; i < parent.datasets.length; i++)
            {

                var tam = (parent.datasets[i].dataset.length * auxBarWidth);
                var textPos = tam / 2 ;

                var newTam = lastTam + tam;
                
                var barGroup = parent.chartGroup.selectAll("#barGroup" + i)
                                                .attr("transform", "translate( " + lastTam + ",0)");
                
                var bar = barGroup.selectAll("g");
                bar.attr("transform", function(d, idx){return "translate( " + (nScaleX(idx * self.rationBarWidth)) + ", 0)";});
                
                bar.select("rect")
                    .attr("width", auxBarWidth - 1);
                
                bar.select('text')
                     .attr("x", auxBarWidth/2);
                
                lastTam += tam;
            }
            
            self.brushed();
        }
                
        self.zoomedY = function()
        {
            var t = d3.event.transform;

            var nScaleY = t.rescaleY(parent.yScale);
            parent.yAxis.scale(nScaleY);
            
            self.newScaleY = nScaleY;

            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);

            var barGroup = parent.chartGroup.selectAll(".barGroup");
            var bar = barGroup.selectAll("g");
            
            
           /* bar.append("rect")
            .attr("y", function(d){return parent.yScale(d);})
            .attr("width", self.barWidth - 1)
            .attr("height", function(d){return parent.gHeight - parent.yScale(d);})
            .style("fill", function(d){return self.colorScale(d)});*/

            bar.select('rect')
                     .attr("y", function(d){return nScaleY(d);})
                     .attr("height", function(d){return parent.gHeight - ( nScaleY(d) > parent.gHeight ? parent.gHeight : nScaleY(d));});
                     
                     
            bar.select('text')
                     .attr("y", function(d, i) { return nScaleY(d); });
                     
            self.brushed();
        }
        
        self.addZoom = function(showAxisX, showAxisY ) {
            
            //X
            if (showAxisX) {
                
                self.zoomX = d3.zoom()
                    .on("zoom", self.zoomedX);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.gWidth)
                    .attr("height", parent.margins.bottom)
                    .attr("transform", "translate(" + parent.margins.left + "," + (parent.margins.top + parent.gHeight) + ")")
                    .call(self.zoomX);
            }
            //FIM
            
            //Y
            if (showAxisY) {

                self.zoomY = d3.zoom()
                    .on("zoom", self.zoomedY);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.margins.left)
                    .attr("height", parent.gHeight)
                    .attr("transform", "translate(" + 0 + "," + (parent.margins.top) + ")")
                    .call(self.zoomY);
            }
            //FIM
        }
        
        //Funções que serão exportadas
        
        exports.updateHistogram = function(datasets){
            
            parent.datasets = datasets;
            
            self.findMinMaxElements();
            
            var lastTam = 0;
            for (var i = 0; i < parent.datasets.length; i++){
                
                var tam = (parent.datasets[i].dataset.length * self.barWidth);
                var textPos = tam / 2;
                
                var newTam = lastTam + tam;
                
                var barGroup = parent.chartGroup.selectAll("#barGroup" + i)
                                    .attr("width", tam)
                                    .attr("height", parent.gHeight)
                                    .attr("transform", "translate( " + lastTam + ",0)");
                
                var barGroupText = barGroup.select("text")
                                .attr("x", textPos)
                                .attr("y", parent.gHeight + parent.margins.top + 20)
                                .text(parent.datasets[i].name);
                
                var bar = barGroup.selectAll("g")
                                .data(parent.datasets[i].dataset);
                
                var transition = d3.transition().duration(750);

                bar.transition(transition)
                    .attr("transform", function(d, idx){return "translate( " + idx * self.barWidth + ", 0)";})
                    .attr("class", "barElement");
                
                bar.select("rect")
                    .transition(transition)
                    .attr("y", function(d){return parent.yScale(d);})
                    .attr("width", self.barWidth - 1)
                    .attr("height", function(d){return parent.gHeight - parent.yScale(d);})
                    .style("fill", function(d){return self.colorScale(d)});
                
                bar.select("text")
                    .transition(transition)
                    .attr("x", self.barWidth / 2)
                    .attr("y", function (d) {return parent.yScale(d)})
                    .attr("dy", ".85em")
                    .text(function(d){return d;});

                var barEnter = bar.enter()
                    .append("g");
                
                barEnter.transition(transition)
                    .attr("transform", function(d, idx){
                        return "translate( " + idx * self.barWidth + ", 0)";
                    })
                    .attr("class", "barElement");
                
                barEnter.append("rect")
                    .transition(transition)
                    .attr("y", function(d){return parent.yScale(d);})
                    .attr("width", self.barWidth - 1)
                    .attr("height", function(d){return parent.gHeight - parent.yScale(d);})
                    .style("fill", function(d){return self.colorScale(d)});
                
                barEnter.append("text")
                    .transition(transition)
                    .attr("x", self.barWidth / 2)
                    .attr("y", function (d) {return parent.yScale(d)})
                    .attr("dy", ".85em")
                    .attr("class", "text-bar")
                    .text(function(d){return d;});
                
                bar.exit()
                     .transition(transition)
                     .remove();
                
                lastTam += tam;
            }
        }
        
        exports.init = function(showLegend = true, tickFormat = "s", ticksCount = 10,showAxisX = true, showAxisY = true, labelX = "X", labelY = "Y") {
            self.findMinMaxElements();
            parent.createSvg();
            parent.createChartGroup();
            self.createAxis(tickFormat, ticksCount, showAxisX, showAxisY, labelX, labelY, showLegend);
            self.addBrush();
            self.addZoom(showAxisX, showAxisY );
            self.createHistogram();
        }
        
        return exports;
    }
    
    moduleExports.ScatterPlots = function(divId, margins, width, height, datasets)
    {
        var self = this;
        var exports = {};
        
        //classe pai
        var parent = BaseGraph(divId, margins, width, height, datasets);
        
        //variáveis privadas
        self.zoomY = undefined;
        self.zoomX = undefined;
        self.brush = undefined;
        
        self.minX = 0;
        self.minY = 0;
        self.maxX = 100;
        self.maxY = 100;
        
        self.colorScale = undefined;
        self.typeValues = [];
        
        self.newScaleX = undefined;
        self.newScaleY = undefined;
        
        self.lastX0 = undefined;
        self.lastX1 = undefined;
        self.lastY0 = undefined;
        self.lastY1 = undefined;
        
        //FIM
        
        //Funções privadas
        
        self.generateColor = function() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            
            return color;
        }
        
        self.generateRandColors = function(countColor) {
            var colors = [];
            
            for (var i = 0; i < countColor; i++) {
                colors.push(self.generateColor());
            }
            
            return colors;
        }
        
        self.findMinMaxElements = function(maxEnable = true, minEnable = false)
        {
            self.minX = minEnable ? 9999999 : 0;
            self.minY = minEnable ? 9999999 : 0;
            
            self.maxX = maxEnable? -1 : 0;
            self.maxY = maxEnable ? -1 : 0;
            
            var lenthTotal = 0;
            
            for (var i = 0; i < parent.datasets.length; i++)
            {
                if (maxEnable){
                    var auxXMax = d3.max(parent.datasets[i].dataset, function(d){return d.x});
                    
                    var auxYMax = d3.max(parent.datasets[i].dataset, function(d){return d.y});

                    if (auxXMax > self.maxX)
                    {
                        self.maxX = auxXMax;
                    }
                    
                    if (auxYMax > self.maxY)
                    {
                        self.maxY = auxYMax;
                    }
                }
                
                if (minEnable){
                    var auxXMin = d3.min(parent.datasets[i].dataset, function(d){return d.x});
                    
                    var auxYMin = d3.min(parent.datasets[i].dataset, function(d){return d.y});

                    if (auxXMin < self.minX)
                    {
                        self.minX = auxXMin;
                    }
                    
                    if (auxYMin < self.minY)
                    {
                        self.minY = auxYMin;
                    }
                }
                
                lenthTotal += parent.datasets[i].dataset.length;
                
                for (var j = 0; j < parent.datasets[i].dataset.length; j++)
                {
                    var t = parent.datasets[i].dataset[j].t;
                    
                    if (self.typeValues.indexOf(t) == -1)
                        self.typeValues.push(t);
                }
            }
            
            self.typeValues = self.typeValues.sort();
            
            self.colorScale = d3.scaleOrdinal()
                                .domain(self.typeValues)
                                .range(self.generateRandColors(self.typeValues.length));
        }
        
        self.createAxis = function(tickFormat, ticksCount, showAxisX, showAxisY, labelX, labelY, showLegend)
        {
            if (parent.svg != undefined)
	        {
                parent.xScale = d3.scaleLinear().domain([self.minX - 10, self.maxX + 10]).range([0, parent.gWidth]);
                self.newScaleX = parent.xScale;

                parent.yScale = d3.scaleLinear().domain([self.minY - 10, self.maxY + 10]).range([parent.gHeight, 0]);
                self.newScaleY = parent.yScale;
                
                if (showAxisY){
                    var yAxisGroup = parent.svg.append('g') .attr('class', 'yAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.margins.top) + ')');
                    
                    parent.yAxis = d3.axisLeft(parent.yScale); 
                    parent.yAxis.ticks(ticksCount, tickFormat);
                    
                    yAxisGroup.call(parent.yAxis);
                    
                    parent.svg.append("text")
                          .attr("class", "yAxisLabel")
                          .attr("transform", "rotate(-90)")
                          .attr("y", parent.margins.left - 50)
                          .attr("x", -(parent.gHeight / 2))
                          .attr("dy", "1em")
                          .style("text-anchor", "middle")
                          .text(labelY); 
                }

                if (showAxisX){
                    var xAxisGroup = parent.svg.append('g') .attr('class', 'xAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.gHeight + parent.margins.top) + ')'); 

                    parent.xAxis = d3.axisBottom(parent.xScale); 
                    parent.xAxis.ticks(ticksCount, tickFormat);

                    xAxisGroup.call(parent.xAxis);
                    
                    //adicionando label
                    parent.svg.append("text")
                                .attr("class", "xAxisLabel")
                                .attr("transform", "translate( " + (parent.gWidth/2 + parent.margins.left) + ", " + (parent.gHeight + parent.margins.top + 40) + ")" )
                                .style("text-anchor", "middle")
                                .text(labelX);
                }
                
                if (showLegend) {
                    var legend = parent.chartGroup.selectAll(".legend")
                        .data(self.typeValues)
                        .enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function(d, i) { return "translate(" + (parent.gWidth + parent.margins.right - 40) + "," + i * 11 + ")"; });

                    legend.append("rect")
                          .attr("x", - 10)
                          .attr("width", 10)
                          .attr("height", 10)
                          .style("fill", function(d)
                                 {
                                    var t = self.colorScale(d);
                                    return t;
                                });

                    legend.append("text")
                          .attr("x", - 16)
                          .attr("y", 5)
                          .attr("dy", ".35em")
                          .style("text-anchor", "end")
                          .style("font-size", "10px")
                          .text(function(d) { return ("Tipo " + d); });
                }
                
            }
            else
            {
                console.error("Não foi possível criar eixos porque SVG não foi criado");
            }
        }
        
        self.createScatterPlot = function(){
            
            for (var i = 0; i < parent.datasets.length; i++){
                
                var scatterGroup = parent.chartGroup.append("g")
                                                    .attr("id", ("scatter_" + i));
                                        
                var circle = scatterGroup.selectAll("circle")
                                        .data(parent.datasets[i].dataset);

                var transition = d3.transition().duration(750);

                circle.style("fill", function(d) {return self.colorScale(d.t);})
                      .transition(transition)
                      .attr("cx", function(d){ return parent.xScale(d.x);})
                      .attr("cy", function(d){return parent.yScale(d.y);})
                      .attr("r", 5);


                circle.enter()
                    .append("circle")
                        .style("fill", function(d) {return self.colorScale(d.t);})
                        .transition(transition)
                        .attr("cx", function(d){ return parent.xScale(d.x);})
                        .attr("cy", function(d){return parent.yScale(d.y);})
                        .attr("r", 5);

                circle.exit()
                    .transition(transition)
                    .style("fill-opacity", 1e-6)
                    .remove();

                /*circle = g.selectAll("circle")


                var text = g.selectAll("text")
                    .data(self.dataset);

                text.attr("x", function(d, i) { return self.xScale(d[0])+10; })
                    .attr("y", function(d) { return self.yScale(d[1]); })

                text.enter()
                    .append("text")
                        .text(function(d) { return d; })
                        .attr("text-anchor", "left")
                        .attr("x", function(d, i) { return self.xScale(d[0])+10; })
                        .attr("y", function(d) { return self.yScale(d[1]); })
                        .attr("font-family", "sans-serif") 
                        .attr("font-size", "11px")
                        .attr("fill", "red");

                text.exit().remove();

                return circle;*/
                
                
            }
        }

        self.brushed = function() {

            var s = d3.event.selection;
            var x0 = undefined,
                y0 = undefined,
                x1 = undefined,
                y1 = undefined;

            if (s !== undefined) {
                self.lastX0 = x0 = s[0][0];
                self.lastY0 = y0 = s[0][1];
                self.lastX1 = x1 = s[1][0];
                self.lastY1 = y1 = s[1][1];
            }
            else {
                x0 = self.lastX0;
                y0 = self.lastY0;
                x1 = self.lastX1;
                y1 = self.lastY1;
            }

            parent.svg.selectAll('circle')
                .style("fill", function(d) {
                if (self.newScaleX(d.x) >= x0 && self.newScaleX(d.x) <= x1 &&
                    self.newScaleY(d.y) >= y0 && self.newScaleY(d.y) <= y1){
                    return "#ec7014";
                } else {
                    return self.colorScale(d.t);
                }
                });

        }
        
        
        self.addBrush = function() {
            

            self.brush = d3.brush()
                    .on("start brush", self.brushed);

            parent.chartGroup.append("g")
                .attr("class", "brush")
                .call(self.brush);
        }
        
        self.zoomedX = function()
        {
            var t = d3.event.transform;

            var nScaleX = t.rescaleX(parent.xScale);
            parent.xAxis.scale(nScaleX);
            
            self.newScaleX = nScaleX;

            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);

            parent.chartGroup.selectAll('circle')
                                .attr("cx", function(d) { return nScaleX(d.x); });
            
            self.brushed();
        }
                
        self.zoomedY = function()
        {
            var t = d3.event.transform;

            var nScaleY = t.rescaleY(parent.yScale);
            parent.yAxis.scale(nScaleY);
            
            self.newScaleY = nScaleY;

            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);

            parent.chartGroup.selectAll('circle')
                                .attr("cy", function(d) { return nScaleY(d.y); });
                                
            self.brushed();
        }
                
        self.addZoom = function(showAxisX, showAxisY ) {
            
            //X
            if (showAxisX) {
                

                self.zoomX = d3.zoom()
                    .on("zoom", self.zoomedX);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.gWidth)
                    .attr("height", parent.margins.bottom)
                    .attr("transform", "translate(" + parent.margins.left + "," + (parent.margins.top + parent.gHeight) + ")")
                    .call(self.zoomX);
            }
            //FIM
            
            //Y
            if (showAxisY) {
                

                self.zoomY = d3.zoom()
                    .on("zoom", self.zoomedY);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.margins.left)
                    .attr("height", parent.gHeight)
                    .attr("transform", "translate(" + 0 + "," + (parent.margins.top) + ")")
                    .call(self.zoomY);
            }
            //FIM
        }
        
        //Funções que serão exportadas
        
        exports.updateScatterPlot = function(datasets) {
            
            parent.datasets = datasets;
	
	        self.findMinMaxElements();
            
            for (var i = 0; i < parent.datasets.length; i++){
                
                var scatterGroup = parent.chartGroup.selectAll("#" + ("scatter_" + i));
                                        
                var circle = scatterGroup.selectAll("circle")
                                        .data(parent.datasets[i].dataset);

                var transition = d3.transition().duration(750);

                circle.style("fill", function(d) {return self.colorScale(d.t);})
                      .transition(transition)
                      .attr("cx", function(d){ return parent.xScale(d.x);})
                      .attr("cy", function(d){return parent.yScale(d.y);})
                      .attr("r", 5);


                circle.enter()
                    .append("circle")
                        .style("fill", function(d) {return self.colorScale(d.t);})
                        .transition(transition)
                        .attr("cx", function(d){ return parent.xScale(d.x);})
                        .attr("cy", function(d){return parent.yScale(d.y);})
                        .attr("r", 5);

                circle.exit()
                    .transition(transition)
                    .style("fill-opacity", 1e-6)
                    .remove();            
            }
        }
        
        exports.init = function(showLegend = true, tickFormat = "s", ticksCount = 10,showAxisX = true, showAxisY = true, labelX = "X", labelY = "Y") 
        {
            self.findMinMaxElements();
            parent.createSvg();
            parent.createChartGroup();
            self.createAxis(tickFormat, ticksCount, showAxisX, showAxisY, labelX, labelY, showLegend);
            self.addBrush();
            self.addZoom(showAxisX, showAxisY);
            self.createScatterPlot();
        }
        
        return exports;
    }
    
    moduleExports.TimeSeries = function(divId, margins, width, height, datasets)
    {
        var self = this;
        var exports = {};
        
        //classe pai
        var parent = BaseGraph(divId, margins, width, height, datasets);
        
        //variáveis privadas
        self.zoomY = undefined;
        self.zoomX = undefined;
        self.brush = undefined;
        
        self.colorScale = undefined;
        self.typeValues = [];
        
        self.parseTime = d3.timeParse("%Y%m%d");
        self.line = d3.line()
                    //.curve(d3.curveBasis)
                    .x(function(d) { return self.newScaleX(d.date); })
                    .y(function(d) { return self.newScaleY(d.t); });
        
        self.line2 = d3.line()
                    .x(function(d) { return self.newScaleX(d.date); })
                    .y(function(d) { return self.newScaleY(d.t); });
        
        
        self.minX = self.parseTime("20110901");
        self.minY = 0;
        self.maxX = self.parseTime("20171231");
        self.maxY = 100;
        
        self.selectedPaths = [];
        
        self.newScaleX = undefined;
        self.newScaleY = undefined;
        
        self.lastX0 = undefined;
        self.lastX1 = undefined;
        
        //FIM
        
        //Funções privadas
        
        self.generateColor = function() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            
            return color;
        }
        
        self.generateRandColors = function(countColor) {
            var colors = [];
            
            for (var i = 0; i < countColor; i++) {
                colors.push(self.generateColor());
            }
            
            return colors;
        }
        
        self.findMinMaxElements = function(maxEnable = true, minEnable = true)
        {
            self.minX = minEnable ? self.parseTime("20181231") : self.parseTime("20110901");
            self.minY = minEnable? 9999999 : 0;
            
            self.maxY = maxEnable ? -1 : 0;
            self.maxX = maxEnable ? self.parseTime("20000901") : self.parseTime("20171231");
            
            var lengthTotal = 0;
            var oldLength = 0;
            
            for (var i = 0; i < parent.datasets.length; i++)
            {
                if (parent.datasets[i].dataset.formated == false) {
                    //formatando datas
                    for (var j = 0; j < parent.datasets[i].dataset.dates.length; j++){



                            var unformatedDate = parent.datasets[i].dataset.dates[j];
                            var auxDate; 
                            //if (!(unformatedDate instanceof Date)) {
                                auxDate = self.parseTime(unformatedDate);
                                parent.datasets[i].dataset.dates[j] = auxDate;
                            /*}
                            else {
                                auxDate = unformatedDate;
                            }*/

                            for (var c = 0; c < parent.datasets[i].dataset.cities.length; c++) {

                                if (typeof parent.datasets[i].dataset.cities[c].values === 'undefined') {
                                    parent.datasets[i].dataset.cities[c].values = [];
                                }

                                if (typeof parent.datasets[i].dataset.cities[c].id === 'undefined') {
                                    parent.datasets[i].dataset.cities[c].id = ((c+1)+(oldLength));
                                } 

                                var temp = {id: ((c+1)+(oldLength)), date: auxDate, t: parent.datasets[i].dataset.cities[c].temperatures[j]};

                                parent.datasets[i].dataset.cities[c].values.push(temp);
                            }


                    }
                }
                    
                parent.datasets[i].dataset.formated = true;
                
                oldLength += parent.datasets[i].dataset.cities.length;
                
                if (maxEnable){
                    var auxXMax = d3.max(parent.datasets[i].dataset.dates, function(d){return d;});
                    
                    var auxYMax = d3.max(parent.datasets[i].dataset.cities, function(c){return d3.max(c.temperatures, function(d){return d;});});

                    if (auxXMax > self.maxX)
                    {
                        self.maxX = auxXMax;
                    }
                    
                    if (auxYMax > self.maxY)
                    {
                        self.maxY = auxYMax;
                    }
                }
                
                if (minEnable){
                    var auxXMin = d3.min(parent.datasets[i].dataset.dates, function(d){return d;});
                    
                    var auxYMin = d3.min(parent.datasets[i].dataset.cities, function(c){return d3.min(c.temperatures, function(d){return d;});});

                    if (auxXMin < self.minX)
                    {
                        self.minX = auxXMin;
                    }
                    
                    if (auxYMin < self.minY)
                    {
                        self.minY = auxYMin;
                    }
                }
                
                lengthTotal += parent.datasets[i].dataset.cities.length;
            }
            
            self.selectedPaths.length = 0;
            for (var j = 1; j <= lengthTotal; j++){
                self.typeValues.push(j);
                self.selectedPaths.push([]);
            }
            
            self.colorScale = d3.scaleOrdinal()
                                .domain(self.typeValues)
                                .range(self.generateRandColors(lengthTotal));
        }
        
        self.createAxis = function(tickFormat, tickDateFormat, ticksCount, showAxisX, showAxisY, labelX, labelY, showLegend)
        {
            if (parent.svg != undefined)
	        {
                parent.xScale = d3.scaleTime().domain([self.minX, self.maxX]).range([0, parent.gWidth]);
                self.newScaleX = parent.xScale;

                parent.yScale = d3.scaleLinear().domain([self.minY - 10, self.maxY + 10]).range([parent.gHeight, 0]);
                self.newScaleY = parent.yScale;
                
                if (showAxisY){
                    var yAxisGroup = parent.svg.append('g') .attr('class', 'yAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.margins.top) + ')');
                    
                    parent.yAxis = d3.axisLeft(parent.yScale); 
                    parent.yAxis.ticks(ticksCount, tickFormat);
                                
                    
                    yAxisGroup.call(parent.yAxis);
                    
                    parent.svg.append("text")
                          .attr("class", "yAxisLabel")
                          .attr("transform", "rotate(-90)")
                          .attr("y", parent.margins.left - 50)
                          .attr("x", -(parent.gHeight / 2))
                          .attr("dy", "1em")
                          .style("text-anchor", "middle")
                          .text(labelY); 
                }

                if (showAxisX){
                    var xAxisGroup = parent.svg.append('g') .attr('class', 'xAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.gHeight + parent.margins.top) + ')'); 

                    parent.xAxis = d3.axisBottom(parent.xScale); 
                    parent.xAxis.ticks(ticksCount)
                                .tickFormat(d3.timeFormat(tickDateFormat));

                    xAxisGroup.call(parent.xAxis);
                    
                    //adicionando label
                    parent.svg.append("text")
                                .attr("class", "xAxisLabel")
                                .attr("transform", "translate( " + (parent.gWidth/2 + parent.margins.left) + ", " + (parent.gHeight + parent.margins.top + 40) + ")" )
                                .style("text-anchor", "middle")
                                .text(labelX);
                }
                
                if (showLegend) {
                    var legend = parent.chartGroup.selectAll(".legend")
                        .data(self.typeValues)
                        .enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function(d, i) { return "translate(" + (parent.gWidth + parent.margins.right - 40) + "," + i * 11 + ")"; });

                    legend.append("rect")
                          .attr("x", - 10)
                          .attr("width", 10)
                          .attr("height", 10)
                          .style("fill", function(d)
                                 {
                                    var t = self.colorScale(d);
                                    return t;
                                });

                    legend.append("text")
                          .attr("x", - 16)
                          .attr("y", 5)
                          .attr("dy", ".35em")
                          .style("text-anchor", "end")
                          .style("font-size", "10px")
                          .text(function(d) { return ("Tipo " + d); });
                }
                
            }
            else
            {
                console.error("Não foi possível criar eixos porque SVG não foi criado");
            }
        }
        
        self.createTimeSeries = function(){
            
            for (var i = 0; i < parent.datasets.length; i++){
                
                var timeGroup = parent.chartGroup.append("g")
                                                    .attr("id", ("time_" + i))
                                                    ;
                
                var city = timeGroup.selectAll(".city")
                                    .data(parent.datasets[i].dataset.cities)
                                    .enter().append("g")
                                            .attr("class", "city");
                
                var transition = d3.transition().duration(750)
                
                var path = city.append("path")
                                        .attr("class", "line")
                                        .transition(transition)
                                        .attr("d", function(d) { 
                                            return self.line(d.values); 
                                        })
                                        .style("stroke", function(d) { 
                                            var temp = d.id;
                                            
                                            var temp2 = self.colorScale(temp);
                                            
                                            return temp2; 
                                        });

                city.append("text")
                  .datum(function(d) { return {city: d.city, id: d.id, value: d.values[d.values.length - 1]}; })
                  .attr("transform", function(d) { return "translate(" + parent.xScale(d.value.date) + "," + parent.yScale(d.value.t) + ")"; })
                  .attr("x", 3)
                  .attr("dy", "0.35em")
                  .style("font", "10px sans-serif")
                  .style("fill", "black")
                  .text(function(d) { return d.city; });
            }
        }
        
        self.brushed = function()
        {
            var s = d3.event.selection;
            var x0 = undefined;
            var x1 = undefined;

            if (s !== undefined) {
                x0 = self.newScaleX.invert(s[0]);
                self.lastX0 = s[0];
                x1 = self.newScaleX.invert(s[1]);
                self.lastX1 = s[1];
            }
            else {
                x0 = self.newScaleX.invert(self.lastX0);
                x1 = self.newScaleX.invert(self.lastX1);
            }

            parent.svg.selectAll('path.line')
                .each(function(d) {
                    if (d !== null) {

                        self.selectedPaths[d.id - 1].length = 0;
                        var subValues = [];

                        for(var i=0; i < d.values.length; i++) {
                            var val = d.values[i];

                            if (val.date >= x0 && val.date <= x1 ){
                                subValues.push(val);
                            } 
                        }

                        self.selectedPaths[d.id - 1] = subValues;

                    }

                });


        };
        
        self.finished = function(){
                parent.chartGroup.selectAll("path.sel-line")
                                        .data(self.selectedPaths)
                                        .attr("d", function(d) { 
                                            return self.line(d); 
                                        })
                                        .enter()
                                        .append("path")
                                        .attr("class", "sel-line")
                                        .attr("d", function(d) { 
                                                return self.line2(d); 
                                        });
        }
            
        self.addBrush = function() {
            
            self.brush = d3.brushX()
                    .on("start brush", self.brushed)
                    .on("end", self.finished);
            
            //end

            parent.chartGroup.append("g")
                .attr("class", "brush")
                .call(self.brush);
        }
        
        self.zoomedX = function()
        {
            var t = d3.event.transform;

            var nScaleX = t.rescaleX(parent.xScale);
            parent.xAxis.scale(nScaleX);
            
            self.newScaleX = nScaleX;

            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);
            
            var lineScale = d3.line()
                //.curve(d3.curveBasis)
                .x(function(d) { return nScaleX(d.date); })
                .y(function(d) { return self.newScaleY(d.t); });

            parent.chartGroup.selectAll('path.line')
                                .attr("d", function(d) { 
                                    return lineScale(d.values); 
                                });
            
            parent.chartGroup.selectAll('path.sel-line')
                                .attr("d", function(d) { 
                                    return lineScale(d); 
                                });
                                
            self.brushed();
	        self.finished();
        }
                
        self.zoomedY = function()
        {
            var t = d3.event.transform;

            var nScaleY = t.rescaleY(parent.yScale);
            parent.yAxis.scale(nScaleY);
            
            self.newScaleY = nScaleY;

            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);
            
            var lineScale = d3.line()
                //.curve(d3.curveBasis)
                .x(function(d) { return self.newScaleX(d.date); })
                .y(function(d) { return nScaleY(d.t); });

            parent.chartGroup.selectAll('path.line')
                                .attr("d", function(d) { 
                                    return lineScale(d.values); 
                                });
            
            parent.chartGroup.selectAll('path.sel-line')
                                .attr("d", function(d) { 
                                    return lineScale(d); 
                                });
                                
            self.brushed();
	        self.finished();
        }
        
        self.addZoom = function(showAxisX, showAxisY ) {
            
            //X
            if (showAxisX) {
                

                self.zoomX = d3.zoom()
                    .on("zoom", self.zoomedX);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.gWidth)
                    .attr("height", parent.margins.bottom)
                    .attr("transform", "translate(" + parent.margins.left + "," + (parent.margins.top + parent.gHeight) + ")")
                    .call(self.zoomX);
            }
            //FIM
            
            //Y
            if (showAxisY) {

                self.zoomY = d3.zoom()
                    .on("zoom", self.zoomedY);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.margins.left)
                    .attr("height", parent.gHeight)
                    .attr("transform", "translate(" + 0 + "," + (parent.margins.top) + ")")
                    .call(self.zoomY);
            }
            //FIM
        }
        
        //Funções que serão exportadas
        
        exports.updateTimeSeries = function(datasets) {
            
            parent.datasets = datasets;
	
	        self.findMinMaxElements();
            
            for (var i = 0; i < parent.datasets.length; i++){
                
                var timeGroup = parent.chartGroup.selectAll("#" + ("time_" + i));
                                        
                var city = timeGroup.selectAll(".city")
                                        .data(parent.datasets[i].dataset.cities);

                var transition = d3.transition().duration(750);

                city.select("path.line")
                      .transition(transition)
                      .attr("d", function(d) { return self.line(d.values);})
				      .style("stroke", function(d) { var temp = d.id;var temp2 = self.colorScale(temp);return temp2; });
                
                city.select("text")
                      .datum(function(d) { return {city: d.city, id: d.id, value: d.values[d.values.length - 1]}; })
                      .attr("transform", function(d) { return "translate(" + parent.xScale(d.value.date) + "," + parent.yScale(d.value.t) + ")"; })
                      .attr("x", 3)
                      .attr("dy", "0.35em")
                      .style("font", "10px sans-serif")
                      .style("fill", "black")
                      .text(function(d) { return d.city; });
                
                var cityEnter = city.enter()
                                    .append("g")
                                    .attr("class", "city");
                
                cityEnter.append("path")
								.attr("class", "line")
								.transition(transition)
								.attr("d", function(d) { 
									return self.line(d.values); 
								})
								.style("stroke", function(d) { 
									var temp = d.id;
									
									var temp2 = self.colorScale(temp);
									
									return temp2; 
								});

                cityEnter.append("text")
                  .datum(function(d) { return {city: d.city, id: d.id, value: d.values[d.values.length - 1]}; })
                  .attr("transform", function(d) { return "translate(" + parent.xScale(d.value.date) + "," + parent.yScale(d.value.t) + ")"; })
                  .attr("x", 3)
                  .attr("dy", "0.35em")
                  .style("font", "10px sans-serif")
                  .style("fill", "black")
                  .text(function(d) { return d.city; });

                city.exit()
                    .transition(transition)
                    .style("fill-opacity", 1e-6)
                    .remove();            
            }
        }
        
        exports.init = function(showLegend = true, tickFormat = "s", tickDateFormat = "%b %d", ticksCount = 10,showAxisX = true, showAxisY = true, labelX = "X", labelY = "Y") 
        {
            self.findMinMaxElements();
            parent.createSvg();
            parent.createChartGroup();
            self.createAxis(tickFormat, tickDateFormat, ticksCount, showAxisX, showAxisY, labelX, labelY, showLegend);
            self.addBrush();
            self.addZoom(showAxisX, showAxisY);
            self.createTimeSeries();
        }
        
        return exports;
    }
    
    return moduleExports;
    
})();
