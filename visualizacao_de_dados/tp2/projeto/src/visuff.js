var VisUFF = (function() {
    
    'use strict';
    
    var moduleExports = {};
    
    function BaseGraph(divId, margins, width, height, datasets) {
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
        
        exports.newScaleX = undefined;
        exports.newScaleY = undefined;
        
        exports.zoomY = undefined;
        exports.zoomX = undefined;
        
        exports.brush = undefined;
        
        //variáveis que armazenam o min e max de todos os datasets passados para o gráfico
        exports.minX = undefined;
        exports.minY = undefined;
        exports.maxX = undefined;
        exports.maxY = undefined;
        
        exports.lastX0 = undefined;
        exports.lastX1 = undefined;
        exports.lastY0 = undefined;
        exports.lastY1 = undefined;
        
        parent.colorScale = undefined;
        //fim
        
        //funções e métodos que serão herdados
        exports.createSvg = function() {
            exports.svg = d3.select(exports.divId).append("svg")
                .attr("width", exports.gWidth + exports.margins.left + exports.margins.right)
                .attr("height", exports.gHeight + exports.margins.top + exports.margins.bottom);
        };
        
        exports.createChartGroup = function() {
            if (exports.svg != undefined)
            {
                exports.chartGroup = exports.svg.append("g")
                    .attr("id", exports.chartGroupId)
                    .attr("width", exports.gWidth)
                    .attr("height", exports.gHeight)
                    .attr("transform", "translate( " + exports.margins.left + ", " + exports.margins.top + ")");
            }
            else {
                console.error("SVG não foi criado")
            }
        };
        
        exports.destroy = function() {
            d3.select(exports.divId).selectAll('svg').remove();
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
    moduleExports.Histogram = function(divId, margins, width, height, datasets, dataTypename) {
        var self = this;
        var exports = {};
        
        self.dataTypeName = dataTypename;
        
        //formatando dataset antes de passar para o pai
        var formatDataset = function(datasetsOld) {
            var datasetArray = [];
            
            for (var i = 0; i < datasetsOld.length; i++) {
                var dataTypeDataset = datasetsOld[i][self.dataTypeName];
                var vals = d3.values(dataTypeDataset);
                var temp = {name: datasetsOld[i].name, values:vals, id: datasetsOld[i].id};
                datasetArray.push(temp);
            }
            
            return datasetArray;
        }
        
        datasets = formatDataset(datasets);
        
        
        //classe pai
        var parent = BaseGraph(divId, margins, width, height, datasets);
        
        //declaração de variáveis privadas
        self.barWidth = undefined;
        self.rationBarWidth = undefined;
        
        parent.minY = 0;
        parent.maxY = 100;
        
        //código para refatoração
        var x0 = d3.scaleBand()
                   .rangeRound([0, width])
                   .paddingInner(0.1);
        
        var x1 = d3.scaleBand()
                   .padding(0.05);
        
        parent.yScale = d3.scaleLinear()
                  .rangeRound([height, 0]);
        
        
        //Colorbrewer não fornece paleta de cores com mais de 12 cores
        //https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
        self.rangeColor = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#808080", "#FFFFFF", "#000000"]; 
        
        self.domainValues = [];
        for (var i=0; i < self.rangeColor.length; i++)
            self.domainValues.push(i);
        
        
        self.legendNames = [];
        if (self.dataTypeName == "crimes") {
            self.legendNames = CrimeControl.getActiveOcurrences(0).list;
            self.legendNames.push({name: "Total", id: 19});
        } else if (self.dataTypeName == "totals") {
            self.legendNames = CrimeControl.getActiveOcurrences(1).list;
            self.legendNames.push({name: "Total", id: 19});
        } else {
            self.legendNames = CrimeControl.getActiveOcurrences(2).list;
            self.legendNames.push({name: "Total", id: 19});
        }
        
        
        //fim
        
        self.findMinMaxElements = function(maxEnable = true, minEnable = false) {
            parent.minY = minEnable ? 9999999 : 0;
            parent.maxY = maxEnable ? -1 : 0;
            //var lenthTotal = 0;
            
            for (var i = 0; i < parent.datasets.length; i++) {
                var dataTypeDataset = parent.datasets[i];
                
                if (maxEnable){
                    //não consideramos o ultimo elemento do velor, pois é o total e ele é muito grande.
                    
                    var auxMax;
                    if (self.dataTypeName != "totals") {
                        var temp = dataTypeDataset.values.length == 1 ? dataTypeDataset.values : dataTypeDataset.values.slice(0, -1);
                        auxMax = d3.max(temp, function(d){
                            return d.value;
                        });
                    } else {
                        auxMax = d3.max(dataTypeDataset.values, function(d){
                            return d.value;
                        });
                    }

                    if (auxMax > parent.maxY)
                    {
                        parent.maxY = auxMax;
                    }
                }
                
                if (minEnable){
                    
                    var auxMin;
                    if (self.dataTypeName != "totals") {
                        var temp = dataTypeDataset.values.length == 1 ? dataTypeDataset.values : dataTypeDataset.values.slice(0, -1);
                        auxMin = d3.min(temp, function(d){
                            return d.value;
                        });
                    } else {
                        auxMin = d3.min(dataTypeDataset.values, function(d){
                            return d.value;
                        });
                    }

                    if (auxMin < parent.minY)
                    {
                        parent.minY = auxMin;
                    }
                }
                
                //lenthTotal += Object.keys(dataTypeDataset).length;
            }
            
            //self.rationBarWidth = 100.0 / lenthTotal;
            
            parent.colorScale = d3.scaleOrdinal()
                                .domain(self.domainValues)
                                .range(self.rangeColor);            
        }
        
        self.updateLegend = function() {
            self.legendNames = [];
            if (self.dataTypeName == "crimes") {
                self.legendNames = CrimeControl.getActiveOcurrences(0).list;
                self.legendNames.push({name: "Total", id: 19});
            } else if (self.dataTypeName == "totals") {
                self.legendNames = CrimeControl.getActiveOcurrences(1).list;
                self.legendNames.push({name: "Total", id: 19});
            } else {
                self.legendNames = CrimeControl.getActiveOcurrences(2).list;
                self.legendNames.push({name: "Total", id: 19});
            }
            
            var legend = parent.chartGroup.selectAll(".legend")
                        .data(self.legendNames);

            legend.select("rect")
                  .attr("x", - 10)
                  .attr("width", 10)
                  .attr("height", 10)
                  .style("fill", function(d, i){return parent.colorScale(d.id)});

            legend.select("text")
                  .attr("x", - 16)
                  .attr("y", 5)
                  .attr("dy", ".35em")
                  .style("text-anchor", "end")
                  .style("font-size", "10px")
                  .text(function(d) { return d.name; });
            
            var legendEnter = legend.enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function(d, i) { return "translate(" + (parent.gWidth + parent.margins.right) + "," + i * 11 + ")"; });

            legendEnter.append("rect")
                  .attr("x", - 10)
                  .attr("width", 10)
                  .attr("height", 10)
                  .style("fill", function(d, i){return parent.colorScale(d.id)});

            legendEnter.append("text")
                  .attr("x", - 16)
                  .attr("y", 5)
                  .attr("dy", ".35em")
                  .style("text-anchor", "end")
                  .style("font-size", "10px")
                  .text(function(d) { return d.name; });
            
            legend.exit().remove();
        }
        
        self.updateScales = function() {
            
            var teste = parent.datasets.map(function(d) {return d.name;});
            x0.domain(teste);
            x1.domain(self.legendNames.map(function(d) {return d.id;})).rangeRound([0, x0.bandwidth()]);
            
            //parent.newScaleX = parent.xScale;
            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);
            

            parent.yScale.domain([parent.minY, parent.maxY]).nice();
            parent.newScaleY = parent.yScale;
            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);
        }
        
        self.createAxis = function(tickFormat, ticksCountX, ticksCountY, showAxisX, showAxisY, labelX, labelY, showLegend) {
            if (parent.svg != undefined) {
                
                var teste = parent.datasets.map(function(d) {return d.name;});
                x0.domain(teste);
                x1.domain(self.legendNames.map(function(d) {return d.id;})).rangeRound([0, x0.bandwidth()]);
                
                //parent.xScale = d3.scaleLinear().domain([0, 100]).range([0, parent.gWidth]);
                //parent.newScaleX = parent.xScale;
                
                //self.barWidth = parent.xScale(self.rationBarWidth);
                
                parent.yScale.domain([parent.minY, parent.maxY]).nice();
                parent.newScaleY = parent.yScale;
                
                if (showAxisY) {
                    var yAxisGroup = parent.svg.append('g').attr('class', 'yAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.margins.top) + ')');
                    
                    parent.yAxis = d3.axisLeft(parent.yScale);
                    parent.yAxis.ticks(ticksCountY, tickFormat);
                    
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
                    var xAxisGroup = parent.svg.append('g').attr('class', 'xAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.gHeight + parent.margins.top) + ')'); 
                    
                    parent.xAxis = d3.axisBottom(x0); 
                    parent.xAxis.ticks(ticksCountX, tickFormat);
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
                        .data(self.legendNames)
                        .enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function(d, i) { return "translate(" + (parent.gWidth + parent.margins.right) + "," + i * 11 + ")"; });

                    legend.append("rect")
                          .attr("x", - 10)
                          .attr("width", 10)
                          .attr("height", 10)
                          .style("fill", function(d, i){return parent.colorScale(d.id)});

                    legend.append("text")
                          .attr("x", - 16)
                          .attr("y", 5)
                          .attr("dy", ".35em")
                          .style("text-anchor", "end")
                          .style("font-size", "10px")
                          .text(function(d) { return d.name; });
                }
                
            }
            else {
                console.error("Não foi possível criar eixos porque SVG não foi criado");
            }
        }
        
        self.createHistogram = function(){
            
            var lastTam = 0;
                
            /*var group = parent.chartGroup.append("g")
                                            .attr("id", self.dataTypeName + "_group")
                                            .attr("width", exports.gWidth)
                                            .attr("height", exports.gHeight)
                                            .attr("transform", "translate( 0, 0)");*/
            
            var barGroup = parent.chartGroup.selectAll("g.barGroup")
                                .data(parent.datasets)
                                .enter().append("g")
                                    .attr("id", function(d, i) {
                                        return self.dataTypeName + "_barGroup" + d.id;
                                    })
                                    .attr("class", "barGroup")
                                    .attr("transform", function(d) {
                                        return "translate( " + x0(d.name) + ",0)";
                                    });

            var bar = barGroup.selectAll("g")
                            .data(function(d) {return d.values;})
                            .attr("class", "barElement");

            bar = bar.enter()
                    .append("g")
                    .attr("transform", function(d, idx){
                        return "translate( " + x1(d.id) + ", 0)";
                    })
                    .attr("class", "barElement");

            bar.append("rect")
                .attr("y", function(d){return parent.yScale(d.value);})
                .attr("width", x1.bandwidth())
                .attr("height", function(d){return parent.gHeight - parent.yScale(d.value);})
                .style("fill", function(d){return parent.colorScale(d.id)});

            bar.append("text")
                //.attr("x", self.barWidth / 2)
                //.attr("y", function (d) {return parent.yScale(d.value)})
                //.attr("dy", ".85em")
                .attr("class", "text-bar")
                //.style("text-anchor", "start")
                .attr("transform", function(d){
                  var xText = x1.bandwidth() / 2;
                  var yText = parent.yScale(d.value);
                  return "translate(" + xText + "," + yText + ") rotate(-75)";
                })
                .text(function(d){return d.value;});
        }
        
        self.brushed = function() {
            var s = d3.event.selection;

            var posx0 = undefined;
            var posx1 = undefined;

            if (s !== undefined) {
                parent.lastX0 = posx0 = s[0];
                parent.lastX1 = posx1 = s[1];
            }
            else {
                posx0 = parent.lastX0;
                posx1 = parent.lastX1;
            }                

            var barElement = parent.svg.selectAll('.barElement');
            barElement.select("rect").style("fill", function(d, idx) {

                var posParent = d3.select(this.parentNode.parentNode).datum().name;
                var xCoord = x1(d.id) + x0(posParent);

                if (xCoord >= posx0 && xCoord <= posx1){
                    return "#ec7014";
                } else {
                    return parent.colorScale(d.id);
                }
            });
	    }
        
        self.addBrush = function() {
            parent.brush = d3.brushX()
                    .on("start brush", self.brushed);

            parent.chartGroup.append("g")
                .attr("class", "brush")
                .call(parent.brush);
        }
        
        self.zoomedX = function() {
            /*var t = d3.event.transform;
           
            var nScaleX = t.rescaleX(parent.xScale);
            parent.xAxis.scale(nScaleX);
            
            parent.newScaleX = nScaleX;

            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);

            var lastTam = 0;
            
            for (var datasetKey in parent.datasets) {

                var dataTypeDataset = parent.datasets[datasetKey][self.dataTypeName];
                var tam = (Object.keys(dataTypeDataset).length * auxBarWidth);
                
                //var textPos = tam / 2 ;

                var newTextPos = (Object.keys(dataTypeDataset).length * self.rationBarWidth) / 2;
                
                var barGroup = parent.chartGroup.selectAll("#barGroup" + parent.datasets[datasetKey].id)
                                                .attr("transform", "translate( " + lastTam + ",0)");
                
                var text = barGroup.select("text")
                                .attr("x", nScaleX(newTextPos) );
                                
                
                var bar = barGroup.selectAll("g");
                bar.attr("transform", function(d, idx){return "translate( " + (nScaleX(idx * self.rationBarWidth)) + ", 0)";});
                
                bar.select("rect")
                    .attr("width", auxBarWidth - 1);
                
                bar.select('text')
                    .attr("transform", function(d){
                      var xText = auxBarWidth / 2;
                      var yText = parent.newScaleY(d.value);
                      return "translate(" + xText + "," + yText + ") rotate(-75)";
                    });
                     //.attr("x", auxBarWidth/2);
                
                lastTam += tam + auxBarWidth;
            }
            
            self.brushed();*/
        }
                
        self.zoomedY = function() {
            var t = d3.event.transform;
            
            var nScaleY = t.rescaleY(parent.yScale);
            parent.yAxis.scale(nScaleY);

            parent.newScaleY = nScaleY;

            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);

            var barGroup = parent.chartGroup.selectAll("g.barGroup");
            var bar = barGroup.selectAll("g");


           /* bar.append("rect")
            .attr("y", function(d){return parent.yScale(d);})
            .attr("width", self.barWidth - 1)
            .attr("height", function(d){return parent.gHeight - parent.yScale(d);})
            .style("fill", function(d){return parent.colorScale(d)});*/

            bar.select('rect')
                     .attr("y", function(d){return nScaleY(d.value);})
                     .attr("height", function(d){return parent.gHeight - ( nScaleY(d.value) > parent.gHeight ? parent.gHeight : nScaleY(d.value));});


            bar.select('text')
                .attr("transform", function(d){
                      var xText = x1.bandwidth() / 2;
                      var yText = nScaleY(d.value);
                      return "translate(" + xText + "," + yText + ") rotate(-75)";
                    });


            self.brushed();
            
        }
        
        self.addZoom = function(showAxisX, showAxisY ) {
            
            //X
            if (showAxisX) {
                
                parent.zoomX = d3.zoom()
                    .on("zoom", self.zoomedX);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.gWidth)
                    .attr("height", parent.margins.bottom)
                    .attr("transform", "translate(" + parent.margins.left + "," + (parent.margins.top + parent.gHeight) + ")")
                    .call(parent.zoomX);
            }
            //FIM
            
            //Y
            if (showAxisY) {

                parent.zoomY = d3.zoom()
                    .on("zoom", self.zoomedY);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.margins.left)
                    .attr("height", parent.gHeight)
                    .attr("transform", "translate(" + 0 + "," + (parent.margins.top) + ")")
                    .call(parent.zoomY);
            }
            //FIM
        }
        
        //Funções que serão exportadas
        exports.destroyAll = function() {
            parent.destroy();
        }
        
        exports.updateHistogram = function(datasets) {
            
            parent.datasets = formatDataset(datasets);
            
            self.findMinMaxElements();
            
            self.updateLegend();
            
            self.updateScales();
            
            var transition = d3.transition().duration(750);
            
            //var group = parent.chartGroup.select("#" + self.dataTypeName + "_group");
            var barGroup = parent.chartGroup.selectAll("g.barGroup")
                           .data(parent.datasets)
                           .attr("transform", function(d) {
                                return "translate( " + x0(d.name) + ",0)";
                            });
            
            var bar = barGroup.selectAll("g")
                            .data(function(d) {
                                console.log(d);
                                return d.values;
                            });
            
            bar.transition(transition)
               .attr("transform", function(d, idx){
                    return "translate( " + x1(d.id) + ", 0)";
                });
            
            bar.select("rect")
                .attr("y", function(d){return parent.yScale(d.value);})
                .attr("width", x1.bandwidth())
                .attr("height", function(d){return parent.gHeight - parent.yScale(d.value);})
                .style("fill", function(d){return parent.colorScale(d.id)});

            bar.select("text")
                .attr("class", "text-bar")
                .attr("transform", function(d){
                  var xText = x1.bandwidth() / 2;
                  var yText = parent.yScale(d.value);
                  return "translate(" + xText + "," + yText + ") rotate(-75)";
                })
                .text(function(d){return d.value;});
            
            var barEnter = bar.enter().append("g");

            barEnter.transition(transition)
                    .attr("transform", function(d, idx){
                        return "translate( " + x1(d.id) + ", 0)";
                    })
                    .attr("class", "barElement");

            barEnter.append("rect")
                .transition(transition)
                .attr("y", function(d){return parent.yScale(d.value);})
                .attr("width", x1.bandwidth())
                .attr("height", function(d){return parent.gHeight - parent.yScale(d.value);})
                .style("fill", function(d){return parent.colorScale(d.id)});

            barEnter.append("text")
                .transition(transition)
                .attr("class", "text-bar")
                //.style("text-anchor", "start")
                .attr("transform", function(d){
                  var xText = x1.bandwidth() / 2;
                  var yText = parent.yScale(d.value);
                  return "translate(" + xText + "," + yText + ") rotate(-75)";
                })
                .text(function(d){return d.value;});

            bar.exit()
                 .transition(transition)
                 .remove();
            
            
            var barGroupEnter = barGroup.enter().append("g")
                            .attr("id", function(d, i) {
                                return self.dataTypeName + "_barGroup" + d.id;
                            })
                            .attr("class", "barGroup")
                            .attr("transform", function(d) {
                                return "translate( " + x0(d.name) + ",0)";
                            });
            
            bar = barGroupEnter.selectAll("g")
                            .data(function(d) {return d.values;})
                            .attr("class", "barElement");

            bar = bar.enter()
                    .append("g")
                    .attr("transform", function(d, idx){
                        return "translate( " + x1(d.id) + ", 0)";
                    })
                    .attr("class", "barElement");

            bar.append("rect")
                .attr("y", function(d){return parent.yScale(d.value);})
                .attr("width", x1.bandwidth())
                .attr("height", function(d){return parent.gHeight - parent.yScale(d.value);})
                .style("fill", function(d){return parent.colorScale(d.id)});

            bar.append("text")
                //.attr("x", self.barWidth / 2)
                //.attr("y", function (d) {return parent.yScale(d.value)})
                //.attr("dy", ".85em")
                .attr("class", "text-bar")
                //.style("text-anchor", "start")
                .attr("transform", function(d){
                  var xText = x1.bandwidth() / 2;
                  var yText = parent.yScale(d.value);
                  return "translate(" + xText + "," + yText + ") rotate(-75)";
                })
                .text(function(d){return d.value;});
            
            barGroup.exit()
                 .transition(transition)
                 .remove();
        }
        
        exports.init = function(showLegend = true, tickFormat = "s", ticksCountX = 10, ticksCountY = 10,showAxisX = true, showAxisY = true, labelX = "X", labelY = "Y") {
            self.findMinMaxElements();
            parent.createSvg();
            parent.createChartGroup();
            self.createAxis(tickFormat, ticksCountX, ticksCountY, showAxisX, showAxisY, labelX, labelY, showLegend);
            self.addBrush();
            self.addZoom(showAxisX, showAxisY );
            self.createHistogram();
        }
        
        return exports;
    }
    
    moduleExports.ScatterPlots = function(divId, margins, width, height, datasets) {
        var self = this;
        var exports = {};
        
        //classe pai
        var parent = BaseGraph(divId, margins, width, height, datasets);
        
        //variáveis privadas
        
        parent.minX = 0;
        parent.minY = 0;
        parent.maxX = 100;
        parent.maxY = 100;
        
        self.typeValues = [];
        
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
        
        self.findMinMaxElements = function(maxEnable = true, minEnable = false) {
            parent.minX = minEnable ? 9999999 : 0;
            parent.minY = minEnable ? 9999999 : 0;
            
            parent.maxX = maxEnable? -1 : 0;
            parent.maxY = maxEnable ? -1 : 0;
            
            var lenthTotal = 0;
            
            for (var i = 0; i < parent.datasets.length; i++) {
                if (maxEnable){
                    var auxXMax = d3.max(parent.datasets[i].dataset, function(d){return d.x});
                    
                    var auxYMax = d3.max(parent.datasets[i].dataset, function(d){return d.y});

                    if (auxXMax > parent.maxX) {
                        parent.maxX = auxXMax;
                    }
                    
                    if (auxYMax > parent.maxY) {
                        parent.maxY = auxYMax;
                    }
                }
                
                if (minEnable){
                    var auxXMin = d3.min(parent.datasets[i].dataset, function(d){return d.x});
                    
                    var auxYMin = d3.min(parent.datasets[i].dataset, function(d){return d.y});

                    if (auxXMin < parent.minX) {
                        parent.minX = auxXMin;
                    }
                    
                    if (auxYMin < parent.minY) {
                        parent.minY = auxYMin;
                    }
                }
                
                lenthTotal += parent.datasets[i].dataset.length;
                
                for (var j = 0; j < parent.datasets[i].dataset.length; j++) {
                    var t = parent.datasets[i].dataset[j].t;
                    
                    if (self.typeValues.indexOf(t) == -1)
                        self.typeValues.push(t);
                }
            }
            
            self.typeValues = self.typeValues.sort();
            
            parent.colorScale = d3.scaleOrdinal()
                                .domain(self.typeValues)
                                .range(self.generateRandColors(self.typeValues.length));
        }
        
        self.createAxis = function(tickFormat, ticksCount, showAxisX, showAxisY, labelX, labelY, showLegend) {
            if (parent.svg != undefined) {
                parent.xScale = d3.scaleLinear().domain([parent.minX - 10, parent.maxX + 10]).range([0, parent.gWidth]);
                parent.newScaleX = parent.xScale;

                parent.yScale = d3.scaleLinear().domain([parent.minY - 10, parent.maxY + 10]).range([parent.gHeight, 0]);
                parent.newScaleY = parent.yScale;
                
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
                                    var t = parent.colorScale(d);
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
            else {
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

                circle.style("fill", function(d) {return parent.colorScale(d.t);})
                      .transition(transition)
                      .attr("cx", function(d){ return parent.xScale(d.x);})
                      .attr("cy", function(d){return parent.yScale(d.y);})
                      .attr("r", 5);


                circle.enter()
                    .append("circle")
                        .style("fill", function(d) {return parent.colorScale(d.t);})
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
                parent.lastX0 = x0 = s[0][0];
                parent.lastY0 = y0 = s[0][1];
                parent.lastX1 = x1 = s[1][0];
                parent.lastY1 = y1 = s[1][1];
            }
            else {
                x0 = parent.lastX0;
                y0 = parent.lastY0;
                x1 = parent.lastX1;
                y1 = parent.lastY1;
            }

            parent.svg.selectAll('circle')
                .style("fill", function(d) {
                if (parent.newScaleX(d.x) >= x0 && parent.newScaleX(d.x) <= x1 &&
                    parent.newScaleY(d.y) >= y0 && parent.newScaleY(d.y) <= y1){
                    return "#ec7014";
                } else {
                    return parent.colorScale(d.t);
                }
                });

        }
        
        
        self.addBrush = function() {
            

            parent.brush = d3.brush()
                    .on("start brush", self.brushed);

            parent.chartGroup.append("g")
                .attr("class", "brush")
                .call(parent.brush);
        }
        
        self.zoomedX = function() {
            var t = d3.event.transform;

            var nScaleX = t.rescaleX(parent.xScale);
            parent.xAxis.scale(nScaleX);
            
            parent.newScaleX = nScaleX;

            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);

            parent.chartGroup.selectAll('circle')
                                .attr("cx", function(d) { return nScaleX(d.x); });
            
            self.brushed();
        }
                
        self.zoomedY = function() {
            var t = d3.event.transform;

            var nScaleY = t.rescaleY(parent.yScale);
            parent.yAxis.scale(nScaleY);
            
            parent.newScaleY = nScaleY;

            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);

            parent.chartGroup.selectAll('circle')
                                .attr("cy", function(d) { return nScaleY(d.y); });
                                
            self.brushed();
        }
                
        self.addZoom = function(showAxisX, showAxisY ) {
            
            //X
            if (showAxisX) {
                

                parent.zoomX = d3.zoom()
                    .on("zoom", self.zoomedX);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.gWidth)
                    .attr("height", parent.margins.bottom)
                    .attr("transform", "translate(" + parent.margins.left + "," + (parent.margins.top + parent.gHeight) + ")")
                    .call(parent.zoomX);
            }
            //FIM
            
            //Y
            if (showAxisY) {
                

                parent.zoomY = d3.zoom()
                    .on("zoom", self.zoomedY);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.margins.left)
                    .attr("height", parent.gHeight)
                    .attr("transform", "translate(" + 0 + "," + (parent.margins.top) + ")")
                    .call(parent.zoomY);
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

                circle.style("fill", function(d) {return parent.colorScale(d.t);})
                      .transition(transition)
                      .attr("cx", function(d){ return parent.xScale(d.x);})
                      .attr("cy", function(d){return parent.yScale(d.y);})
                      .attr("r", 5);


                circle.enter()
                    .append("circle")
                        .style("fill", function(d) {return parent.colorScale(d.t);})
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
        
        exports.init = function(showLegend = true, tickFormat = "s", ticksCount = 10,showAxisX = true, showAxisY = true, labelX = "X", labelY = "Y") {
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
    
    moduleExports.TimeSeries = function(divId, margins, width, height, datasets, dataTypename, brushCallback, brushFinishCallback, zoomedXCallback, zoomedYCallback, isMonth) {
        var self = this;
        var exports = {};
        
        //classe pai
        var parent = BaseGraph(divId, margins, width, height, datasets);
        
        //variáveis privadas
        self.dataTypeName = dataTypename;
        self.typeValues = [];
        self.selectedPaths = [];
        self.showLegend = true;
        self.isMonth = isMonth;
        
        if (self.isMonth) {
            self.parseTime = d3.timeParse("%Y_%m");
            parent.minX = self.parseTime("2013_1");
            parent.maxX = self.parseTime("2017_12");
        }
        else {
            self.parseTime = d3.timeParse("%Y");
            parent.minX = self.parseTime("2013");
            parent.maxX = self.parseTime("2017");
        }
        
        self.line = d3.line()
                    //.curve(d3.curveBasis)
                    .x(function(d) { return parent.newScaleX(d.d); })
                    .y(function(d) { return parent.newScaleY(d.value); });
        
        
        parent.minY = 0;
        parent.maxY = 100;
        
        self.brushCallback = brushCallback;
        self.brushFinishCallback = brushFinishCallback;
        self.zoomedXCallback = zoomedXCallback;
        self.zoomedYCallback = zoomedYCallback;
        
        //FIM
        
        
        
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
        
        self.findMinMaxElements = function(maxEnable = true, minEnable = true) {
            
            if (self.isMonth) {
                parent.minX = minEnable ? self.parseTime("2018_1") : self.parseTime("2013_1");
                parent.maxX = maxEnable ? self.parseTime("2012_12") : self.parseTime("2017_12");
            } else {
                parent.minX = minEnable ? self.parseTime("2018") : self.parseTime("2013");
                parent.maxX = maxEnable ? self.parseTime("2012") : self.parseTime("2017");
            }
            
            
            parent.minY = minEnable? 9999999 : 0;
            parent.maxY = maxEnable ? -1 : 0;
            
            
            var lengthTotal = 0;
            var oldLength = 0;
            
            self.typeValues = [];
            self.selectedPaths = [];
            
            for (var datasetIndex = 0; datasetIndex < parent.datasets.length; datasetIndex++) {
                var dataTypeDataset = parent.datasets[datasetIndex][self.dataTypeName];
                
                //if (dataTypeDataset.formated === undefined || dataTypeDataset.formated == false) {
                    //formatando datas
                    for (var dateKey in dataTypeDataset) {
                        var objectValue = dataTypeDataset[dateKey];
                        
                        var auxDate = self.parseTime(dateKey);
                        objectValue.d = auxDate;
                        //também funciona
                        //objectValue.d2 = new Date(parseInt(objectValue.year), objectValue.month);

                        /*for (var c = 0; c < parent.datasets[i].dataset.cities.length; c++) {

                            if (typeof parent.datasets[i].dataset.cities[c].values === 'undefined') {
                                parent.datasets[i].dataset.cities[c].values = [];
                            }

                            if (typeof parent.datasets[i].dataset.cities[c].id === 'undefined') {
                                parent.datasets[i].dataset.cities[c].id = ((c+1)+(oldLength));
                            } 

                            var temp = {id: ((c+1)+(oldLength)), date: auxDate, t: parent.datasets[i].dataset.cities[c].temperatures[j]};

                            parent.datasets[i].dataset.cities[c].values.push(temp);
                        }*/
                    }
                
                    //dataTypeDataset.formated = true;
                //}
                    
                //parent.datasets[i].dataset.formated = true;
                
                //oldLength += parent.datasets[i].dataset.cities.length;
                
                if (maxEnable){
                    var auxXMax = d3.max(d3.values(dataTypeDataset), function(d){return d.d;});
                    
                    var auxYMax = d3.max(d3.values(dataTypeDataset), function(d){return d.value;});

                    if (auxXMax > parent.maxX)
                    {
                        parent.maxX = auxXMax;
                    }
                    
                    if (auxYMax > parent.maxY)
                    {
                        parent.maxY = auxYMax;
                    }
                }
                
                if (minEnable){
                    var auxXMin = d3.min(d3.values(dataTypeDataset), function(d){return d.d;});
                    
                    var auxYMin = d3.min(d3.values(dataTypeDataset), function(d){return d.value;});

                    if (auxXMin < parent.minX)
                    {
                        parent.minX = auxXMin;
                    }
                    
                    if (auxYMin < parent.minY)
                    {
                        parent.minY = auxYMin;
                    }
                }
                
                //lengthTotal += Object.keys(dataTypeDataset).length - 1; //menos 1 do formated
                
                self.typeValues.push({id: datasetIndex, name: parent.datasets[datasetIndex].name});
                self.selectedPaths.push([]);
            }
            
            lengthTotal = parent.datasets.length;
            
            /*self.selectedPaths.length = 0;
            for (var j = 1; j <= lengthTotal; j++){
                self.typeValues.push(j);
                self.selectedPaths.push([]);
            }*/
            
            parent.colorScale = d3.scaleOrdinal()
                                .domain(self.typeValues)
                                .range(self.generateRandColors(lengthTotal));
        }
        
        self.createAxis = function(tickFormat, tickDateFormat, ticksCountY, ticksCountX, showAxisX, showAxisY, labelX, labelY, showLegend) {
            self.showLegend = showLegend;
            
            if (parent.svg != undefined) {
                parent.xScale = d3.scaleTime().domain([parent.minX, parent.maxX]).range([0, parent.gWidth]);
                parent.newScaleX = parent.xScale;

                parent.yScale = d3.scaleLinear().domain([parent.minY - 10, parent.maxY + 10]).range([parent.gHeight, 0]);
                parent.newScaleY = parent.yScale;
                
                if (showAxisY){
                    var yAxisGroup = parent.svg.append('g') .attr('class', 'yAxis') .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.margins.top) + ')');
                    
                    parent.yAxis = d3.axisLeft(parent.yScale); 
                    parent.yAxis.ticks(ticksCountY, tickFormat);
                                
                    
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
                    var xAxisGroup = parent.svg.append('g') 
                                           .attr('class', 'xAxis') 
                                           .attr('transform', 'translate(' + parent.margins.left + ',' + (parent.gHeight + parent.margins.top) + ')'); 

                    parent.xAxis = d3.axisBottom(parent.xScale); 
                    parent.xAxis.ticks(ticksCountX)
                                .tickFormat(d3.timeFormat(tickDateFormat));

                    xAxisGroup.call(parent.xAxis);
                    xAxisGroup.selectAll("text")	
                                .style("text-anchor", "end")
                                .attr("dx", "-.8em")
                                .attr("dy", ".15em")
                                .attr("transform", "rotate(-65)");
                    
                    //adicionando label
                    parent.svg.append("text")
                                .attr("class", "xAxisLabel")
                                .attr("transform", "translate( " + (parent.gWidth/2 + parent.margins.left) + ", " + (parent.gHeight + parent.margins.top + 60) + ")" )
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
                                    var t = parent.colorScale(d.id);
                                    return t;
                                });

                    legend.append("text")
                          .attr("x", - 16)
                          .attr("y", 5)
                          .attr("dy", ".35em")
                          .style("text-anchor", "end")
                          .style("font-size", "10px")
                          .text(function(d) { return (d.name); });
                }
                
            }
            else {
                console.error("Não foi possível criar eixos porque SVG não foi criado");
            }
        }
        
        self.updateLegend = function() {
            var legend = parent.chartGroup.selectAll(".legend")
                        .data(self.typeValues);
            
            legend.select("rect")
                  .attr("x", - 10)
                  .attr("width", 10)
                  .attr("height", 10)
                  .style("fill", function(d)
                         {
                            var t = parent.colorScale(d.id);
                            return t;
                        });

            legend.select("text")
                  .attr("x", - 16)
                  .attr("y", 5)
                  .attr("dy", ".35em")
                  .style("text-anchor", "end")
                  .style("font-size", "10px")
                  .text(function(d) { return (d.name); });
            
            
            var legendEnter = legend.enter().append("g")
                          .attr("class", "legend")
                          .attr("transform", function(d, i) { return "translate(" + (parent.gWidth + parent.margins.right - 40) + "," + i * 11 + ")"; });
            
            
            legendEnter.append("rect")
                  .attr("x", - 10)
                  .attr("width", 10)
                  .attr("height", 10)
                  .style("fill", function(d)
                         {
                            var t = parent.colorScale(d.id);
                            return t;
                        });

            legendEnter.append("text")
                  .attr("x", - 16)
                  .attr("y", 5)
                  .attr("dy", ".35em")
                  .style("text-anchor", "end")
                  .style("font-size", "10px")
                  .text(function(d) { return (d.name); });
            
            legend.exit().remove(); 
            
        }
        
        self.updateScales = function() {
            parent.xScale.domain([parent.minX, parent.maxX]);
            parent.newScaleX = parent.xScale;
            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);
            xAxisGroup.selectAll("text")	
                                .style("text-anchor", "end")
                                .attr("dx", "-.8em")
                                .attr("dy", ".15em")
                                .attr("transform", "rotate(-65)");

            parent.yScale.domain([parent.minY - 10, parent.maxY + 10]);
            parent.newScaleY = parent.yScale;
            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);
        }
        
        self.createTimeSeries = function(){
            
            var datasetArray = [];
            for (var datasetIndex = 0; datasetIndex < parent.datasets.length; datasetIndex++) {
                var dataTypeDataset = parent.datasets[datasetIndex][self.dataTypeName];
                var vals = d3.values(dataTypeDataset);
                var temp = {name: parent.datasets[datasetIndex].name, values:vals, id: datasetIndex};
                datasetArray.push(temp);
            }
                
            var timeGroup = parent.chartGroup.append("g")
                                                .attr("id", ("time_zoom"));

            var city = timeGroup.selectAll(".city")
                                .data(datasetArray)
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
                                        var temp2 = parent.colorScale(d.id);

                                        return temp2; 
                                    });

            city.append("text")
              //.datum(function(d) { return {city: d.city, id: d.id, value: d.values[d.values.length - 1]}; })
              .attr("class", "text_serie")
              .attr("transform", function(d) { 
                    var lastValue = d.values.length ? d.values[d.values.length-1] : {d: new Date(2013,0), value: 0}; 
                    return "translate(" + parent.xScale(lastValue.d) + "," + parent.yScale(lastValue.value) + ")"; 
              })
              .attr("x", 3)
              .attr("dy", "0.35em")
              .style("font", "10px sans-serif")
              .style("fill", "black")
              .text(function(d) 
              { 
                 return d.name; 
              });
        }
        
        exports.updateBrush = function(s) {
            var x0 = undefined;
            var x1 = undefined;
            
            if (s !== undefined) {
                x0 = parent.newScaleX.invert(s[0]);
                parent.lastX0 = s[0];
                x1 = parent.newScaleX.invert(s[1]);
                parent.lastX1 = s[1];
            }
            else {
                x0 = parent.newScaleX.invert(parent.lastX0);
                x1 = parent.newScaleX.invert(parent.lastX1);
            }

            parent.svg.selectAll('path.line')
                .each(function(d) {
                    if (d !== null) {

                        self.selectedPaths[d.id].length = 0;
                        var subValues = [];

                        for(var i=0; i < d.values.length; i++) {
                            var val = d.values[i];

                            if (val.d >= x0 && val.d <= x1 ){
                                subValues.push(val);
                            } 
                        }

                        self.selectedPaths[d.id] = subValues;

                    }

                });
        }
        
        self.brushed = function() {
            var s = d3.event.selection;
            
            self.brushCallback(s);
        };
        
        exports.updateFinished = function() {
            parent.chartGroup.selectAll("path.sel-line")
                                        .data(self.selectedPaths)
                                        .attr("d", function(d) { 
                                            return self.line(d); 
                                        })
                                        .enter()
                                        .append("path")
                                        .attr("class", "sel-line")
                                        .attr("d", function(d) { 
                                                return self.line(d); 
                                        });
            
        }
        
        self.finished = function(){
            self.brushFinishCallback(self.selectedPaths);
        }
            
        self.addBrush = function() {
            
            parent.brush = d3.brushX()
                    .on("start brush", self.brushed)
                    .on("end", self.finished);
            
            //end

            parent.chartGroup.append("g")
                .attr("class", "brush")
                .call(parent.brush);
        }
        
        exports.updateZoomedX = function(t) {
            var nScaleX = t.rescaleX(parent.xScale);
            parent.xAxis.scale(nScaleX);
            
            parent.newScaleX = nScaleX;

            var xAxisGroup = parent.svg.select(".xAxis");
            xAxisGroup.call(parent.xAxis);
            xAxisGroup.selectAll("text")	
                                .style("text-anchor", "end")
                                .attr("dx", "-.8em")
                                .attr("dy", ".15em")
                                .attr("transform", "rotate(-65)");
            
            var lineScale = d3.line()
                //.curve(d3.curveBasis)
                .x(function(d) { return nScaleX(d.d); })
                .y(function(d) { return parent.newScaleY(d.value); });

            parent.chartGroup.selectAll('path.line')
                                .attr("d", function(d) { 
                                    return lineScale(d.values); 
                                });
            
            parent.chartGroup.selectAll('path.sel-line')
                                .attr("d", function(d) { 
                                    return lineScale(d); 
                                });
            
            parent.chartGroup.selectAll("text.text_serie")
                  .attr("transform", function(d) { 
                        var lastValue = d.values[d.values.length-1]; 
                        return "translate(" + nScaleX(lastValue.d) + "," + parent.newScaleY(lastValue.value) + ")"; 
                  });
                                
            self.brushed();
	        self.finished();
        }
        
        self.zoomedX = function() {
            var t = d3.event.transform;

            self.zoomedXCallback(t);
        }
        
        exports.updateZoomedY = function(t) {
            var nScaleY = t.rescaleY(parent.yScale);
            parent.yAxis.scale(nScaleY);
            
            parent.newScaleY = nScaleY;

            var yAxisGroup = parent.svg.select(".yAxis");
            yAxisGroup.call(parent.yAxis);
            
            var lineScale = d3.line()
                //.curve(d3.curveBasis)
                .x(function(d) { return parent.newScaleX(d.d); })
                .y(function(d) { return nScaleY(d.value); });

            parent.chartGroup.selectAll('path.line')
                                .attr("d", function(d) { 
                                    return lineScale(d.values); 
                                });
            
            parent.chartGroup.selectAll('path.sel-line')
                                .attr("d", function(d) { 
                                    return lineScale(d); 
                                });
            
            parent.chartGroup.selectAll("text.text_serie")
                  .attr("transform", function(d) { 
                        var lastValue = d.values[d.values.length-1]; 
                        return "translate(" + parent.newScaleX(lastValue.d) + "," + nScaleY(lastValue.value) + ")"; 
                  });
                                
            self.brushed();
	        self.finished();
        }
                
        self.zoomedY = function() {
            var t = d3.event.transform;
            
            self.zoomedYCallback(t);
        }
        
        self.addZoom = function(showAxisX, showAxisY ) {
            
            //X
            if (showAxisX) {
                

                parent.zoomX = d3.zoom()
                    .on("zoom", self.zoomedX);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.gWidth)
                    .attr("height", parent.margins.bottom)
                    .attr("transform", "translate(" + parent.margins.left + "," + (parent.margins.top + parent.gHeight) + ")")
                    .call(parent.zoomX);
            }
            //FIM
            
            //Y
            if (showAxisY) {

                parent.zoomY = d3.zoom()
                    .on("zoom", self.zoomedY);

                parent.svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", parent.margins.left)
                    .attr("height", parent.gHeight)
                    .attr("transform", "translate(" + 0 + "," + (parent.margins.top) + ")")
                    .call(parent.zoomY);
            }
            //FIM
        }
        
        //Funções que serão exportadas
        exports.destroyAll = function() {
            parent.destroy();
        }
        
        exports.updateTimeSeries = function(datasets) {
            
            parent.datasets = datasets;
	
	        self.findMinMaxElements();
            
            self.updateLegend();
            
            self.updateScales();
            
            var datasetArray = [];

            for (var datasetIndex = 0; datasetIndex < parent.datasets.length; datasetIndex++) {
                var dataTypeDataset = parent.datasets[datasetIndex][self.dataTypeName];
                var vals = d3.values(dataTypeDataset);
                var temp = {name: parent.datasets[datasetIndex].name, values:vals, id: datasetIndex};
                datasetArray.push(temp);
            }
                
            var timeGroup = parent.chartGroup.selectAll("#" + ("time_zoom"));

            var city = timeGroup.selectAll(".city")
                                    .data(datasetArray);

            var transition = d3.transition().duration(750);

            city.select("path.line")
                  .transition(transition)
                  .attr("d", function(d) { return self.line(d.values);})
                  .style("stroke", function(d) { var temp2 = parent.colorScale(d.id);return temp2; });

            city.select("text")
                  //.datum(function(d) { return {city: d.city, id: d.id, value: d.values[d.values.length - 1]}; })
                  .attr("class", "text_serie")
                  .attr("transform", function(d) 
                    { 
                        var lastValue = d.values.length ? d.values[d.values.length-1] : {d: new Date(2013,0), value: 0}; 
                        return "translate(" + parent.xScale(lastValue.d) + "," + parent.yScale(lastValue.value) + ")"; 
                    })
                  .attr("x", 3)
                  .attr("dy", "0.35em")
                  .style("font", "10px sans-serif")
                  .style("fill", "black")
                  .text(function(d) { return d.name; });

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
                                var temp2 = parent.colorScale(d.id);

                                return temp2; 
                            });

            cityEnter.append("text")
              //.datum(function(d) { return {city: d.city, id: d.id, value: d.values[d.values.length - 1]}; })
              .attr("class", "text_serie")
              .attr("transform", function(d) { 
                    var lastValue = d.values.length ? d.values[d.values.length-1] : {d: new Date(2013,0), value: 0}; 
                    return "translate(" + parent.xScale(lastValue.d) + "," + parent.yScale(lastValue.value) + ")"; 
                })
              .attr("x", 3)
              .attr("dy", "0.35em")
              .style("font", "10px sans-serif")
              .style("fill", "black")
              .text(function(d) { return d.name; });

            city.exit()
                .transition(transition)
                .style("fill-opacity", 1e-6)
                .remove();    
            
        }
        
        exports.init = function(showLegend = true, tickFormat = "s", tickDateFormat = "%b %y", ticksCountY = 10, ticksCountX = 10,showAxisX = true, showAxisY = true, labelX = "X", labelY = "Y")  {
            self.findMinMaxElements();
            parent.createSvg();
            parent.createChartGroup();
            self.createAxis(tickFormat, tickDateFormat, ticksCountY, ticksCountX, showAxisX, showAxisY, labelX, labelY, showLegend);
            self.addBrush();
            self.addZoom(showAxisX, showAxisY);
            self.createTimeSeries();
        }
        
        return exports;
    }
    
    return moduleExports;
    
})();
